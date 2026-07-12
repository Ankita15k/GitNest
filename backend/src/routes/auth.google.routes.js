import express from "express";
import crypto from "crypto";
import passport from "passport";
import generateToken from "../utils/generateToken.js";
import { getRedisClient } from "../config/redis.js";

const router = express.Router();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const EXCHANGE_CODE_TTL_S = toNumber(process.env.OAUTH_CODE_TTL_S, 300); // 5 minutes
const CODE_PREFIX = "oauth:code:";

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  }),
);

router.get(
  "/google/callback",
  (req, res, next) => {
    // 1. Handle explicit denied consent or other OAuth errors sent directly by Google
    if (req.query.error) {
      const errorMsg = req.query.error_description || req.query.error || "Authentication failed";
      console.warn(`[OAUTH] Google OAuth callback error: ${errorMsg}`);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(errorMsg)}`);
    }

    // 2. Authenticate the request using Passport Strategy
    passport.authenticate("google", { session: false }, async (err, user, info) => {
      if (err) {
        console.error("[OAUTH] Passport Google authentication error:", err);
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(err.message || "Authentication failed")}`,
        );
      }

      if (!user) {
        const infoMsg = info?.message || "User authentication failed";
        console.warn("[OAUTH] Google user not authenticated:", infoMsg);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(infoMsg)}`);
      }

      try {
        // 3. Exchange authenticated user to a JWT and store it temporarily
        const jwt = generateToken(user._id);
        const code = crypto.randomBytes(32).toString("hex");

        const redis = getRedisClient();
        if (redis) {
          await redis.setex(`${CODE_PREFIX}${code}`, EXCHANGE_CODE_TTL_S, jwt);
        } else {
          console.warn("[OAUTH] Redis unavailable — falling back to in-memory exchange code store");
          const fallbackStore = global.__oauthFallbackStore || (global.__oauthFallbackStore = new Map());
          fallbackStore.set(code, {
            jwt,
            expiresAt: Date.now() + EXCHANGE_CODE_TTL_S * 1000,
          });
        }

        return res.redirect(`${process.env.FRONTEND_URL}/oauth-success?code=${code}`);
      } catch (tokenErr) {
        console.error("[OAUTH] Error generating token or saving exchange code:", tokenErr);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent("Failed to establish session")}`);
      }
    })(req, res, next);
  },
);

export default router;
