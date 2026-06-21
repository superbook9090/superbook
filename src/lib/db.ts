// src/lib/db.ts
import mongoose from 'mongoose';

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
  const readyState = mongoose.connection.readyState;

  if (cached.conn && readyState === 1) {
    return cached.conn;
  }

  if (cached.conn && readyState !== 1) {

    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 30000,
      family: 4, // Force IPv4
      retryWrites: true,
      w: 'majority' as const,
    };

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cached.promise = mongoose.connect(MONGODB_URI, opts as any).then(() => mongoose);
    } catch (err) {
      cached.promise = null;
      throw err;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached.conn = await cached.promise as any;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
