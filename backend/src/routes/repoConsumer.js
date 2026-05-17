import kafka from '../config/kafkaConfig.js';
import fs from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const consumer = kafka.consumer({ groupId: 'gitNest-repo-crud-group' });
const REPOS_DIR = path.resolve('path of the directories');

// Ensure base directory exists
fs.ensureDirSync(REPOS_DIR);

export const runRepoConsumer = async () => {
    await consumer.connect();
    await consumer.subscribe({ topic: 'git-repo-events', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const event = JSON.parse(message.value.toString());
            const { type, data } = event;

            const repoPath = data?.repoId ? path.join(REPOS_DIR, data.repoId) : null;

            try {
                switch (type) {
                    case 'REPO_CREATE':
                        if (!fs.existsSync(repoPath)) {
                        // Create the directory structure safely
                        await fs.ensureDir(repoPath);

                       // Optional: Initialize it as a bare Git repository if Git is installed
                        execSync(`git init --bare`, { cwd: repoPath });

                        console.log(`📦 Created bare Git repository at: ${repoPath}`);
                    }
                    break;

                case 'REPO_DELETE':
                    if (fs.existsSync(repoPath)) {
                        await fs.remove(repoPath);
                        console.log(`🗑️ Deleted repository filesystem at: ${repoPath}`);
                    }
                    break;

                default:
                    console.log(`ℹ️ Ignored unhandled worker event: ${type}`);
                }
            } catch (err) {
                console.error(`Failed to process filesystem action for ${type}:`, err);
            }
        },
    });
};

runRepoConsumer().catch(console.error);