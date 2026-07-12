import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.model.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");
  
  const users = await User.find({});
  console.log(`Analyzing ${users.length} users...`);
  
  for (const u of users) {
    if (!u.username || u.username === "undefined") {
      const email = u.email || "user@gitnest.com";
      const emailPrefix = email.split("@")[0];
      const baseUsername = emailPrefix.replace(/[^a-zA-Z0-9_-]/g, "").toLowerCase() || "user";
      
      let username = baseUsername;
      let userExists = await User.findOne({ username });
      let count = 1;
      while (userExists) {
        username = `${baseUsername}${count}`;
        userExists = await User.findOne({ username });
        count++;
      }
      
      console.log(`Repairing user _id: ${u._id}, email: ${u.email} -> setting username: "${username}"`);
      u.username = username;
      await u.save();
    }
  }
  
  console.log("Migration complete!");
  await mongoose.disconnect();
}

run().catch(console.error);
