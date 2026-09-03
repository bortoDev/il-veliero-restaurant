import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

let mongoServer: MongoMemoryServer;

// Set 60s timeout for test lifecycle
jest.setTimeout(60000);

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret-key-veliero-2026';
  process.env.PORT = '5001';
  process.env.UPLOAD_DIR = 'uploads_test';

  // Ensure test upload dir exists
  const testUploadDir = path.resolve(process.cwd(), 'uploads_test');
  if (!fs.existsSync(testUploadDir)) {
    fs.mkdirSync(testUploadDir, { recursive: true });
  }

  // Connect to external test database or in-memory MongoDB
  const externalUri = process.env.TEST_MONGODB_URI || process.env.MONGODB_URI;
  if (externalUri) {
    await mongoose.connect(externalUri, {
      autoIndex: true,
    });
  } else {
    // Initialize in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect Mongoose with autoIndex enabled for unique & TTL index validation
    await mongoose.connect(uri, {
      autoIndex: true,
    });
  }
});

beforeEach(async () => {
  // Clear all collection data before each test for complete test isolation
  if (mongoose.connection.readyState === 1) {
    const collections = mongoose.connection.collections;
    for (const key of Object.keys(collections)) {
      await collections[key].deleteMany({});
    }
  }
});

afterAll(async () => {
  // Disconnect Mongoose and stop in-memory server
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }

  // Clean up test upload directory
  const testUploadDir = path.resolve(process.cwd(), 'uploads_test');
  if (fs.existsSync(testUploadDir)) {
    try {
      fs.rmSync(testUploadDir, { recursive: true, force: true });
    } catch (_e) {
      // ignore cleanup errors
    }
  }
});
