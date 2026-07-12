## SSRF and Server-Side Code Execution via Unrestricted `git clone` in External Repository Cloning Feature

### Severity: Critical
### Category: Security (SSRF / RCE)

## Description

The `cloneExternalRepository` feature (`backend/src/controllers/clone.controller.js`) executes arbitrary `git clone` commands on the server using user-supplied URLs. This creates multiple critical security vulnerabilities.

### Vulnerability 1 — Server-Side Request Forgery (SSRF)

**File:** `backend/src/services/clone.service.js` (lines 35-38)

```js
const repoPath = path.resolve(process.cwd(), 'repositories', userId, repoName);
await execPromise(`git clone ${repositoryUrl} "${repoPath}"`);
```

The `repositoryUrl` is validated by a permissive regex at `clone.service.js` line 12-14:

```js
const urlRegex = /^https:\/\/.+\/.+\/.+(\.git)?$/i;
```

This regex allows:
- Any domain (including `localhost`, internal IPs, cloud metadata endpoints)
- Any path traversal in the URL path
- No timeout on the `git clone` operation

An attacker can provide a URL like:
- `https://localhost:8080/../secret-config` — Access internal services
- `https://169.254.169.254/latest/meta-data/` — AWS/GCP metadata endpoint
- `https://internal-git.company.local/project/repo.git` — Internal git servers
- `https://github.com/some-user/malicious-repo.git` — Very large repo causing disk exhaustion
- `https://attacker.com/repo.git` — Repo with malicious git hooks that execute on clone

### Vulnerability 2 — Clone Happens Before Database Checks (TOCTOU)

**File:** `backend/src/controllers/clone.controller.js` (lines 9-57)

The execution order is:
1. `cloneRepository(repositoryUrl, req.user.id)` is called — begins `git clone` immediately (line in service: 24-38)
2. Checks if repository already exists (lines 28-41)
3. Creates database record (lines 43-49)

The `git clone` starts BEFORE checking if the repo already exists. If the user clones the same URL twice, two concurrent `git clone` processes run, wasting resources. If the clone succeeds but the DB creation fails, the cloned files remain on disk.

### Vulnerability 3 — No Resource Limits

- No timeout on `git clone` — a clone of the Linux kernel (5+ GB) would consume disk and bandwidth indefinitely
- No disk quota — a user could fill the server's disk by cloning many large repositories
- No concurrency limit — multiple concurrent clone requests could overwhelm server resources

### Vulnerability 4 — Shell Injection via Repository Name

The `repoName` is extracted from the URL but may not be properly sanitized:

```js
const repoName = repositoryUrl.split('/').pop().replace('.git', '');
```

If the URL is crafted with special characters (e.g., `https://github.com/foo/bar;rm -rf /`), the repo name could contain shell metacharacters. While `execPromise` likely uses `exec` not `spawn`, the git URL is passed as an argument — but the `repoPath` is interpolated into the command string, which could be exploited if `repoName` contains spaces or special characters.

## Impact

- **Full SSRF:** Attacker can probe internal network services, cloud metadata endpoints, and internal git servers
- **Resource exhaustion:** Server disk can be filled with cloned repositories; bandwidth can be saturated
- **Persistent files:** Malicious git repositories with hooks can execute code on the server when subsequent git operations occur (pull, fetch, etc.)
- **Data exfiltration:** If the attacker controls a git server, any pushed data from subsequent operations could be exfiltrated
- **No audit trail:** The cloning operation is not logged, so abuse is hard to detect

## Files Affected

1. **`backend/src/controllers/clone.controller.js`** — Fix execution order (check DB first), add resource limits, add logging
2. **`backend/src/services/clone.service.js`** — Add URL domain allowlisting, add timeout, add shell injection protection, add disk quota check, validate repo name
3. **`backend/src/routes/clone.routes.js`** — Add rate limiting on clone endpoint
4. **`backend/src/middleware/rateLimiter.js`** — Ensure rate limiter covers clone endpoint
5. **`backend/src/models/Repository.model.js`** — Add index or unique constraint to prevent duplicate clones

## Suggested Fix

1. **Domain allowlisting:** Only allow cloning from known safe domains (e.g., `github.com`, `gitlab.com`, `bitbucket.org`). Use a strict allowlist, not a blocklist.
2. **Move DB check BEFORE clone:** Check if the repository URL was already cloned by this user before starting the git operation.
3. **Add timeout:** Set a 60-second timeout on `execPromise` for clone operations. Abort and clean up on timeout.
4. **Add disk quota:** Check available disk space before cloning. Reject if below threshold (e.g., 1 GB free).
5. **Add concurrency limiter:** Limit to 2 concurrent clones per user, 10 total.
6. **Sanitize repo name:** Strip all non-alphanumeric characters from the extracted repo name.
7. **Use `spawn` with argument array instead of `exec` with string interpolation** to prevent shell injection.
8. **Add audit logging:** Log every clone attempt (user, URL, timestamp, success/failure, size cloned).
9. **Add clone size tracking:** Record the size of cloned repositories and reject if total exceeds per-user quota.
