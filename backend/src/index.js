import 'dotenv/config';
import connectDB from './config/db.js';
import createApp from './app.js';

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET is not configured. Server cannot start securely.');
  process.exit(1);
}

const app = createApp();
const PORT = process.env.PORT || 5000;

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
