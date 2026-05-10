// src/lib/db.ts
import mongoose from 'mongoose';
import { logInfo, logError, type LogContext } from '@/lib/logger';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof import('mongoose')> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const logContext: LogContext = {
    method: 'DB_CONNECT',
    path: 'database',
  };

  if (cached.conn) {
    logInfo('Using cached database connection', logContext);
    return cached.conn;
  }

  if (!cached.promise) {
    logInfo('Creating new database connection...', logContext);
    
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority'
    };

    try {
      // Add debug logging
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logInfo(`Mongoose: ${collectionName}.${method}`, logContext, { query, doc });
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cached.promise = mongoose.connect(MONGODB_URI, opts as any)
        .then(() => {
          logInfo('Successfully connected to MongoDB', logContext);
          return mongoose;
        })
        .catch((err) => {
          logError('MongoDB connection error', logContext, { error: err.message });
          throw err;
        });
    } catch (err) {
      logError('Error creating MongoDB connection', logContext, { error: (err as Error).message });
      throw err;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached.conn = await cached.promise as any;
  } catch (e) {
    cached.promise = null;
    logError('Failed to connect to MongoDB', logContext, { error: (e as Error).message });
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
export const mongooseConnection = mongoose;