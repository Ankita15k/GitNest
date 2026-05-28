import 'dotenv/config';
import connectDB from './config/db.js';
import createApp from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not configured. Server cannot start securely.');
  process.exit(1);
}

import express from 'express'
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import healthRoute from './routes/health.route.js';
import AppError from './utils/AppError.js';
import errorHandler from './middleware/errorHandler.js';
import swaggerUi from "swagger-ui-express";
import { specs } from "../docs/swagger.js";
import repositoryRoutes from './routes/repository.routes.js';
import activityRoutes from './routes/activity.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;
connectDB();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
// Middleware
app.use(express.json());
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/health', healthRoute);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/repositories', repositoryRoutes);
app.use('/api/v1/activities', activityRoutes);
app.use(errorHandler);

await connectDB();

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect database:', error);
    process.exit(1);
  }
};

startServer();