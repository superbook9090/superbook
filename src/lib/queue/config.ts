// src/lib/queue/config.ts
// BullMQ queue configuration with Redis

import { Queue, Job } from 'bullmq';

// BullMQ requires ioredis-compatible connection
// Use REDIS_URL for BullMQ (supports redis:// and rediss:// protocols)
// Falls back to localhost for local development
export function getBullMQConnection() {
  const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL;
  
  if (redisUrl?.startsWith('redis://') || redisUrl?.startsWith('rediss://')) {
    // Use the Redis URL directly for BullMQ
    return { url: redisUrl };
  }
  
  // Local development fallback
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
  };
}

// Job queues
export const QUEUES = {
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  NOTIFICATIONS: 'notifications',
  EMAIL: 'email',
  CLEANUP: 'cleanup',
} as const;

// Queue instances
const queueInstances: Map<string, Queue> = new Map();

export function getQueue(name: string): Queue {
  if (!queueInstances.has(name)) {
    const queue = new Queue(name, {
      connection: getBullMQConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      },
    });
    queueInstances.set(name, queue);
  }
  return queueInstances.get(name)!;
}

// Initialize all queues
export function initializeQueues(): void {
  Object.values(QUEUES).forEach((queueName) => {
    getQueue(queueName);
    console.log(`✅ Queue initialized: ${queueName}`);
  });
}

// Graceful shutdown
export async function closeQueues(): Promise<void> {
  for (const [name, queue] of queueInstances) {
    await queue.close();
    console.log(`🔒 Queue closed: ${name}`);
  }
  queueInstances.clear();
}

// Add job to queue
export async function addJob<T = unknown>(
  queueName: string,
  jobName: string,
  data: T,
  options?: {
    delay?: number;
    priority?: number;
    jobId?: string;
    repeat?: {
      cron?: string;
      every?: number;
    };
  }
): Promise<Job<T>> {
  const queue = getQueue(queueName);
  return queue.add(jobName, data, options);
}

// Get queue metrics
export async function getQueueMetrics(queueName: string) {
  const queue = getQueue(queueName);
  const [waiting, active, completed, failed, delayed] = await Promise.all([
    queue.getWaitingCount(),
    queue.getActiveCount(),
    queue.getCompletedCount(),
    queue.getFailedCount(),
    queue.getDelayedCount(),
  ]);

  return {
    waiting,
    active,
    completed,
    failed,
    delayed,
    total: waiting + active + delayed,
  };
}

// Clean old jobs
export async function cleanOldJobs(queueName: string, maxAge: number): Promise<void> {
  const queue = getQueue(queueName);
  await queue.clean(maxAge, 100, 'completed');
  await queue.clean(maxAge, 100, 'failed');
}
