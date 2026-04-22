// src/lib/redis.ts
// Redis caching utility for API routes

import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Check if Redis environment variables are configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    console.warn('⚠️ Redis not configured (missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN)');
    return null;
  }

  // Return existing instance or create new one
  if (!redis) {
    try {
      redis = new Redis({
        url: redisUrl,
        token: redisToken,
        retry: {
          retries: 3,
          backoff: (retryCount) => Math.min(retryCount * 50, 500),
        },
      });
      console.log('✅ Redis client initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Redis client:', error);
      return null;
    }
  }

  return redis;
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    if (!redis) return null;
    
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }
    return null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
}

export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = 300 // 5 minutes default
): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    
    await redis.set(key, data, { ex: ttl });
  } catch (error) {
    console.error('Redis set error:', error);
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    
    await redis.del(key);
  } catch (error) {
    console.error('Redis delete error:', error);
  }
}

export async function invalidatePattern(pattern: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Redis pattern delete error:', error);
  }
}
