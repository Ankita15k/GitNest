## GitHub OAuth Code Exchange Uses In-Memory Storage Without Rate Limiting — Broken in Multi-Instance Deployment and Vulnerable to Brute Force

### Severity: Critical
### Category: Security (Authentication / Authorization)

## Description

The GitHub OAuth flow in `backend/src/routes/auth.github.routes.js` uses an in-memory `Map` to store exchange codes with a comment saying "Replace with Redis (SETEX) in production" (line 9). This has never been done, creating critical production issues.

### Vulnerability 1 — Broken OAuth Flow in Multi-Instance Deployments

**File:** `backend/src/routes/auth.github.routes.js` (line 10)

```js
// TODO: Replace with Redis (SETEX) in production
const exchangeCodes = new Map();
const EXCHANGE_CODE_TTL = 5 * 60 * 1000; // 5 minutes
```

The exchange codes are stored in a process-local `Map`. In a multi-instance deployment (e.g., multiple Node.js processes behind a load balancer):

1. User clicks "Sign in with GitHub" and hits **Instance A**
2. Instance A stores `exchangeCode -> { jwt, expiresAt }` in its local `Map`
3. User is redirected to GitHub, then back to the callback
4. The callback request hits **Instance B** (round-robin load balancing)
5. Instance B looks up the exchange code in its (empty) local `Map`
6. **Result: "Invalid or expired exchange code" error** → Login fails

This makes GitHub OAuth **completely non-functional** in any horizontally-scaled deployment, which is the standard production configuration.

### Vulnerability 2 — No Rate Limiting on Exchange Endpoint

**File:** `backend/src/routes/auth.github.routes.js` (lines 56-75)

```js
router.post('/exchange', async (req, res) => {
    const { code } = req.body;
    
    if (typeof code !== "string") {
        return res.status(400).json({ error: "Invalid exchange code" });
    }
    
    const entry = exchangeCodes.get(code);
    // ...
});
```

The `/exchange` endpoint has **no rate limiting** and **no input validation** beyond `typeof code !== "string"`. An attacker can:

1. Brute-force the exchange code (256-bit random value — theoretically too large, but implementation flaws may reduce entropy)
2. Make unlimited requests to check if a code exists
3. If the code is found, immediately use the JWT before the legitimate user

The code comment at line 9 says "Replace with Redis (SETEX) in production" but also fails to mention the missing rate limiter. Additionally, there's no constant-time comparison for code lookup — timing analysis could theoretically leak information about code values.

### Vulnerability 3 — No Cleanup on Server Restart

The in-memory `Map` survives only as long as the Node process lives. Any server restart:

1. All pending OAuth flows are invalidated
2. Users who were mid-authentication see "Invalid or expired exchange code"
3. The `unref()` timer (line 20) cleans up expired entries but doesn't survive `SIGKILL`

### Vulnerability 4 — Sweep Timer Uses `.unref()` Making It Non-Blocking

**File:** `backend/src/routes/auth.github.routes.js` (lines 15-22)

```js
const sweepInterval = setInterval(() => {
    const now = Date.now();
    for (const [code, entry] of exchangeCodes) {
        if (entry.expiresAt <= now) {
            exchangeCodes.delete(code);
        }
    }
}, 30_000);
sweepInterval.unref();
```

While `.unref()` is good practice (doesn't keep process alive), the sweep only runs every 30 seconds. Expired codes accumulate in memory between sweeps. With 10,000+ failed OAuth attempts (e.g., during a DDoS), the `Map` could grow unbounded.

### Vulnerability 5 — Missing Request Body Validation

**File:** `backend/src/routes/auth.github.routes.js` (lines 56-75)

The only validation on the exchange request body is `typeof code !== "string"`. There's no validation of:
- Code format (should be a 64-character hex string)
- Code length (should be exactly N bytes)
- No CSRF token validation
- No state parameter validation (the OAuth state parameter is not verified against the stored value)

## Impact

- **Broken authentication:** GitHub OAuth is non-functional in any production deployment with more than one server instance
- **Credential theft:** Missing rate limiting allows brute-force attacks on exchange codes
- **Account takeover:** If an attacker obtains a valid exchange code, they can generate a JWT for the victim's account
- **UX degradation:** Users experience random "Invalid or expired exchange code" errors depending on which server handles their request
- **No audit trail:** Failed exchange attempts are not logged

## Files Affected

1. **`backend/src/routes/auth.github.routes.js`** — Major refactor needed
2. **`backend/src/config/redis.js`** — Need to export Redis client for shared storage
3. **`backend/src/config/passport.js`** — May need adjustments for state parameter validation
4. **`frontend/src/components/auth/Register.jsx`** (line 510) — Hardcoded `http://localhost:5000` OAuth redirect URL

## Suggested Fix

1. **Replace in-memory Map with Redis** using `SET code EX 300` (5-minute TTL) so all instances share the same code store
2. **Add rate limiting** on the `/exchange` endpoint (e.g., 5 requests per IP per minute using `express-rate-limit`)
3. **Add code format validation** — verify the code is exactly 64 hex characters
4. **Add OAuth state parameter validation** — store the state in Redis alongside the code and verify on exchange
5. **Add audit logging** for failed exchange attempts (IP, timestamp, code prefix for debugging)
6. **Add constant-time comparison** for code lookup to prevent timing attacks
7. **Remove hardcoded `localhost:5000`** in Register.jsx — use `VITE_API_URL` environment variable for the OAuth redirect
8. **Add request body validation middleware** — validate the shape and types of the entire request body before processing
