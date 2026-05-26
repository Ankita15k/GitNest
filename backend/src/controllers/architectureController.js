import fs from 'fs';
import os from 'os';
import path from 'path';
import simpleGit from 'simple-git';
import { analyzeRepository } from '../services/architectureAnalyzer.js';

const CLONE_DIR = path.join(os.tmpdir(), 'gitnest-analysis');

const sanitizeSegment = (value) => value.replace(/[^a-zA-Z0-9._-]/g, '_');

const ensureCloneDir = () => {
  fs.mkdirSync(CLONE_DIR, { recursive: true });
};

export async function analyze(req, res) {
  const { owner, repo } = req.params;

  try {
    ensureCloneDir();

    const safeName = sanitizeSegment(`${owner}-${repo}`);
    const repoPath = path.join(CLONE_DIR, safeName);
    const gitUrl = `https://github.com/${owner}/${repo}.git`;

    if (!fs.existsSync(path.join(repoPath, '.git'))) {
      fs.mkdirSync(repoPath, { recursive: true });
      const git = simpleGit();
      await git.clone(gitUrl, repoPath, ['--depth', '1']);
    }

    const result = await analyzeRepository(repoPath);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

export default { analyze };