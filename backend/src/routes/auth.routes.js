import express from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/authMiddleware.js';
import validateRequest from '../middleware/validateRequest.js';
import { registerValidator, loginValidator } from '../validators/auth.validators.js';
import schemaValidator from '../middleware/schemaValidator.js';
import { contracts } from '../contracts/index.js';
import { sendError } from '../utils/responseHandlers.js';
import ERROR_CODES from '../constants/errorCodes.js';

const router = express.Router();

const toNumber = (value, fallback) => {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const authLimiter = rateLimit({
	windowMs: toNumber(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
	max: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 10),
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		sendError(res, {
			statusCode: 429,
			code: ERROR_CODES.RATE_LIMITED,
			message: 'Too many auth attempts, please try again later',
			requestId: req.requestId,
		});
	},
});

router.post('/register', authLimiter, ...schemaValidator(contracts.auth.register), registerValidator, validateRequest, register);
router.post('/login', authLimiter, ...schemaValidator(contracts.auth.login), loginValidator, validateRequest, login);
router.get('/me', protect, ...schemaValidator(contracts.auth.me), getMe);

export default router;
