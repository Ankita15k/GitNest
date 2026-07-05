import Notification from '../models/Notification.model.js';
import ReviewReminderSetting from '../models/ReviewReminderSetting.model.js';
import PullRequest from '../models/PullRequest.model.js';
import Repository from '../models/Repository.model.js';

class ReviewReminderService {
  static async getReminderSetting(repositoryId) {
    return ReviewReminderSetting.findOne({ repository: repositoryId });
  }

  static async updateReminderSetting(repositoryId, settings, userId) {
    return ReviewReminderSetting.findOneAndUpdate(
      { repository: repositoryId },
      { ...settings, createdBy: userId },
      { new: true, upsert: true }
    );
  }

  static async findStalePRsForReminder() {
    const settings = await ReviewReminderSetting.find({ enabled: true })
      .populate('repository')
      .lean();

    const stalePRs = [];

    for (const setting of settings) {
      const thresholdDate = new Date(Date.now() - setting.thresholdHours * 60 * 60 * 1000);

      const prs = await PullRequest.find({
        repository: setting.repository._id,
        status: 'open',
        reviewRequestedAt: { $lt: thresholdDate },
        $expr: {
          $or: [
            { $lt: ['$lastReminderSentAt', { $subtract: [new Date(), setting.thresholdHours * 60 * 60 * 1000] }] },
            { lastReminderSentAt: null },
          ],
        },
      })
        .populate('reviewers', 'email username')
        .populate('author', 'email username')
        .lean();

      stalePRs.push(
        ...prs.map((pr) => ({
          ...pr,
          reminderSetting: setting,
        }))
      );
    }

    return stalePRs;
  }

  static async sendReminder(pr, setting) {
    if (!pr.reviewers || pr.reviewers.length === 0) {
      return [];
    }

    const notificationIds = [];

    for (const reviewer of pr.reviewers) {
      if (setting.excludeAuthors && reviewer._id.equals(pr.author._id)) {
        continue;
      }

      const notification = new Notification({
        recipient: reviewer._id,
        type: 'PULL_REQUEST_REVIEW_REMINDER',
        repository: pr.repository,
        metadata: {
          pullRequestId: pr._id,
          prTitle: pr.title,
          prNumber: pr.number,
          authorName: pr.author.username,
          hoursWaiting: Math.floor((Date.now() - pr.reviewRequestedAt) / (1000 * 60 * 60)),
        },
        message: `Pull request "${pr.title}" by ${pr.author.username} is awaiting your review`,
      });

      await notification.save();
      notificationIds.push(notification._id);
    }

    await PullRequest.updateOne(
      { _id: pr._id },
      {
        lastReminderSentAt: new Date(),
        reminderCount: (pr.reminderCount || 0) + 1,
      }
    );

    return notificationIds;
  }

  static async processAllReminders() {
    const stalePRs = await this.findStalePRsForReminder();
    const results = {
      processed: 0,
      notificationsSent: 0,
      errors: [],
    };

    for (const pr of stalePRs) {
      try {
        const maxReminders = pr.reminderSetting.maxRemindersPerPR;
        if (pr.reminderCount && pr.reminderCount >= maxReminders) {
          continue;
        }

        const notificationIds = await this.sendReminder(pr, pr.reminderSetting);
        results.processed += 1;
        results.notificationsSent += notificationIds.length;
      } catch (error) {
        results.errors.push({
          prId: pr._id,
          error: error.message,
        });
      }
    }

    return results;
  }
}

export default ReviewReminderService;
