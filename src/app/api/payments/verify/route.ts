import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { razorpayService } from '@/features/payments/services/razorpayService';
import { Payment, Enrollment } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';
import { PaymentStatus } from '@/types/payment';

export const dynamic = 'force-dynamic';

// Request validation schema
const VerifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/payments/verify' };

  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = VerifyPaymentSchema.parse(body);

    // Verify payment with Razorpay service
    const payment = await razorpayService.verifyPayment({
      razorpayOrderId: validatedData.razorpayOrderId,
      razorpayPaymentId: validatedData.razorpayPaymentId,
      razorpaySignature: validatedData.razorpaySignature,
    });

    // Verify payment belongs to the authenticated user
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Payment does not belong to authenticated user' },
        { status: 403 }
      );
    }

    let enrollment = null;
    
    // If payment is successful, create enrollment
    if (payment.status === PaymentStatus.SUCCESS && !payment.enrollmentCreated) {
      try {
        // Check if enrollment already exists
        const existingEnrollment = await Enrollment.findOne({
          userId: session.user.id,
          courseId: payment.courseId
        });

        if (!existingEnrollment) {
          // Create new enrollment
          enrollment = new Enrollment({
            userId: session.user.id,
            courseId: payment.courseId,
            enrolledAt: new Date(),
            progress: 0,
            completedLessons: [],
            status: 'active',
            paymentId: payment._id
          });

          await enrollment.save();

          // Update payment record to mark enrollment as created
          payment.enrollmentCreated = true;
          await payment.save();

          // Update course enrolled count
          const { Course } = await import('@/models');
          await Course.findByIdAndUpdate(
            payment.courseId,
            { $inc: { enrolledCount: 1 } }
          );
        } else {
          enrollment = existingEnrollment;
        }
      } catch (enrollmentError) {
        console.error('Enrollment creation error:', enrollmentError);
        // Don't fail the payment verification if enrollment fails
        // Log the error for manual intervention
      }
    }

    // Return payment details
    return NextResponse.json({
      success: true,
      payment: {
        id: payment._id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        invoiceNumber: payment.invoiceNumber,
        createdAt: payment.createdAt,
        courseId: payment.courseId,
        enrollmentCreated: payment.enrollmentCreated
      },
      enrollment: enrollment ? {
        id: enrollment._id,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status
      } : null
    });

  } catch (error) {
    logApiError(error instanceof Error ? error : new Error(String(error)), logContext.method || '', logContext.path || '', logContext);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('Invalid payment signature')) {
        return NextResponse.json(
          { error: 'Invalid payment signature' },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Payment already processed')) {
        return NextResponse.json(
          { error: 'Payment already processed' },
          { status: 409 }
        );
      }

      if (error.message.includes('Order not found')) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
