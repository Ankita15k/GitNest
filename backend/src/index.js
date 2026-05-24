import 'dotenv/config';
if (!process.env.JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Refusing to start.');
}

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import connectDB from './config/db.js';
import { corsOptions, setSecurityHeaders } from './config/corsConfig.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import healthRoute from './routes/health.route.js';
import AppError from './utils/AppError.js';
import errorHandler from './middleware/errorHandler.js';
import repositoryRoutes from './routes/repository.routes.js';
import activityRoutes from './routes/activity.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

// A single, properly configured CORS middleware.
// corsOptions restricts the allowed origin to FRONTEND_URL (or localhost:5173)
// and preserves credentials support. No wildcard fallback is registered.
app.use(cors(corsOptions));
app.use(setSecurityHeaders);

// Limit request body size to prevent payload-based DoS attacks.
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Global rate limiter applied to all /api/v1 routes.
// Per-route limiters (e.g. on /auth) may be stricter; this acts as a backstop.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: parseInt(process.env.API_RATE_LIMIT || '200', 10),
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Routes
app.use('/health', healthRoute);
app.use('/api/v1', apiLimiter);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/repositories', repositoryRoutes);
app.use('/api/v1/activities', activityRoutes);

// 404 handler — must be registered after all route handlers.
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Centralized error handler — must be the last middleware registered.
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
