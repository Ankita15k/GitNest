## Unhandled Promise Rejections in All Event Subscribers Cause Silent Audit Log and Activity Feed Data Loss

### Severity: High
### Category: Bug (Data Integrity / Stability)

## Description

All event subscriber callbacks in both `auditSubscribers.js` and `subscribers.js` call asynchronous functions without properly handling the returned promises. This creates unhandled promise rejections that cause silent data loss of audit events and activity feed entries.

### Root Cause Pattern

**File:** `backend/src/events/auditSubscribers.js` (lines 5-104)

Every subscriber follows this pattern:

```js
eventEmitter.on('REPO_CREATED', ({ actorId, repositoryId, repoName, visibility }) => {
    try {
      logAuditEvent({...});  // <-- RETURNS A PROMISE — NOT AWAITED
    } catch (error) {
      devLog("Audit log failed:", error);
    }
});
```

The `logAuditEvent` function is async (it calls `AuditLog.create()` which returns a Promise), but the event handler:

1. Does **NOT** `await` the call — the promise is fire-and-forget
2. The `try/catch` only catches **synchronous** errors — if `logAuditEvent` rejects, the rejection is unhandled
3. In Node.js, unhandled promise rejections **will terminate the process** in future versions (they already cause deprecation warnings in Node 16+)

### Same Pattern in `subscribers.js`

**File:** `backend/src/events/subscribers.js` (lines 1-63)

```js
eventEmitter.on('USER_FOLLOWED', async ({ actorId, targetId, targetUsername }) => {
  await logActivitySafely({...});
});
```

While the callback here IS declared `async` and DOES use `await`, the `EventEmitter.on()` method does **NOT** await the returned promise. EventEmitter is synchronous — it invokes the callback and discards the returned promise. If `logActivitySafely` throws or rejects (e.g., database connection failure), the rejection is unhandled.

### Complete List of Affected Subscribers

**auditSubscribers.js** (all 10+ subscribers):
- `REPO_CREATED` (line 6)
- `REPO_DELETED` (line 19)
- `STAR_CHANGED` (line 31)
- `FORK_CREATED` (line 44)
- `PR_CREATED` (line 57)
- `PR_MERGED` (line 70)
- `PR_CLOSED` (line 83)
- `COLLABORATOR_ADDED` (line 96)
- `COLLABORATOR_REMOVED` (line 108)
- `BRANCH_CREATED` / `BRANCH_DELETED` (lines 120-140)

**subscribers.js** (all 6 subscribers):
- `USER_FOLLOWED`
- `REPO_STARRED`
- `FORK_CREATED`
- `PR_OPENED`
- `PR_MERGED`
- `ISSUE_OPENED`

### Why This Is Critical

1. **Audit logs are a security feature** — they track who created/deleted repos, merged PRs, changed permissions. Losing audit events means security incidents cannot be investigated.
2. **Activity feeds are a core feature** — users expect to see their activity feed. Lost activity entries degrade UX and break the social features of the platform.
3. **Silent failure** — there is no monitoring, no fallback, and no indication that data is being lost. A database outage could silently erase all audit logging until someone notices the activity feeds are empty.
4. **Process termination risk** — Node.js treats unhandled rejections as deprecated. Future versions will terminate the process, causing downtime.

## Impact

- Complete loss of audit trail for security events during any database write failure
- Activity feed entries silently dropped when database is under load or experiencing transient failures
- No observability — operators have no way to know audit logging has failed
- Process crash risk in future Node.js versions

## Files Affected

1. **`backend/src/events/auditSubscribers.js`** — Refactor all ~12 subscribers to properly handle async errors
2. **`backend/src/events/subscribers.js`** — Refactor all ~6 subscribers to properly handle async errors
3. **`backend/src/utils/auditLogger.js`** (or wherever `logAuditEvent` is defined) — Add error logging to the function itself as a defense-in-depth measure
4. **`backend/src/utils/activityLogger.js`** (or wherever `logActivitySafely` is defined) — Same defense-in-depth

## Suggested Fix

1. **Convert all handlers to use `.catch()` pattern:**
```js
eventEmitter.on('REPO_CREATED', (payload) => {
    logAuditEvent({...}).catch(err => {
        devLog("Audit log failed:", err);
        // Optionally: send to error tracking service
    });
});
```

2. **Alternatively, create a wrapper function:**
```js
function safeEmit(handler) {
    return (...args) => {
        Promise.resolve(handler(...args)).catch(err => {
            devLog("Event handler failed:", err);
        });
    };
}
```

3. **Add a global unhandled rejection handler** as a safety net (should not be the only fix):
```js
process.on('unhandledRejection', (reason, promise) => {
    devLog('Unhandled Rejection at:', promise, 'reason:', reason);
    // Send alert to monitoring system
});
```

4. **Add retry logic** to `logAuditEvent` and `logActivitySafely` — transient database failures should not cause permanent data loss. Use a retry with exponential backoff (3 attempts).
