// src/app/api/admin/queues/route.ts
// Admin API for queue management

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getQueueMetrics, addJob, cleanOldJobs, QUEUES } from '@/lib/queue/config';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// GET /api/admin/queues - Get queue metrics
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/queues',
  };

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get('queue');

    if (queueName) {
      // Get specific queue metrics
      const metrics = await getQueueMetrics(queueName);
      return NextResponse.json({ queue: queueName, metrics });
    }

    // Get all queue metrics
    const allMetrics = await Promise.all(
      Object.values(QUEUES).map(async (name) => ({
        name,
        metrics: await getQueueMetrics(name),
      }))
    );

    return NextResponse.json({ queues: allMetrics });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/queues', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch queue metrics' },
      { status: 500 }
    );
  }
}

// POST /api/admin/queues - Add a job to a queue
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/admin/queues',
  };

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    const body = await request.json();
    const { queue: queueName, job: jobName, data, options } = body;

    if (!queueName || !jobName) {
      return NextResponse.json(
        { message: 'Queue name and job name are required' },
        { status: 400 }
      );
    }

    const job = await addJob(queueName, jobName, data, options);

    return NextResponse.json(
      { 
        message: 'Job added successfully', 
        jobId: job.id,
        queue: queueName,
        name: jobName 
      },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/admin/queues', logContext);
    return NextResponse.json(
      { message: 'Failed to add job' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/queues - Clean old jobs
export async function DELETE(request: NextRequest) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/admin/queues',
  };

  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    const { searchParams } = new URL(request.url);
    const queueName = searchParams.get('queue');
    const maxAge = parseInt(searchParams.get('maxAge') || '86400000'); // Default 24 hours in ms

    if (!queueName) {
      return NextResponse.json(
        { message: 'Queue name is required' },
        { status: 400 }
      );
    }

    await cleanOldJobs(queueName, maxAge);

    return NextResponse.json({
      message: 'Old jobs cleaned successfully',
      queue: queueName,
      maxAge,
    });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/admin/queues', logContext);
    return NextResponse.json(
      { message: 'Failed to clean jobs' },
      { status: 500 }
    );
  }
}
