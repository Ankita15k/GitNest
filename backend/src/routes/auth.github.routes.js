import express from "express";
import crypto from "crypto";
import passport from "passport";
import rateLimit from "express-rate-limit";
import generateToken from "../utils/generateToken.js";
import { getRedisClient } from "../config/redis.js";
import { sendError } from "../utils/responseHandlers.js";
import ERROR_CODES from "../constants/errorCodes.js";

const router = express.Router();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const EXCHANGE_CODE_TTL_S = toNumber(process.env.OAUTH_CODE_TTL_S, 300); // 5 minutes
const CODE_PREFIX = "oauth:code:";

// Rate limiter for the /exchange endpoint — 5 attempts per IP per minute
const exchangeLimiter = rateLimit({
  windowMs: toNumber(process.env.OAUTH_EXCHANGE_RATE_LIMIT_WINDOW_MS, 60 * 1000),
  max: toNumber(process.env.OAUTH_EXCHANGE_RATE_LIMIT_MAX, 5),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    sendError(res, {
      statusCode: 429,
      code: ERROR_CODES.RATE_LIMITED,
      message: "Too many exchange requests. Please wait before trying again.",
      requestId: req.requestId,
    });
  },
});

// Helper: constant-time comparison to prevent timing attacks
const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) {
    // Use crypto.timingSafeEqual on fixed-length dummy to avoid leaking length
    const dummy = Buffer.alloc(a.length);
    crypto.timingSafeEqual(dummy, dummy);
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

// Helper: validate exchange code format (64 hex characters)
const isValidCodeFormat = (code) => /^[0-9a-f]{64}$/.test(code);

// Helper: log failed exchange attempts
const logFailedExchange = (ip, codePrefix, reason) => {
  const timestamp = new Date().toISOString();
  console.warn(`[OAUTH] Failed exchange | ip=${ip} code_prefix=${codePrefix} reason=${reason} ts=${timestamp}`);
};

router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  }),
);

router.get(
  "/github/callback",
  (req, res, next) => {
    passport.authenticate("github", {
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login`,
    })(req, res, next);
  },
  async (req, res) => {
    const jwt = generateToken(req.user._id);
    const code = crypto.randomBytes(32).toString("hex");

    const redis = getRedisClient();
    if (redis) {
      // Redis-backed storage — all instances share the same store
      await redis.setex(`${CODE_PREFIX}${code}`, EXCHANGE_CODE_TTL_S, jwt);
    } else {
      // Fallback: use a module-level Map (single-instance dev only)
      // This branch should never be reached in production with REDIS_URL configured.
      console.warn("[OAUTH] Redis unavailable — falling back to in-memory exchange code store");
      const fallbackStore = global.__oauthFallbackStore ||
        (global.__oauthFallbackStore = new Map());
      fallbackStore.set(code, {
        jwt,
        expiresAt: Date.now() + EXCHANGE_CODE_TTL_S * 1000,
      });
    }

    res.redirect(`${process.env.FRONTEND_URL}/oauth-success?code=${code}`);
  },
);

// Frontend POSTs the opaque code here and receives the real JWT in the response body.
// Rate-limited to prevent brute-force attacks.
router.post("/exchange", exchangeLimiter, async (req, res) => {
  const { code } = req.body;
  const clientIp = req.ip || req.connection?.remoteAddress || "unknown";

  if (!code || typeof code !== "string") {
    logFailedExchange(clientIp, "N/A", "missing_code");
    return res.status(400).json({ message: "Missing exchange code" });
  }

  // Validate code format (64 hex characters)
  if (!isValidCodeFormat(code)) {
    logFailedExchange(clientIp, code.substring(0, 8), "invalid_format");
    return res.status(400).json({ message: "Invalid exchange code format" });
  }

 const redis = getRedisClient();
  let jwt = null;

  if (redis) {
    // Single atomic GETDEL — eliminates redundant GET call
    // and closes the race condition window between GET and GETDEL
    const raw = await redis.getdel(`${CODE_PREFIX}${code}`);
    if (raw) {
      jwt = raw;
    }
  } else {
    const fallbackStore = global.__oauthFallbackStore;
    if (fallbackStore) {
      const entry = fallbackStore.get(code);
      if (entry && Date.now() <= entry.expiresAt) {
        fallbackStore.delete(code);
        jwt = entry.jwt;
      } else if (entry) {
        fallbackStore.delete(code);
      }
    }
  }

  if (!jwt) {
    logFailedExchange(clientIp, code.substring(0, 8), "not_found_or_expired");
    return res.status(401).json({ message: "Invalid or expired exchange code" });
  }

  return res.status(200).json({ token: jwt });
});

export default router;