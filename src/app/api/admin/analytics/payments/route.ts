import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { Payment, Order, Transaction, Course } from '@/models';
import { PaymentStatus, TransactionStatus, PaymentMethod } from '@/models';

// Type for lean payment documents with populated fields
type LeanPaymentWithPopulatedFields = {
  _id: any; // ObjectId from lean query
  invoiceNumber?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
  courseId?: {
    _id: string;
    title: string;
    thumbnail?: string;
  } | string;
  userId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
};
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Request validation schema
const AnalyticsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  courseId: z.string().optional(),
  status: z.enum([PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.SUCCESS, PaymentStatus.FAILED, PaymentStatus.REFUNDED, PaymentStatus.CANCELLED]).optional(),
  method: z.enum([PaymentMethod.UPI, PaymentMethod.UPI_QR, PaymentMethod.CARD, PaymentMethod.WALLET, PaymentMethod.NETBANKING]).optional(),
  page: z.string().transform(Number).default(1),
  limit: z.string().transform(Number).default(50)
});

export async function GET(request: NextRequest) {
  const logContext: LogContext = { 
    method: 'GET', 
    path: '/api/admin/analytics/payments' 
  };

  try {
    // Get session and verify admin access
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const validatedQuery = AnalyticsQuerySchema.parse(Object.fromEntries(searchParams));

    const {
      startDate,
      endDate,
      courseId,
      status,
      method,
      page,
      limit
    } = validatedQuery;

    // Build date filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.$lte = new Date(endDate);
      }
    }

    // Build main filter
    const filter: any = {
      ...dateFilter,
      ...(courseId && { courseId }),
      ...(status && { status }),
      ...(method && { paymentMethod: method })
    };

    // Get pagination data
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [
      payments,
      totalPayments,
      statusStats,
      methodStats,
      revenueStats,
      recentTransactions
    ] = await Promise.all([
      // Get paginated payments
      Payment.find(filter)
        .populate('courseId', 'title thumbnail')
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      // Get total count
      Payment.countDocuments(filter),

      // Get payment status statistics
      Payment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),

      // Get payment method statistics
      Payment.aggregate([
        { $match: { ...filter, status: PaymentStatus.SUCCESS } },
        {
          $group: {
            _id: '$paymentMethod',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),

      // Get revenue statistics
      Payment.aggregate([
        { $match: { ...filter, status: PaymentStatus.SUCCESS } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            totalTransactions: { $sum: 1 },
            averageTransactionValue: { $avg: '$amount' }
          }
        }
      ]),

      // Get recent transactions
      Transaction.find(filter)
        .populate('paymentId', 'invoiceNumber')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Calculate additional metrics
    const successRate = totalPayments > 0 
      ? ((statusStats.find((s: any) => s._id === PaymentStatus.SUCCESS)?.count || 0) / totalPayments) * 100 
      : 0;

    const refundRate = totalPayments > 0 
      ? ((statusStats.find((s: any) => s._id === PaymentStatus.REFUNDED)?.count || 0) / totalPayments) * 100 
      : 0;

    // Get course-wise analytics
    const courseStats = await Payment.aggregate([
      { $match: { ...filter, status: PaymentStatus.SUCCESS } },
      {
        $group: {
          _id: '$courseId',
          totalRevenue: { $sum: '$amount' },
          enrollments: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: '_id',
          foreignField: '_id',
          as: 'course'
        }
      },
      { $unwind: '$course' },
      {
        $project: {
          courseId: '$_id',
          courseTitle: '$course.title',
          courseThumbnail: '$course.thumbnail',
          totalRevenue: 1,
          enrollments: 1
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments,
        pagination: {
          page,
          limit,
          total: totalPayments,
          totalPages: Math.ceil(totalPayments / limit)
        },
        statistics: {
          overview: {
            totalPayments,
            successRate: Math.round(successRate * 100) / 100,
            refundRate: Math.round(refundRate * 100) / 100,
            totalRevenue: revenueStats[0]?.totalRevenue || 0,
            totalTransactions: revenueStats[0]?.totalTransactions || 0,
            averageTransactionValue: Math.round((revenueStats[0]?.averageTransactionValue || 0) * 100) / 100
          },
          statusBreakdown: statusStats,
          methodBreakdown: methodStats,
          topCourses: courseStats,
          recentTransactions
        }
      }
    });

  } catch (error) {
    logApiError(
      error instanceof Error ? error : new Error(String(error)), 
      logContext.method || 'GET', 
      logContext.path || '/api/admin/analytics/payments', 
      logContext
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch payment analytics' },
      { status: 500 }
    );
  }
}

// Export payment data
export async function POST(request: NextRequest) {
  const logContext: LogContext = { 
    method: 'POST', 
    path: '/api/admin/analytics/payments' 
  };

  try {
    // Get session and verify admin access
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { format, filters } = body;

    if (!format || !['csv', 'excel'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid export format' },
        { status: 400 }
      );
    }

    // Build filter
    const filter: any = {};
    if (filters?.startDate || filters?.endDate) {
      filter.createdAt = {};
      if (filters.startDate) {
        filter.createdAt.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        filter.createdAt.$lte = new Date(filters.endDate);
      }
    }

    if (filters?.courseId) {
      filter.courseId = filters.courseId;
    }

    if (filters?.status) {
      filter.status = filters.status;
    }

    // Get payments data
    const payments = await Payment.find(filter)
      .populate('courseId', 'title')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .lean<LeanPaymentWithPopulatedFields[]>();

    // Format data for export
    const exportData = payments.map((payment: LeanPaymentWithPopulatedFields) => ({
      'Payment ID': payment._id.toString(),
      'Invoice Number': payment.invoiceNumber || '',
      'Course': typeof payment.courseId === 'object' ? payment.courseId.title : '',
      'Student': typeof payment.userId === 'object' ? payment.userId.name : '',
      'Email': typeof payment.userId === 'object' ? payment.userId.email : '',
      'Amount': payment.amount,
      'Currency': payment.currency,
      'Status': payment.status,
      'Payment Method': payment.paymentMethod,
      'Created At': payment.createdAt,
      'Updated At': payment.updatedAt
    }));

    if (format === 'csv') {
      // Convert to CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: Record<string, string | number | Date>) => 
          headers.map(header => `"${row[header] || ''}"`).join(',')
        )
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // For Excel format, you would need a library like xlsx
    // For now, return CSV as fallback
    return NextResponse.json({
      error: 'Excel export not implemented yet',
      csvData: exportData
    }, { status: 501 });

  } catch (error) {
    logApiError(
      error instanceof Error ? error : new Error(String(error)), 
      logContext.method || 'POST', 
      logContext.path || '/api/admin/analytics/payments', 
      logContext
    );

    return NextResponse.json(
      { error: 'Failed to export payment data' },
      { status: 500 }
    );
  }
}
