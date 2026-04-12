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
  if (cached.conn) {
    console.log('Using cached database connection');
    return cached.conn;
  }

  if (!cached.promise) {
    console.log('Creating new database connection...');
    
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
        console.log(`Mongoose: ${collectionName}.${method}`, JSON.stringify(query), doc);
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cached.promise = mongoose.connect(MONGODB_URI, opts as any)
        .then(() => {
          console.log('Successfully connected to MongoDB');
          return mongoose;
        })
        .catch((err) => {
          console.error('MongoDB connection error:', err);
          throw err;
        });
    } catch (err) {
      console.error('Error creating MongoDB connection:', err);
      throw err;
    }
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cached.conn = await cached.promise as any;
  } catch (e) {
    cached.promise = null;
    console.error('Failed to connect to MongoDB:', e);
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
export const mongooseConnection = mongoose;