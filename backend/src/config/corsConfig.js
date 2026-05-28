/**
 * CORS configuration factory.
 *
 * Reads FRONTEND_URL from the environment. The value may be a single origin
 * or a comma-separated list for staging/production environments that serve the
 * frontend from multiple hosts (e.g. a preview URL alongside the primary domain).
 *
 * Any origin not present in the allowlist is rejected at the preflight stage;
 * the browser never receives a wildcard header regardless of the request path.
 *
 * credentials: true is required for cookie-based sessions and the Authorization
 * header to be forwarded by the browser on cross-origin requests.
 */

const buildAllowedOrigins = () => {
    const raw = process.env.FRONTEND_URL || 'http://localhost:5173';
    return raw
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean);
};

const allowedOrigins = buildAllowedOrigins();

const originValidator = (origin, callback) => {
    // Allow server-to-server requests (no Origin header) and listed origins.
    if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
    }
    callback(new Error(`CORS policy: origin '${origin}' is not allowed`));
};

export const corsOptions = {
    origin: originValidator,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    // Cache preflight response for 10 minutes to reduce OPTIONS round-trips.
    maxAge: 600,
};

/**
 * Sets a minimal set of security response headers that do not require a
 * third-party dependency. These complement CORS by instructing browsers to
 * reject content sniffing, clickjacking, and mixed-content upgrades.
 */
export const setSecurityHeaders = (req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '0');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
};

/** Returns the resolved list of allowed origins. Intended for use in tests. */
export const getAllowedOrigins = () => [...allowedOrigins];
