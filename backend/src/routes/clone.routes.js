import express from 'express';
import rateLimit from 'express-rate-limit';

import { protect } from '../middleware/authMiddleware.js';

import {
  cloneExternalRepository,
} from '../controllers/clone.controller.js';
import { sendError } from '../utils/responseHandlers.js';
import ERROR_CODES from '../constants/errorCodes.js';

const router = express.Router();

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const cloneLimiter = rateLimit({
  windowMs: toNumber(process.env.CLONE_RATE_LIMIT_WINDOW_MS, 60 * 60 * 1000),
  max: toNumber(process.env.CLONE_RATE_LIMIT_MAX, 10),
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  handler: (req, res) => {
    sendError(res, {
      statusCode: 429,
      code: ERROR_CODES.RATE_LIMITED,
      message: 'Too many clone requests. Please wait before trying again.',
      requestId: req.requestId,
    });
  },
});

router.post(
  '/clone',
  cloneLimiter,
  protect,
  cloneExternalRepository
);

export default router;
