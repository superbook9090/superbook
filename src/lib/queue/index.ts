// src/lib/queue/index.ts
// Queue system initialization and exports

import { initializeQueues, closeQueues } from './config';
import { initializeWorkers, closeWorkers, getWorkerStatus } from './workers';
import { scheduleCronJobs, removeAllCronJobs, getScheduledJobs } from './cron';

// Initialize the entire queue system
export async function initializeQueueSystem(): Promise<void> {
  console.log('🚀 Initializing queue system...');
  
  // Initialize queues first
  initializeQueues();
  
  // Start workers
  initializeWorkers();
  
  // Schedule cron jobs
  await scheduleCronJobs();
  
  console.log('✅ Queue system ready');
}

// Graceful shutdown
export async function shutdownQueueSystem(): Promise<void> {
  console.log('🛑 Shutting down queue system...');
  
  await Promise.all([
    closeWorkers(),
    removeAllCronJobs(),
    closeQueues(),
  ]);
  
  console.log('🔒 Queue system shut down');
}

// Health check
export async function getQueueHealth() {
  const workers = getWorkerStatus();
  const scheduledJobs = await getScheduledJobs();
  
  return {
    workers,
    scheduledJobs,
    isHealthy: workers.every((w) => w.isRunning),
  };
}

// Re-export everything
export * from './config';
export * from './workers';
export * from './cron';
