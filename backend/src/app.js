import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import repositoryRoutes from './routes/repository.routes.js';
import branchProtectionRoutes from './routes/branchProtection.routes.js';
import auditLogRoutes from './routes/auditLog.routes.js';
import activityRoutes from './routes/activity.routes.js';
import pullRequestRoutes from './routes/pullRequest.routes.js';
import architectureRoutes from './routes/architectureRoutes.js';
import repositoryHealthRoutes from './routes/repositoryHealth.routes.js';
import repositoryComplianceRoutes from './routes/repositoryCompliance.routes.js';
import healthRoute from './routes/health.route.js';
import commitHistoryRoutes from './routes/commitHistory.routes.js';
import fileBrowserRoutes from './routes/fileBrowser.routes.js';
import branchRoutes from './routes/branch.routes.js';
import gitRoutes from './routes/git.routes.js';
import searchRoutes from './routes/search.routes.js';
import codeIntelligenceRoutes from './routes/codeIntelligence.routes.js';
import cloneRoutes from './routes/clone.routes.js';
import archiveRoutes from './routes/archive.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';
import swaggerSpec from './config/swagger.js';
import { requestIdMiddleware, attachRequestIdToResponse } from './middleware/requestId.js';
import { sendError } from './utils/responseHandlers.js';
import ERROR_CODES from './constants/errorCodes.js';
import './events/subscribers.js';
import { registerAuditSubscribers } from './events/auditSubscribers.js';

import passport from "passport";
import session from "express-session";

import "./config/passport.js";
import githubAuthRoutes from "./routes/auth.github.routes.js";

registerAuditSubscribers();

const createApp = () => {
  const app = express();

  app.disable("x-powered-by");

  if (process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
  }

  const corsOptions = process.env.CORS_ORIGIN
    ? {
        origin: process.env.CORS_ORIGIN.split(",").map((origin) =>
          origin.trim(),
        ),
      }
    : undefined;

  const bodyLimit = process.env.REQUEST_BODY_LIMIT || "10kb";
  const toNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  };

  const sessionSecret = process.env.SESSION_SECRET || process.env.JWT_SECRET;

  app.use(cors(corsOptions));
  app.use(express.json({ limit: bodyLimit }));
  app.use(express.urlencoded({ extended: false, limit: bodyLimit }));
  app.use(helmet());
  app.use(mongoSanitize());
  app.use(hpp());
  app.use(cookieParser(sessionSecret));
  app.use(requestIdMiddleware);
  app.use(attachRequestIdToResponse);

  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  if (
    process.env.LOG_REQUESTS === "1" ||
    process.env.NODE_ENV === "development"
  ) {
    app.use(morgan("dev"));
  }

  const apiLimiter = rateLimit({
    windowMs: toNumber(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    max: toNumber(process.env.API_RATE_LIMIT_MAX, 200),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      sendError(res, {
        statusCode: 429,
        code: ERROR_CODES.RATE_LIMITED,
        message: "Too many requests, please try again later",
        requestId: req.requestId,
      });
    },
  });

  if (process.env.NODE_ENV !== "test") {
    app.use("/api", apiLimiter);
  }

  app.use('/health', healthRoute);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (req, res) => res.status(200).json(swaggerSpec));
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/repos', repositoryRoutes);
  app.use('/api/v1/repos', branchProtectionRoutes);
  app.use('/api/v1/repos', auditLogRoutes);
  app.use('/api/v1/repositories', repositoryRoutes);
  app.use('/api/v1/architecture', architectureRoutes);
  app.use('/api/v1/users', userRoutes);
  app.use('/api/v1/activities', activityRoutes);
  app.use('/api/v1/pull-requests', pullRequestRoutes);
  app.use('/api/v1/repositories', commitHistoryRoutes);
  app.use('/api/v1/repositories', fileBrowserRoutes);
  app.use('/api/v1/repositories', branchRoutes);
  app.use('/api/v1/repos', gitRoutes);
  app.use('/api/v1/repositories', codeIntelligenceRoutes);
  app.use('/api/v1/repositories', architectureRoutes);
  app.use('/api/v1/repositories', repositoryHealthRoutes);
  app.use('/api/v1/repositories', archiveRoutes);
  app.use('/api/v1/repositories', repositoryComplianceRoutes);
  app.use('/api/v1/search', searchRoutes);
  app.use('/api/v1/auth', githubAuthRoutes);
  app.use('/api/v1/repositories', cloneRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use((req, res, next) => {
    next(
      new AppError(
        `Can't find ${req.originalUrl} on this server!`,
        404,
        ERROR_CODES.NOT_FOUND,
      ),
    );
  });

  app.use(errorHandler);

  return app;
};

export default createApp;
