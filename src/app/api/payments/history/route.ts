import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { razorpayService } from '@/features/payments/services/razorpayService';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Query validation schema
const HistoryQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).default(1),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(50)).default(10),
});

export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/payments/history' };

  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);
    const validatedQuery = HistoryQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
    });

    // Get payment history
    const paymentHistory = await razorpayService.getPaymentHistory(
      session.user.id,
      validatedQuery.page,
      validatedQuery.limit
    );

    return NextResponse.json({
      success: true,
      ...paymentHistory
    });

  } catch (error) {
    logApiError(error instanceof Error ? error : new Error(String(error)), logContext.method || 'GET', logContext.path || '/api/payments/history', logContext);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
}
