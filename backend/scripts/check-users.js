import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  const users = await User.find({});
  console.log(`Found ${users.length} users:`);
  for (const u of users) {
    console.log(`- _id: ${u._id}, username: "${u.username}", email: "${u.email}", googleId: "${u.googleId}", githubId: "${u.githubId}"`);
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
