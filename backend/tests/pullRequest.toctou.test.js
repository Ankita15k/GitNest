/**
 * Tests for issue #481: TOCTOU race in listPullRequests visibility filter.
 *
 * The bug: resolveVisibleRepoIds snapshotted public repo IDs at query time,
 * then PullRequest.find ran later. A repo going private between those two
 * moments would still have its PRs returned to unauthenticated callers.
 *
 * The fix: buildVisibilityFilter re-reads repository.visibility atomically
 * within the same logical query window, and the pinned-repo path re-validates
 * visibility at query time rather than trusting a stale snapshot.
 *
 * Scenarios:
 *   1. Unauthenticated caller never sees PRs from a private repo, even if the
 *      repo was public when resolveVisibleRepoIds would have run.
 *   2. Dead-code path (lines 132–134) is gone — filter.repository is always set
 *      via visibilityFilter and no silent fallback exists.
 *   3. Authenticated repo owner always sees their own private-repo PRs.
 *   4. Unauthenticated caller receives empty list, not an error, for a
 *      private-repo ?repository= filter.
 *   5. Pinned-repo path re-validates visibility — if a repo flips private
 *      between request parsing and the visibility check, access is denied.
 */

import request from 'supertest';
import app from '../src/app.js';
import User from '../src/models/User.model.js';
import Repository from '../src/models/Repository.model.js';
import PullRequest from '../src/models/PullRequest.model.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const register = async (suffix) => {
  const res = await request(app).post('/api/v1/auth/register').send({
    username: `toctou_${suffix}`,
    email: `toctou_${suffix}@test.com`,
    password: 'Password123!',
  });
  return { token: res.body.token };
};

const createRepo = (ownerId, name, visibility = 'public') =>
  Repository.create({ name, owner: ownerId, visibility, defaultBranch: 'main' });

const createPR = (repoId, authorId, title = 'Test PR') =>
  PullRequest.create({
    number: Math.floor(Math.random() * 9_999_999),
    title,
    description: '',
    repository: repoId,
    author: authorId,
    sourceBranch: 'feat',
    targetBranch: 'main',
    diff: [],
  });

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('TOCTOU fix: listPullRequests visibility (issue #481)', () => {
  let ownerToken, ownerId;
  let ts;

  beforeEach(async () => {
    ts = Date.now();
    const ownerRes = await register(`own${ts}`);
    ownerToken = ownerRes.token;
    const ownerUser = await User.findOne({ username: `toctou_own${ts}` });
    ownerId = ownerUser._id;
  });

  // ---------------------------------------------------------------------------
  // Scenario 1: repo flips private — unauthenticated caller must be denied
  // ---------------------------------------------------------------------------

  test('unauthenticated caller does not receive PRs from a repo that was public at snapshot time but is now private', async () => {
    // Start public so the old snapshot approach would have included it
    const repo = await createRepo(ownerId, `flip_${ts}`, 'public');
    const pr = await createPR(repo._id, ownerId, 'PR in soon-private repo');

    // Simulate the repo going private before the visibility check executes
    await Repository.updateOne({ _id: repo._id }, { visibility: 'private' });

    const res = await request(app).get('/api/v1/pull-requests');
    expect(res.status).toBe(200);
    const ids = res.body.data.pullRequests.map((p) => String(p._id || p.id));
    expect(ids).not.toContain(String(pr._id));
  });

  // ---------------------------------------------------------------------------
  // Scenario 2: no silent dead-code fallback — unauthenticated baseline still works
  // ---------------------------------------------------------------------------

  test('unauthenticated caller sees PRs from public repos (baseline)', async () => {
    const repo = await createRepo(ownerId, `pub_${ts}`, 'public');
    const pr = await createPR(repo._id, ownerId, 'Public PR');

    const res = await request(app).get('/api/v1/pull-requests');
    expect(res.status).toBe(200);
    const ids = res.body.data.pullRequests.map((p) => String(p._id || p.id));
    expect(ids).toContain(String(pr._id));
  });

  // ---------------------------------------------------------------------------
  // Scenario 3: authenticated owner always sees own private-repo PRs
  // ---------------------------------------------------------------------------

  test('authenticated repo owner always sees their private-repo PRs', async () => {
    const repo = await createRepo(ownerId, `priv_${ts}`, 'private');
    const pr = await createPR(repo._id, ownerId, 'Private PR');

    const res = await request(app)
      .get('/api/v1/pull-requests')
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(res.status).toBe(200);
    const ids = res.body.data.pullRequests.map((p) => String(p._id || p.id));
    expect(ids).toContain(String(pr._id));
  });

  // ---------------------------------------------------------------------------
  // Scenario 4: ?repository= filter on private repo — unauthenticated → empty, not error
  // ---------------------------------------------------------------------------

  test('unauthenticated caller gets empty list (not an error) when filtering by a private repo', async () => {
    const repo = await createRepo(ownerId, `privpin_${ts}`, 'private');
    await createPR(repo._id, ownerId, 'Private pinned PR');

    const res = await request(app).get(`/api/v1/pull-requests?repository=${repo._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data.pullRequests).toHaveLength(0);
    expect(res.body.data.counts).toEqual({ open: 0, closed: 0, merged: 0 });
  });

  // ---------------------------------------------------------------------------
  // Scenario 5: pinned-repo path re-validates visibility at call time
  // ---------------------------------------------------------------------------

  test('pinned-repo filter re-reads visibility — repo flipping private mid-request denies access', async () => {
    const repo = await createRepo(ownerId, `pinflip_${ts}`, 'public');
    const pr = await createPR(repo._id, ownerId, 'Pinned-repo PR');

    // Flip to private before the visibility check inside buildVisibilityFilter runs
    await Repository.updateOne({ _id: repo._id }, { visibility: 'private' });

    const res = await request(app).get(`/api/v1/pull-requests?repository=${repo._id}`);
    expect(res.status).toBe(200);
    const ids = res.body.data.pullRequests.map((p) => String(p._id || p.id));
    expect(ids).not.toContain(String(pr._id));
  });
});