// src/scripts/startWorkers.ts
// Standalone script to start queue workers
// Run with: npx ts-node src/scripts/startWorkers.ts

// Load environment variables
if (typeof process.loadEnvFile === 'function') {
  process.loadEnvFile();
}

import { initializeQueueSystem, shutdownQueueSystem } from '@/lib/queue';

async function main() {
  console.log('🚀 Starting worker process...');
  
  try {
    await initializeQueueSystem();
    
    // Keep process alive
    console.log('✅ Workers running. Press Ctrl+C to stop.');
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 SIGINT received, shutting down...');
      await shutdownQueueSystem();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 SIGTERM received, shutting down...');
      await shutdownQueueSystem();
      process.exit(0);
    });
    
    // Keep process alive indefinitely
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Failed to start workers:', error);
    process.exit(1);
  }
}

main();
