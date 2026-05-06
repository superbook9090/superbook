// src/lib/queue/cron.ts
// Cron job scheduler for recurring background tasks

import { getQueue, QUEUES, addJob } from './config';

// Define cron jobs
interface CronJob {
  name: string;
  queue: string;
  jobName: string;
  data: Record<string, unknown>;
  cron: string; // Cron expression
  enabled: boolean;
}

const CRON_JOBS: CronJob[] = [
  {
    name: 'daily-analytics',
    queue: QUEUES.ANALYTICS,
    jobName: 'aggregate_daily',
    data: { type: 'daily', date: new Date().toISOString().split('T')[0] },
    cron: '0 2 * * *', // Daily at 2 AM
    enabled: true,
  },
  {
    name: 'weekly-reports',
    queue: QUEUES.REPORTS,
    jobName: 'generate_weekly',
    data: { type: 'weekly_summary' },
    cron: '0 3 * * 1', // Weekly on Monday at 3 AM
    enabled: true,
  },
  {
    name: 'cleanup-old-attempts',
    queue: QUEUES.CLEANUP,
    jobName: 'cleanup_attempts',
    data: { type: 'old_attempts', olderThanDays: 90 },
    cron: '0 4 * * 0', // Weekly on Sunday at 4 AM
    enabled: true,
  },
  {
    name: 'cleanup-expired-sessions',
    queue: QUEUES.CLEANUP,
    jobName: 'cleanup_sessions',
    data: { type: 'expired_sessions', olderThanDays: 7 },
    cron: '0 5 * * *', // Daily at 5 AM
    enabled: true,
  },
  {
    name: 'notify-inactive-users',
    queue: QUEUES.NOTIFICATIONS,
    jobName: 'inactive_reminder',
    data: { type: 'email', title: 'We miss you!', message: 'Come back and continue learning' },
    cron: '0 10 * * 3', // Weekly on Wednesday at 10 AM
    enabled: false, // Disabled by default, enable when needed
  },
];

// Schedule all cron jobs
export async function scheduleCronJobs(): Promise<void> {
  console.log('📅 Scheduling cron jobs...');

  for (const job of CRON_JOBS) {
    if (!job.enabled) {
      console.log(`⏸️ Skipping disabled cron job: ${job.name}`);
      continue;
    }

    try {
      const queue = getQueue(job.queue);
      
      // Remove existing repeatable jobs with same name
      const repeatableJobs = await queue.getRepeatableJobs();
      const existingJob = repeatableJobs.find((j) => j.name === job.name);
      if (existingJob) {
        await queue.removeRepeatableByKey(existingJob.key);
      }

      // Add new repeatable job
      await queue.add(job.jobName, job.data, {
        repeat: {
          pattern: job.cron,
        },
        jobId: job.name,
      });

      console.log(`✅ Scheduled: ${job.name} (${job.cron})`);
    } catch (error) {
      console.error(`❌ Failed to schedule ${job.name}:`, error);
    }
  }

  console.log('📅 Cron jobs scheduled');
}

// Remove all cron jobs
export async function removeAllCronJobs(): Promise<void> {
  console.log('🗑️ Removing all cron jobs...');

  for (const job of CRON_JOBS) {
    try {
      const queue = getQueue(job.queue);
      const repeatableJobs = await queue.getRepeatableJobs();
      const existingJob = repeatableJobs.find((j) => j.name === job.name);
      if (existingJob) {
        await queue.removeRepeatableByKey(existingJob.key);
        console.log(`🗑️ Removed: ${job.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to remove ${job.name}:`, error);
    }
  }
}

// Get scheduled cron jobs
export async function getScheduledJobs(): Promise<
  { name: string; cron: string; nextRun: Date | null; enabled: boolean }[]
> {
  const scheduled: { name: string; cron: string; nextRun: Date | null; enabled: boolean }[] = [];

  for (const job of CRON_JOBS) {
    try {
      const queue = getQueue(job.queue);
      const repeatableJobs = await queue.getRepeatableJobs();
      const scheduledJob = repeatableJobs.find((j) => j.name === job.name);

      scheduled.push({
        name: job.name,
        cron: job.cron,
        nextRun: scheduledJob?.next ? new Date(scheduledJob.next) : null,
        enabled: job.enabled,
      });
    } catch (error) {
      console.error(`Failed to get schedule for ${job.name}:`, error);
    }
  }

  return scheduled;
}

// Trigger a cron job manually
export async function triggerJobManually(jobName: string): Promise<boolean> {
  const job = CRON_JOBS.find((j) => j.name === jobName);
  if (!job) {
    throw new Error(`Cron job ${jobName} not found`);
  }

  await addJob(job.queue, job.jobName, job.data);
  console.log(`🚀 Manually triggered: ${jobName}`);
  return true;
}
