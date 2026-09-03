import mongoose from 'mongoose';
import { env } from './environment';

let mongoMemoryServerInstance: any = null;
let activeDatabaseType: 'external' | 'memory' | 'disconnected' = 'disconnected';

export interface DatabaseConnectOptions {
  forceMemory?: boolean;
  timeoutMs?: number;
  uri?: string;
}

/**
 * Connects to MongoDB with automatic fallback to MongoMemoryServer
 */
export async function connectDatabase(options: DatabaseConnectOptions = {}): Promise<typeof mongoose> {
  // If already connected, return existing connection
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const isTest = env.nodeEnv === 'test';
  const forceMemory = options.forceMemory ?? isTest;
  const targetUri = options.uri || env.mongodb.uri;
  const timeoutMs = options.timeoutMs ?? env.mongodb.connectTimeoutMs;

  if (forceMemory) {
    return await connectMemoryDatabase();
  }

  // Attempt connection to configured external MONGODB_URI
  try {
    if (env.nodeEnv !== 'test') {
      console.log(`[Database] Attempting connection to ${targetUri} (timeout: ${timeoutMs}ms)...`);
    }

    await mongoose.connect(targetUri, {
      serverSelectionTimeoutMS: timeoutMs,
      connectTimeoutMS: timeoutMs,
    });

    activeDatabaseType = 'external';
    if (env.nodeEnv !== 'test') {
      console.log(`[Database] Successfully connected to external MongoDB at ${targetUri}`);
    }
    return mongoose;
  } catch (error: any) {
    if (env.mongodb.autoMemoryFallback) {
      if (env.nodeEnv !== 'test') {
        console.warn(`[Database] External MongoDB connection failed (${error.message || error}).`);
        console.log(`[Database] Initializing MongoMemoryServer fallback for zero-configuration operation...`);
      }
      return await connectMemoryDatabase();
    } else {
      console.error(`[Database] Failed to connect to MongoDB and memory fallback is disabled:`, error);
      throw error;
    }
  }
}

/**
 * Spawns and connects to an in-memory MongoMemoryServer
 */
export async function connectMemoryDatabase(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!mongoMemoryServerInstance) {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
  }

  const memoryUri = mongoMemoryServerInstance.getUri();
  if (env.nodeEnv !== 'test') {
    console.log(`[Database] Connecting to MongoMemoryServer at ${memoryUri}...`);
  }

  await mongoose.connect(memoryUri, {
    autoIndex: true,
  });

  activeDatabaseType = 'memory';
  if (env.nodeEnv !== 'test') {
    console.log(`[Database] Connected successfully to MongoMemoryServer.`);
  }
  return mongoose;
}

/**
 * Gracefully disconnects Mongoose and stops MongoMemoryServer if active
 */
export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
    mongoMemoryServerInstance = null;
  }

  activeDatabaseType = 'disconnected';
  if (env.nodeEnv !== 'test') {
    console.log(`[Database] Disconnected from database.`);
  }
}

/**
 * Clears all collections in the connected database (used between test runs)
 */
export async function clearDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 1) {
    return;
  }

  const collections = mongoose.connection.collections;
  const promises: Promise<any>[] = [];

  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    if (collection) {
      promises.push(collection.deleteMany({}));
    }
  }

  await Promise.all(promises);
}

/**
 * Retrieves the current connection status and database engine type
 */
export function getDatabaseStatus(): {
  readyState: number;
  type: 'external' | 'memory' | 'disconnected';
  uri?: string;
} {
  return {
    readyState: mongoose.connection.readyState,
    type: activeDatabaseType,
    uri: mongoose.connection.host ? mongoose.connection.name : undefined,
  };
}
