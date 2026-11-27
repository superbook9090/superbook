// src/app/api/enrollments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import { Course } from '@/models';
import { logApiError, type LogContext } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import mongoose from 'mongoose';
import { requireFeature } from '@/lib/settingsHelpers';
import { isAdmin } from '@/lib/roles';
import { createUserNotifications } from '@/lib/server/services/notifications-service';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';

// PATCH /api/enrollments/[id] - Update enrollment progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/enrollments/[id]',
  };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const body = await request.json();

    // Prevent students from forging progress, completion status, or completed lesson counts
    if (
      body?.progress !== undefined ||
      body?.lessonCompletedCount !== undefined ||
      body?.completedAt !== undefined ||
      (body?.status !== undefined && body.status !== 'dropped')
    ) {
      return NextResponse.json(
        { message: 'Course progress and completion are tracked automatically and cannot be modified directly' },
        { status: 403 }
      );
    }

    if (body?.status !== 'dropped') {
      return NextResponse.json(
        { message: 'No valid updatable fields provided' },
        { status: 400 }
      );
    }

    const enrollment = await Enrollment.findOne({
      _id: id,
      student: session.user.id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    enrollment.status = 'dropped';
    await enrollment.save();

    // Invalidate Redis cache for enrollments
    await invalidatePattern(`enrollments:*`);

    // Revalidate Next.js cache tags
    revalidateTag('enrollments');

    return NextResponse.json(
      { message: 'Enrollment updated', enrollment },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/enrollments/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[id] - Drop a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/enrollments/[id]',
  };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const enrollment = await Enrollment.findById(id).populate('course', 'instructor organizationId title');

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    const isSelf = enrollment.student.toString() === session.user.id;
    const isUserAdmin = isAdmin(session.user.role);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const course = enrollment.course as any;

    if (!isSelf) {
      // Removing another student's enrollment requires course management permission
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const requester = session.user as any;
      const authUser: AccessUser = {
        _id: new mongoose.Types.ObjectId(requester.id),
        organizationId: requester.organizationId
          ? new mongoose.Types.ObjectId(requester.organizationId)
          : null,
        role: (requester.role || 'student') as AccessUser['role'],
      };

      const canManage =
        Boolean(course) &&
        canManageOrgContent(course.organizationId, course.instructor, authUser);

      if (!canManage) {
        return NextResponse.json(
          { message: 'You do not have permission to remove this enrollment' },
          { status: 403 }
        );
      }

      const enrollmentFeatureCheck = await requireFeature('enableEnrollmentManagement');
      if (enrollmentFeatureCheck) return enrollmentFeatureCheck;
    }

    // Update course enrolledCount for performance
    await Course.findByIdAndUpdate(enrollment.course, {
      $inc: { enrolledCount: -1 }
    });

    // Notify the student when removed by a teacher or admin (not a self-drop)
    if (!isSelf) {
      await createUserNotifications([enrollment.student.toString()], {
        title: { en: 'Removed from course' },
        body: {
          en: `You have been removed from "${course?.title || 'a course'}" by ${
            isUserAdmin ? 'an administrator' : 'the instructor'
          }.`,
        },
        category: 'system',
        data: { courseId: enrollment.course.toString() },
      });
    }

    // Delete enrollment
    await Enrollment.findByIdAndDelete(id);

    // Get organizationId for cache invalidation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const orgId = user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null;
    const orgIdStr = orgId?.toString() || 'public';

    // Invalidate Redis cache for courses and enrollments
    await invalidatePattern(`courses:${orgIdStr}:*`);
    await invalidatePattern(`enrollments:*`);

    // Revalidate Next.js cache tags
    revalidateTag(`courses:${orgIdStr}`);
    revalidateTag('enrollments');

    return NextResponse.json(
      { message: 'Enrollment cancelled successfully' },
      { status: 200 }
    );
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/enrollments/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
