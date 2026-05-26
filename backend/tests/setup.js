import mongoose from 'mongoose';
import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';

dotenv.config({ path: '.env.test' });

jest.setTimeout(30000);

let mongoServer;

beforeAll(async () => {
  if (process.env.MONGO_URI) {
    await mongoose.connect(process.env.MONGO_URI);
    return;
  }

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
  });

  const uri = mongoServer.getUri();

  await mongoose.connect(uri);
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();

  if (mongoServer) {
    await mongoServer.stop();
  }
});
