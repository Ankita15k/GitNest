import eventEmitter from './eventEmitter.js';
import { getIO } from '../socket/index.js';
import Notification from '../models/Notification.model.js';
import Repository from '../models/Repository.model.js';
import PullRequest from '../models/PullRequest.model.js';

const resolveTargetUser = async (event, data) => {
  switch (event) {
    case 'USER_FOLLOWED':
      return data.targetId?.toString();

    case 'REPOSITORY_STARRED':
    case 'REPOSITORY_FORKED': {
      if (!data.repoId) return null;
      const repo = await Repository.findById(data.repoId).select('owner').lean();
      return repo?.owner?.toString();
    }

    case 'PULL_REQUEST_MERGED': {
      if (!data.repoId || !data.prNumber) return null;
      const pr = await PullRequest.findOne({
        repository: data.repoId,
        number: data.prNumber,
      }).select('author').lean();
      return pr?.author?.toString();
    }

    default:
      return null;
  }
};

const buildMessage = (event, data) => {
  switch (event) {
    case 'USER_FOLLOWED':
      return `${data.actorUsername || 'Someone'} started following you`;
    case 'REPOSITORY_STARRED':
      return `${data.actorUsername || 'Someone'} starred ${data.repoName || 'your repository'}`;
    case 'REPOSITORY_FORKED':
      return `${data.actorUsername || 'Someone'} forked ${data.repoName || 'your repository'}`;
    case 'PULL_REQUEST_MERGED':
      return `Pull request #${data.prNumber} ${data.prTitle || ''} was merged`;
    default:
      return 'New notification';
  }
};

export const registerSocketSubscribers = () => {
  const notificationEvents = [
    'USER_FOLLOWED',
    'REPOSITORY_STARRED',
    'REPOSITORY_FORKED',
    'PULL_REQUEST_MERGED',
  ];

  notificationEvents.forEach((event) => {
    eventEmitter.on(event, async (data) => {
      try {
        const targetUserId = await resolveTargetUser(event, data);
        if (!targetUserId) return;

        const recipientId = targetUserId.toString();

        const notification = await Notification.create({
          recipient: recipientId,
          type: event,
          actor: data.actorId,
          repository: data.repoId,
          message: buildMessage(event, data),
          metadata: data,
        });

        const populated = await Notification.findById(notification._id)
          .populate('actor', 'username avatarUrl')
          .lean();

        const io = getIO();
        io.to(`user:${recipientId}`).emit('notification', populated);
      } catch (err) {
        console.error(`Socket notification error [${event}]:`, err.message);
      }
    });
  });
};
