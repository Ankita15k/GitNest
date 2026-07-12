import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { logAuditEvent } from '../utils/logAuditEvent.js';

const ALLOWED_HOSTS = new Set([
  'github.com',
  'gitlab.com',
  'bitbucket.org',
]);

const CONCURRENCY = {
  perUser: new Map(),
  global: 0,
};

const MAX_PER_USER = 2;
const MAX_GLOBAL = 10;
const CLONE_TIMEOUT_MS = 60_000;
const MIN_DISK_SPACE_BYTES = 1_073_741_824;

function extractRepoName(url) {
  const raw = url.split('/').pop().replace(/\.git$/i, '');
  return raw.replace(/[^a-zA-Z0-9_-]/g, '');
}

function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:') return false;
    const hostname = url.hostname.toLowerCase();
    return ALLOWED_HOSTS.has(hostname) || ALLOWED_HOSTS.has(hostname.replace(/^www\./, ''));
  } catch {
    return false;
  }
}

async function checkDiskSpace(repoPath) {
  return new Promise((resolve, reject) => {
    const isWin = process.platform === 'win32';
    if (isWin) {
      const drive = path.parse(repoPath).root;
      const child = spawn('cmd.exe', ['/c', 'fsutil', 'volume', 'diskfree', drive]);
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => { stdout += d; });
      child.stderr.on('data', (d) => { stderr += d; });
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error(stderr || 'Disk check failed'));
        const match = stdout.match(/Available\s+bytes\s*:\s+(\d+)/i);
        if (!match) return reject(new Error('Could not parse disk space'));
        resolve(BigInt(match[1]));
      });
    } else {
      const child = spawn('df', ['-k', '--output=avail', path.resolve(repoPath, '..')]);
      let stdout = '';
      child.stdout.on('data', (d) => { stdout += d; });
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error('Disk check failed'));
        const lines = stdout.trim().split('\n');
        const kb = parseInt(lines[lines.length - 1], 10);
        if (isNaN(kb)) return reject(new Error('Could not parse disk space'));
        resolve(BigInt(kb) * 1024n);
      });
    }
  });
}

function checkConcurrency(userId) {
  const userCount = CONCURRENCY.perUser.get(userId) || 0;
  if (userCount >= MAX_PER_USER) {
    throw new Error(`Maximum concurrent clones per user (${MAX_PER_USER}) reached`);
  }
  if (CONCURRENCY.global >= MAX_GLOBAL) {
    throw new Error(`Maximum global concurrent clones (${MAX_GLOBAL}) reached`);
  }
}

function incrementConcurrency(userId) {
  CONCURRENCY.perUser.set(userId, (CONCURRENCY.perUser.get(userId) || 0) + 1);
  CONCURRENCY.global += 1;
}

function decrementConcurrency(userId) {
  const current = CONCURRENCY.perUser.get(userId) || 0;
  if (current <= 1) {
    CONCURRENCY.perUser.delete(userId);
  } else {
    CONCURRENCY.perUser.set(userId, current - 1);
  }
  CONCURRENCY.global -= 1;
}

function cloneWithSpawn(repoUrl, repoPath) {
  return new Promise((resolve, reject) => {
    let cancelled = false;
    const timer = setTimeout(() => {
      cancelled = true;
      proc.kill('SIGKILL');
      reject(new Error('Clone timed out'));
    }, CLONE_TIMEOUT_MS);

    const proc = spawn('git', ['clone', repoUrl, repoPath], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d; });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (cancelled) return;
      if (code !== 0) {
        return reject(new Error(`git clone failed: ${stderr.trim() || 'unknown error'}`));
      }
      resolve();
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      if (!cancelled) reject(err);
    });
  });
}

export const cloneRepository = async (repositoryUrl, userId, ipAddress) => {
  if (!isValidUrl(repositoryUrl)) {
    throw new Error('Invalid or disallowed repository URL');
  }

  checkConcurrency(userId);
  const repoName = extractRepoName(repositoryUrl);
  if (!repoName) {
    throw new Error('Could not extract a valid repository name from the URL');
  }

  const repoPath = path.resolve(process.cwd(), 'repositories', userId, repoName);
  const available = await checkDiskSpace(repoPath);
  if (available < MIN_DISK_SPACE_BYTES) {
    throw new Error(`Insufficient disk space: ${(Number(available) / 1_073_741_824).toFixed(2)} GB available, ${(MIN_DISK_SPACE_BYTES / 1_073_741_824).toFixed(0)} GB required`);
  }

  incrementConcurrency(userId);
  fs.mkdirSync(path.dirname(repoPath), { recursive: true });

  try {
    await cloneWithSpawn(repositoryUrl, repoPath);
  } catch (err) {
    decrementConcurrency(userId);
    throw err;
  }

  decrementConcurrency(userId);

  await logAuditEvent({
    actorId: userId,
    actionType: 'repo.clone',
    ipAddress,
    metadata: { repositoryUrl, repoName, repoPath },
  });

  return { repoName, repoPath };
};

export const releaseCloneLock = (userId) => {
  decrementConcurrency(userId);
};
