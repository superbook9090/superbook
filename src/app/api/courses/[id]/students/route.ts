// src/app/api/courses/[id]/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import Enrollment from '@/models/Enrollment';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { canManageOrgContent, type AccessUser } from '@/lib/accessControl';
import { requireFeature } from '@/lib/settingsHelpers';
import mongoose from 'mongoose';

// GET /api/courses/[id]/students - List students enrolled in a course (instructor or admin)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/courses/[id]/students',
  };

  try {
    const [featureCheck, enrollmentFeatureCheck, session, { id }] = await Promise.all([
      requireFeature('enableCourses'),
      requireFeature('enableEnrollmentManagement'),
      getServerSession(authOptions),
      params,
    ]);
    if (featureCheck) return featureCheck;
    if (enrollmentFeatureCheck) return enrollmentFeatureCheck;

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logContext.userId = session.user.id;

    await dbConnect();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const course = await Course.findById(id)
      .select('instructor organizationId')
      .lean<{ instructor: mongoose.Types.ObjectId | string; organizationId?: mongoose.Types.ObjectId | null }>();
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(user.id),
      organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
      role: (user.role || 'student') as AccessUser['role'],
    };

    if (!canManageOrgContent(course.organizationId, course.instructor, authUser)) {
      return NextResponse.json(
        { message: 'You do not have permission to view this course\'s students' },
        { status: 403 }
      );
    }

    const enrollments = await Enrollment.find({ course: id })
      .populate('student', 'name email avatar')
      .sort({ enrolledAt: -1 })
      .lean();

    const students = enrollments
      .filter((enrollment) => enrollment.student)
      .map((enrollment) => {
        const s = serialize(enrollment) as Record<string, unknown>;
        return {
          enrollmentId: s._id,
          student: s.student,
          progress: s.progress,
          status: s.status,
          lessonCompletedCount: s.lessonCompletedCount,
          enrolledAt: s.enrolledAt,
          completedAt: s.completedAt,
        };
      });

    return NextResponse.json({ students });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]/students', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
