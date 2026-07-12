import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/User.model.js';

const MONGO =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/gitnest';

async function run() {
  try {
    await mongoose.connect(MONGO);
    console.log('Connected to MongoDB');

    const username = process.argv[2] || 'karan';
    const followerName = process.argv[3] || 'follower1';

    const update = {
      avatarUrl: 'https://i.pravatar.cc/150?u=karan',
      bio: 'Full-stack developer and student',
      location: 'City, Country',
    };

    // Create or update user
    const user = await User.findOneAndUpdate(
      { username },
      {
        $set: update,
        $setOnInsert: {
          email: `${username}@example.com`,
          password: 'Password123',
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Create or get follower
    const follower = await User.findOneAndUpdate(
      { username: followerName },
      {
        $setOnInsert: {
          email: `${followerName}@example.com`,
          password: 'Password123',
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    // Update follower relationship concurrently
    await Promise.all([
      User.updateOne(
        { _id: user._id },
        {
          $addToSet: {
            followers: follower._id,
          },
        }
      ),
      User.updateOne(
        { _id: follower._id },
        {
          $addToSet: {
            following: user._id,
          },
        }
      ),
    ]);

    const updatedUser = await User.findById(user._id).lean();

    console.log('Final user document:');
    console.log(JSON.stringify(updatedUser, null, 2));
  } catch (err) {
    console.error('Seeder failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

run();