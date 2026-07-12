import Repository from '../models/Repository.model.js';
import Issue from '../models/Issue.model.js';
import PullRequest from '../models/PullRequest.model.js';

class TeamWorkloadService {
  static async getTeamWorkload(userId, organizationId = null) {
    let repos;

    if (organizationId) {
      repos = await Repository.find({
        $or: [{ owner: userId }, { collaborators: userId }],
      });
    } else {
      repos = await Repository.find({
        $or: [{ owner: userId }, { collaborators: userId }],
      });
    }

    if (repos.length === 0) {
      return [];
    }

    const repoIds = repos.map((r) => r._id);
    const contributors = new Map();

    const issues = await Issue.find({
      repository: { $in: repoIds },
      status: 'open',
      assignee: { $exists: true, $ne: null },
    })
      .populate('assignee', 'username email')
      .lean();

    const prs = await PullRequest.find({
      repository: { $in: repoIds },
      status: 'open',
    })
      .populate('reviewers', 'username email')
      .lean();

    issues.forEach((issue) => {
      const login = issue.assignee.username;
      if (!contributors.has(login)) {
        contributors.set(login, {
          login,
          userId: issue.assignee._id,
          openIssues: 0,
          reviewRequests: 0,
          avgIssueResolutionDays: 0,
          avgReviewDays: 0,
        });
      }
      contributors.get(login).openIssues += 1;
    });

    prs.forEach((pr) => {
      pr.reviewers?.forEach((reviewer) => {
        const login = reviewer.username;
        if (!contributors.has(login)) {
          contributors.set(login, {
            login,
            userId: reviewer._id,
            openIssues: 0,
            reviewRequests: 0,
            avgIssueResolutionDays: 0,
            avgReviewDays: 0,
          });
        }
        contributors.get(login).reviewRequests += 1;
      });
    });

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const closedIssues = await Issue.find({
      repository: { $in: repoIds },
      status: 'closed',
      assignee: { $exists: true, $ne: null },
      closedAt: { $gte: thirtyDaysAgo },
    })
      .populate('assignee', 'username')
      .lean();

    closedIssues.forEach((issue) => {
      const login = issue.assignee.username;
      if (contributors.has(login)) {
        const contributor = contributors.get(login);
        const resolutionTime = (issue.closedAt - issue.createdAt) / (1000 * 60 * 60 * 24);
        contributor.totalIssueResolutionDays = (contributor.totalIssueResolutionDays || 0) + resolutionTime;
        contributor.closedIssueCount = (contributor.closedIssueCount || 0) + 1;
      }
    });

    const mergedPRs = await PullRequest.find({
      repository: { $in: repoIds },
      status: 'merged',
      reviewers: { $exists: true, $ne: [] },
      mergedAt: { $gte: thirtyDaysAgo },
    })
      .populate('reviewers', 'username')
      .lean();

    mergedPRs.forEach((pr) => {
      pr.reviewers?.forEach((reviewer) => {
        const login = reviewer.username;
        if (contributors.has(login)) {
          const contributor = contributors.get(login);
          const reviewTime = (pr.mergedAt - pr.createdAt) / (1000 * 60 * 60 * 24);
          contributor.totalReviewDays = (contributor.totalReviewDays || 0) + reviewTime;
          contributor.reviewedPRCount = (contributor.reviewedPRCount || 0) + 1;
        }
      });
    });

    const result = Array.from(contributors.values()).map((contributor) => ({
      ...contributor,
      avgIssueResolutionDays:
        contributor.closedIssueCount > 0
          ? Math.round((contributor.totalIssueResolutionDays / contributor.closedIssueCount) * 10) / 10
          : 0,
      avgReviewDays:
        contributor.reviewedPRCount > 0
          ? Math.round((contributor.totalReviewDays / contributor.reviewedPRCount) * 10) / 10
          : 0,
    }));

    return result.sort((a, b) => b.openIssues + b.reviewRequests - (a.openIssues + a.reviewRequests));
  }

  static async getContributorDetails(userId, login, organizationId = null) {
    let repos = await Repository.find({
      $or: [{ owner: userId }, { collaborators: userId }],
    });

    if (organizationId) {
      repos = repos.filter((r) => r.organizationId?.equals(organizationId));
    }

    const repoIds = repos.map((r) => r._id);

    const openIssues = await Issue.find({
      repository: { $in: repoIds },
      status: 'open',
      'assignee.username': login,
    }).lean();

    const openPRReviews = await PullRequest.find({
      repository: { $in: repoIds },
      status: 'open',
      'reviewers.username': login,
    }).lean();

    return {
      login,
      openIssues,
      openPRReviews,
      totalWorkload: openIssues.length + openPRReviews.length,
    };
  }
}

export default TeamWorkloadService;
