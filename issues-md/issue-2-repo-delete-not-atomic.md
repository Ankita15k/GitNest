## Description

`deleteRepository` in `repository.controller.js` has a critical atomicity failure: a synchronous `fs.rmSync` call is positioned **before** all database cleanup operations with **no try-catch guard**. If the filesystem deletion fails (EPERM on Windows file locks, EBUSY, disk errors), the exception propagates to the error handler and **none of the database cleanup executes**. The result is a partially-deleted filesystem with a surviving DB record — an orphaned repository.

Furthermore, the database cleanup operations (nullifying `forkedFrom`, pulling from `forks` arrays, deleting Activities and PullRequests) run **without a MongoDB transaction**. If one of these operations fails partway through, the state is permanently inconsistent.

---

## Root Causes

### 1. `backend/src/controllers/repository.controller.js` lines 274–298 — Unguarded `fs.rmSync` blocks DB cleanup

```js
// Line 278 — NO try-catch. If this throws, lines 281-298 NEVER execute.
fs.rmSync(repoPath, { recursive: true, force: true });

// Lines 281-298 — DB cleanup, skipped entirely if rmSync throws
await Repository.updateMany({ forkedFrom: repoId }, { $set: { forkedFrom: null } });
await Repository.updateMany({ forks: repoId }, { $pull: { forks: repoId } });
await Activity.deleteMany({ repository: repoId });
await PullRequest.deleteMany({ repository: repoId });
await repository.deleteOne();
```

The `force: true` flag only suppresses `ENOENT` (file not found). It does **NOT** suppress:
- `EPERM` — permission denied (common on Windows when a process holds a file handle in that directory tree)
- `EBUSY` — resource busy (Windows file locks, antivirus scanning)
- `ENAMETOOLONG` — path exceeds OS limit
- Disk I/O errors

### 2. No transaction for database cleanup — partial failure leaves permanent inconsistency

Even if `fs.rmSync` succeeds, the five DB operations (lines 281–298) are not wrapped in a `session.startTransaction()` / `commitTransaction` block. If `Activity.deleteMany` succeeds but `PullRequest.deleteMany` fails (connection drop, replica set failover), then:
- Fork provenance is already destroyed (step 2 completed)
- Activity records are already deleted (step 4 completed)
- But PullRequest records and the repository document itself survive
- The result is a repo with missing activity history and orphaned fork references

### 3. Race condition: concurrent PR/fork creation during deletion

```
PR/Fork Creation:          Deletion Request:
   |                           |
   |  Read repo (exists)       |
   |                           |  fs.rmSync (filesystem gone)
   |                           |  Nullify forkedFrom (done)
   |  Create PR/fork (DB)      |  ← commits AFTER forkedFrom cleanup
   |                           |  Delete pullRequests (misses this new one)
   |                           |  Delete repo (done)
   |                           |
   Result:                     → PR/fork orphaned, references deleted repo
```

---

## Files Requiring Changes

| File | Changes Needed |
|------|---------------|
| `backend/src/controllers/repository.controller.js` | Wrap `fs.rmSync` in try-catch; on failure, continue with DB cleanup but add cleanup of partial filesystem state; wrap all DB operations in a MongoDB transaction; reorder to delete the repo DB record first, then clean up related records best-effort; use async `fs.promises.rm` with retries instead of synchronous `rmSync` |
| `backend/src/middleware/errorHandler.js` | Ensure `E11000` error messages show the correct field from compound indexes (currently shows `owner` instead of `name` for repo uniqueness violations during concurrent operations) |

---

## Expected Behavior

- If filesystem deletion fails, the operation should still clean up database records (orphan detection should be a separate concern), or the entire operation should be atomic — filesystem AND database succeed or fail together
- If any individual DB cleanup step fails mid-way, a transaction should roll back all prior steps to maintain consistency
- Concurrent PR/fork creation during deletion should be prevented or handled gracefully
