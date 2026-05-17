import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { sendGitEvent } from '../controllers/producer.js' // From your previous Kafka setup

const router = express.Router();
const REPOS_DIR = path.resolve("path where to store directories");

// 1. CREATE REPOSITORY (Async via Kafka)
router.post('/repositories', async (req, res) => {
    const { repoName, ownerId } = req.body;
    const repoId = `${ownerId}-${repoName}`.toLowerCase();

    // Instantly push to queue to keep API responsive under heavy traffic
    await sendGitEvent('REPO_CREATE', { repoId, repoName, ownerId });

    return res.status(202).json({
        message: 'Repository creation request queued.',
        repoId: repoId
    });
});

// 2. DELETE REPOSITORY (Async via Kafka)
router.delete('/repositories/:repoId', async (req, res) => {
    const { repoId } = req.params;
    await sendGitEvent('REPO_DELETE', { repoId });

    return res.status(202).json({ message: 'Repository deletion request queued.' });
});


// 3. READ: Get Repository Metadata/Details
router.get('/repositories/:repoId', async (req, res) => {
    const { repoId } = req.params;
    const repoPath = path.join(REPOS_DIR, repoId);

    if (!fs.existsSync(repoPath)) {
        return res.status(404).json({ error: 'Repository not found.' });
    }

    return res.status(200).json({ repoId, status: 'active', location: repoPath });
});

// 4. FILE BROWSER: Read files and directories dynamically
router.get('/repositories/:repoId/browse*', async (req, res) => {
    const { repoId } = req.params;
    // Captures everything after /browse (e.g., /browse/src/components -> src/components)
    const subPath = req.params[0] || '';

    const targetPath = path.join(REPOS_DIR, repoId, subPath);

    try {
        // Security check: Prevent Directory Traversal attacks (e.g., ../../)
        if (!targetPath.startsWith(path.join(REPOS_DIR, repoId))) {
            return res.status(403).json({ error: 'Access Denied.' });
        }

        if (!fs.existsSync(targetPath)) {
            return res.status(404).json({ error: 'Path not found.' });
        }

        const stats = await fs.stat(targetPath);

        if (stats.isDirectory()) {
             // If it's a directory, read its contents
            const files = await fs.readdir(targetPath);
            const contents = await Promise.all(

            files.map(async (file) => {
                const fileStats = await fs.stat(path.join(targetPath, file));
                return {
                    name: file,
                    type: fileStats.isDirectory() ? 'directory' : 'file',
                    size: fileStats.size,
                    updatedAt: fileStats.mtime
                };
            })
        );
        return res.status(200).json({ type: 'directory', path: subPath, items: contents });

    } else {
      // If it's a file, read and send the file raw content
        const content = await fs.readFile(targetPath, 'utf-8');
        return res.status(200).json({ type: 'file', path: subPath, content });
    }

} catch (error) {
    console.error('File browsing error:', error);
    return res.status(500).json({ error: 'Failed to browse repository.' });
}
});

export default router;