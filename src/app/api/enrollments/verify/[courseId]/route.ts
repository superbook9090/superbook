import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Enrollment, Payment, Course } from '@/models';
import { PaymentStatus } from '@/types/payment';
import { logApiError, type LogContext } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  const logContext: LogContext = { 
    method: 'GET', 
    path: `/api/enrollments/verify/${params.courseId}` 
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

    const { courseId } = params;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: session.user.id,
      courseId: courseId
    });

    if (enrollment) {
      return NextResponse.json({
        success: true,
        isEnrolled: true,
        enrollment: {
          id: enrollment._id,
          status: enrollment.status,
          progress: enrollment.progress,
          enrolledAt: enrollment.enrolledAt
        }
      });
    }

    // Check if course is free
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // If course is free, user should be able to access
    if (course.getDiscountedPrice() === 0) {
      return NextResponse.json({
        success: true,
        isEnrolled: true,
        isFreeCourse: true,
        message: 'Free course access granted'
      });
    }

    // Check if user has a successful payment for this course
    const successfulPayment = await Payment.findOne({
      userId: session.user.id,
      courseId: courseId,
      status: PaymentStatus.SUCCESS
    });

    if (successfulPayment) {
      // User has paid but not enrolled - create enrollment
      try {
        const newEnrollment = new Enrollment({
          userId: session.user.id,
          courseId: courseId,
          enrolledAt: new Date(),
          progress: 0,
          completedLessons: [],
          status: 'active',
          paymentId: successfulPayment._id
        });

        await newEnrollment.save();

        // Update payment record
        successfulPayment.enrollmentCreated = true;
        await successfulPayment.save();

        // Update course enrolled count
        await Course.findByIdAndUpdate(
          courseId,
          { $inc: { enrolledCount: 1 } }
        );

        return NextResponse.json({
          success: true,
          isEnrolled: true,
          enrollment: {
            id: newEnrollment._id,
            status: newEnrollment.status,
            progress: newEnrollment.progress,
            enrolledAt: newEnrollment.enrolledAt
          },
          message: 'Enrollment created from successful payment'
        });

      } catch (enrollmentError) {
        console.error('Auto-enrollment failed:', enrollmentError);
        // Still allow access since payment was successful
        return NextResponse.json({
          success: true,
          isEnrolled: true,
          hasPayment: true,
          message: 'Payment verified, enrollment creation failed'
        });
      }
    }

    // User is neither enrolled nor has paid
    return NextResponse.json(
      { 
        error: 'Course enrollment required',
        isEnrolled: false,
        requiresPayment: true,
        course: {
          id: course._id,
          title: course.title,
          price: course.price,
          discountPrice: course.discountPrice,
          finalPrice: course.getDiscountedPrice(),
          hasDiscount: course.hasDiscount(),
          currency: course.currency
        }
      },
      { status: 403 }
    );

  } catch (error) {
    logApiError(
      error instanceof Error ? error : new Error(String(error)), 
      logContext.method || 'GET', 
      logContext.path || `/api/enrollments/verify/${params.courseId}`, 
      logContext
    );

    return NextResponse.json(
      { error: 'Failed to verify enrollment' },
      { status: 500 }
    );
  }
}
