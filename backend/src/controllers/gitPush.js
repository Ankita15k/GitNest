import { sendGitEvent } from "./producer.js";

const gitPushWebhook = async (req, res) => {
    const { repoId, userId, commitCount, branch } = req.body;

    await sendGitEvent('GIT_PUSH', { repoId, userId, commitCount, branch });

    return res.status(200).json({message : "Push event received and queued for processing."});
}

export default gitPushWebhook;;