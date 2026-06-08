## Description

The branch protection system is fully **non-functional** despite having a complete evaluator implementation (`branchProtectionEvaluator.service.js`). The `evaluateMerge` function is imported in `pullRequest.controller.js` (line 14) but **never called** anywhere in the merge flow. This means branch protection rules (required approvals, status checks) have zero effect — any merge by the repo owner bypasses all protection rules.

Additionally, the review authorization is broken: any **authenticated user** can submit an approving review on any **public repository** via `POST /:id/reviews`. The route guard `requirePullRequestAccess('readMember')` only restricts for private repos. These approvals are then counted toward the required approval count by `evaluateMerge` — but since the function is never called, even this doesn't matter.

---

## Root Causes

### 1. `backend/src/controllers/pullRequest.controller.js` — Dead import, never invoked

```js
// Line 14 — imported but NEVER called anywhere in the file
import { evaluateMerge } from '../services/branchProtectionEvaluator.service.js';
```

The `mergePullRequest` function (lines 211–275) performs the saga steps (validateOpen → updatePRStatus → gitCheckout → gitMerge) without ever calling `evaluateMerge`. The entire branch protection evaluation is dead code.

### 2. `backend/src/middleware/authMiddleware.js` — `requirePullRequestAccess('readMember')` allows any user to review

The `readMember` role only checks private repo visibility:

```js
if (role === 'readMember' && repository.visibility === 'private' && !isAuthor && !isOwner) {
  return next(new AppError('Not authorized to perform this action', 403));
}
```

This means on **public repos**, any authenticated user can submit `approve`, `changes_requested`, or `comment` reviews — regardless of collaborator status.

### 3. `backend/src/services/branchProtectionEvaluator.service.js` — No collaborator/write-access check

```js
if (review.status !== 'approved') continue;
const reviewerId = ...;
if (!reviewerId || reviewerId === authorId) continue;
approvedReviewerIds.add(reviewerId);
```

The function counts unique approved reviewers but never verifies they have **write/collaborator access** to the repository.

---

## Files Requiring Changes

| File | Changes Needed |
|------|---------------|
| `backend/src/controllers/pullRequest.controller.js` | Call `evaluateMerge()` with the PR and repository before executing the merge saga; reject the merge if rules are not satisfied |
| `backend/src/services/branchProtectionEvaluator.service.js` | Add collaborator/write-access verification for each reviewer; accept the repository document to perform the check |
| `backend/src/middleware/authMiddleware.js` | Add a `repoCollaborator` role to `requirePullRequestAccess` that checks collaborator status; add collaborator field to Repository model or check repository ownership patterns |
| `backend/src/routes/pullRequest.routes.js` | Tighten review route to use `repoCollaborator` instead of `readMember` |
| `backend/src/models/Repository.model.js` | Add a `collaborators` field (array of user ObjectIds with roles) if not already present |

---

## Expected Behavior

- Branch protection rules should be **evaluated** before every merge and **enforced** — merge must be rejected if rules are not satisfied
- Only users with **write/collaborator access** should be able to submit approving reviews
- The existing `evaluateMerge` function should be integrated into the merge flow, not left as dead code
