// src/lib/redis.ts
// Redis caching utility for API routes

import { Redis } from '@upstash/redis';
import { logInfo, logError, logWarn, type LogContext } from '@/lib/logger';

let redis: Redis | null = null;

export function getRedisClient(): Redis | null {
  // Check if Redis environment variables are configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    const logContext: LogContext = { method: 'REDIS_INIT', path: 'redis' };
    logWarn('Redis not configured (missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN)', logContext);
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
      const logContext: LogContext = { method: 'REDIS_INIT', path: 'redis' };
      logInfo('Redis client initialized', logContext);
    } catch (error) {
      const logContext: LogContext = { method: 'REDIS_INIT', path: 'redis' };
      logError('Failed to initialize Redis client', logContext, { error: (error as Error).message });
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
    const logContext: LogContext = { method: 'REDIS_GET', path: 'redis' };
    logError('Redis get error', logContext, { error: (error as Error).message });
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
    const logContext: LogContext = { method: 'REDIS_SET', path: 'redis' };
    logError('Redis set error', logContext, { error: (error as Error).message });
  }
}

export async function invalidateCache(key: string): Promise<void> {
  try {
    const redis = getRedisClient();
    if (!redis) return;
    
    await redis.del(key);
  } catch (error) {
    const logContext: LogContext = { method: 'REDIS_DELETE', path: 'redis' };
    logError('Redis delete error', logContext, { error: (error as Error).message });
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
    const logContext: LogContext = { method: 'REDIS_INVALIDATE_PATTERN', path: 'redis' };
    logError('Redis invalidate pattern error', logContext, { error: (error as Error).message });
  }
}
