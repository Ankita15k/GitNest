import fs from 'fs';
import path from 'path';
import dns from 'dns';
import simpleGit from 'simple-git';

// RFC-5735 / RFC-4193 private, loopback, link-local, and multicast ranges
// that must never be the target of a server-side git clone.
const BLOCKED_PREFIXES = [
  '0.',
  '10.',
  '127.',
  '169.254.',
  '172.16.', '172.17.', '172.18.', '172.19.',
  '172.20.', '172.21.', '172.22.', '172.23.',
  '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
  '192.168.',
  '198.18.', '198.19.',
  '224.', '225.', '226.', '227.', '228.', '229.',
  '230.', '231.', '232.', '233.', '234.', '235.',
  '236.', '237.', '238.', '239.',
  '240.',
  '255.',
];

const BLOCKED_EXACT = new Set(['::1', '::ffff:127.0.0.1', 'fe80']);

/**
 * Resolves the hostname of the given URL to an IP address and throws if it
 * falls within any private / internal range. This prevents SSRF via git clone.
 *
 * @param {string} repositoryUrl - validated https:// URL
 * @throws {Error} when the resolved IP is an internal address
 */
const assertNotInternalHost = async (repositoryUrl) => {
  const { hostname } = new URL(repositoryUrl);

  // Reject bare IP literals that match blocked prefixes before DNS
  const isBlockedLiteral =
    BLOCKED_PREFIXES.some((prefix) => hostname.startsWith(prefix)) ||
    BLOCKED_EXACT.has(hostname.toLowerCase());

  if (isBlockedLiteral) {
    throw new Error('Cloning from internal or private network addresses is not allowed');
  }

  // Resolve hostname to IP and check again (catches DNS-rebinding and aliased
  // hostnames that point to internal infrastructure)
  let resolvedAddress;
  try {
    const { address } = await dns.promises.lookup(hostname);
    resolvedAddress = address;
  } catch {
    throw new Error('Could not resolve repository hostname');
  }

  const isBlockedResolved =
    BLOCKED_PREFIXES.some((prefix) => resolvedAddress.startsWith(prefix)) ||
    BLOCKED_EXACT.has(resolvedAddress.toLowerCase());

  if (isBlockedResolved) {
    throw new Error('Cloning from internal or private network addresses is not allowed');
  }
};

export const cloneRepository = async (
  repositoryUrl,
  userId
) => {
  const urlPattern = /^https:\/\/.+\/.+\/.+(\\.git)?$/i;

  if (!urlPattern.test(repositoryUrl)) {
    throw new Error('Invalid repository URL');
  }

  // SSRF guard — must run before any network activity
  await assertNotInternalHost(repositoryUrl);

  const repoName = repositoryUrl
    .split('/')
    .pop()
    .replace(/\.git$/i, '');

  const repoPath = path.resolve(
    process.cwd(),
    'repositories',
    userId,
    repoName
  );

  fs.mkdirSync(
    path.dirname(repoPath),
    { recursive: true }
  );

  const git = simpleGit();

  await git.clone(
    repositoryUrl,
    repoPath
  );

  return {
    repoName,
    repoPath,
  };
};