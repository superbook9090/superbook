import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { razorpayService } from '@/features/payments/services/razorpayService';
import { Course } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

// Request validation schema
const CreateOrderSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.optional(z.record(z.string(), z.string())),
});

export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/payments/create-order' };

  try {
    // Connect to database
    await dbConnect();
    
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
    const validatedData = CreateOrderSchema.parse(body);

    // Verify course exists and get details
    const course = await Course.findById(validatedData.courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Validate course accessibility
    if (!course.isAccessible()) {
      return NextResponse.json(
        { error: 'Course is not available for purchase' },
        { status: 400 }
      );
    }

    // Get final price (with discount if applicable)
    const finalPrice = course.getDiscountedPrice();
    
    // Check if course is free
    if (finalPrice === 0) {
      return NextResponse.json(
        { error: 'Free course - no payment required' },
        { status: 400 }
      );
    }

    // Check if user is already enrolled
    // This would be handled by the enrollment service
    // For now, we'll allow duplicate prevention in the order creation

    // Create order
    const order = await razorpayService.createOrder({
      userId: session.user.id,
      courseId: validatedData.courseId,
      amount: finalPrice,
      currency: validatedData.currency || course.currency,
      receipt: validatedData.receipt,
      notes: {
        ...validatedData.notes,
        courseTitle: course.title,
        originalPrice: course.price,
        discountPrice: course.discountPrice,
        finalPrice: finalPrice,
        hasDiscount: course.hasDiscount(),
        userEmail: session.user.email || '',
      }
    });

    // Return order details
    return NextResponse.json({
      success: true,
      order: {
        orderId: order.orderId,
        razorpayOrderId: order.razorpayOrderId,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        course: {
          id: course._id,
          title: course.title,
          description: course.description,
          thumbnail: course.thumbnail,
          price: course.price,
          discountPrice: course.discountPrice,
          finalPrice: finalPrice,
          hasDiscount: course.hasDiscount(),
          currency: course.currency,
          subscriptionType: course.subscriptionType,
          lifetimeAccess: course.lifetimeAccess
        }
      }
    });

  } catch (error) {
    logApiError(error instanceof Error ? error : new Error(String(error)), logContext.method || 'POST', logContext.path || '/api/payments/create-order', logContext);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('Active order already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
