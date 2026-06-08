import BranchProtectionRule from '../models/BranchProtectionRule.model.js';
import Repository from '../models/Repository.model.js';

const asStringId = (value) => (value == null ? '' : value.toString());

const isCollaboratorOrOwner = async (userId, repository) => {
  const repo = await Repository.findById(repository._id).select('owner collaborators');
  if (!repo) return false;
  const uid = asStringId(userId);
  if (uid === asStringId(repo.owner)) return true;
  return repo.collaborators?.some(c => asStringId(c) === uid) ?? false;
};

export const evaluateMerge = async ({ repository, pullRequest, userId }) => {
  if (asStringId(userId) === asStringId(repository.owner)) {
    return { allowed: true, isOwnerOverride: true, reasons: [] };
  }

  const rule = await BranchProtectionRule.findOne({
    repositoryId: repository._id,
    branchPattern: pullRequest.targetBranch,
  });

  if (!rule) {
    return { allowed: true, isOwnerOverride: false, reasons: [] };
  }

  const reasons = [];

  if (rule.requiredApprovalsCount > 0) {
    const authorId = asStringId(pullRequest.author?._id || pullRequest.author);
    const approvedReviewerIds = new Set();

    for (const review of pullRequest.reviews || []) {
      if (review.status !== 'approved') continue;

      const reviewerId = asStringId(review.reviewer?._id || review.reviewer || review.author?._id || review.author);
      if (!reviewerId || reviewerId === authorId) continue;

      // Only count approvals from collaborators or the repo owner
      if (await isCollaboratorOrOwner(reviewerId, repository)) {
        approvedReviewerIds.add(reviewerId);
      }
    }

    const approvalCount = approvedReviewerIds.size;

    if (approvalCount < rule.requiredApprovalsCount) {
      reasons.push(
        `At least ${rule.requiredApprovalsCount} approval(s) required (${approvalCount}/${rule.requiredApprovalsCount} granted).`
      );
    }
  }

  if (rule.requireStatusChecks === true) {
    reasons.push('Status checks are required but no CI system is configured.');
  }

  if (reasons.length === 0) {
    return { allowed: true, isOwnerOverride: false, reasons: [] };
  }

  return { allowed: false, isOwnerOverride: false, reasons };
};
