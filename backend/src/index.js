import 'dotenv/config';
import http from 'http';
import connectDB from './config/db.js';
import createApp from './app.js';
import connectRedis from './config/redis.js';
import { initSocket } from './socket/index.js';
import { registerSocketSubscribers } from './events/socketSubscribers.js';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not configured. Server cannot start securely.');
  process.exit(1);
}

const app = createApp();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    initSocket(server);
    registerSocketSubscribers();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...', err);
  process.exit(1);
});
