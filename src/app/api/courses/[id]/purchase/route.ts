import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { Course, Enrollment } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

// Request validation schema
const PurchaseCourseSchema = z.object({
  currency: z.string().default('INR'),
  notes: z.record(z.string(), z.string()).optional()
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const logContext: LogContext = { 
    method: 'POST', 
    path: `/api/courses/${params.id}/purchase` 
  };

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
    const validatedData = PurchaseCourseSchema.parse(body);

    // Get course details
    const course = await Course.findById(params.id);
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

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: params.id
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: 'Already enrolled in this course' },
        { status: 400 }
      );
    }

    // Get final price
    const finalPrice = course.getDiscountedPrice();

    // If course is free, create enrollment directly
    if (finalPrice === 0) {
      const enrollment = new Enrollment({
        userId: session.user.id,
        courseId: params.id,
        enrolledAt: new Date(),
        progress: 0,
        completedLessons: [],
        status: 'active'
      });

      await enrollment.save();

      // Update course enrolled count
      await Course.findByIdAndUpdate(
        params.id,
        { $inc: { enrolledCount: 1 } }
      );

      return NextResponse.json({
        success: true,
        isFree: true,
        enrollment: {
          id: enrollment._id,
          courseId: enrollment.courseId,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status
        },
        course: {
          id: course._id,
          title: course.title,
          thumbnail: course.thumbnail
        }
      });
    }

    // For paid courses, redirect to payment flow
    return NextResponse.json({
      success: true,
      isFree: false,
      requiresPayment: true,
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
      },
      paymentEndpoint: `/api/payments/create-order`
    });

  } catch (error) {
    logApiError(
      error instanceof Error ? error : new Error(String(error)), 
      logContext.method || 'POST', 
      logContext.path || `/api/courses/${params.id}/purchase`, 
      logContext
    );

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to process course purchase' },
      { status: 500 }
    );
  }
}

// Get course purchase status
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const logContext: LogContext = { 
    method: 'GET', 
    path: `/api/courses/${params.id}/purchase` 
  };

  try {
    // Get session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get course details
    const course = await Course.findById(params.id);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check if user is already enrolled
    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: params.id
    });

    const finalPrice = course.getDiscountedPrice();
    const isFree = finalPrice === 0;

    return NextResponse.json({
      success: true,
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
        lifetimeAccess: course.lifetimeAccess,
        isAccessible: course.isAccessible(),
        isFree
      },
      userStatus: {
        isEnrolled: !!enrollment,
        enrollment: enrollment ? {
          id: enrollment._id,
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: enrollment.progress
        } : null
      }
    });

  } catch (error) {
    logApiError(
      error instanceof Error ? error : new Error(String(error)), 
      logContext.method || 'GET', 
      logContext.path || `/api/courses/${params.id}/purchase`, 
      logContext
    );

    return NextResponse.json(
      { error: 'Failed to get course purchase status' },
      { status: 500 }
    );
  }
}
