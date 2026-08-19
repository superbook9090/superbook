// src/app/api/progress/route.ts — multi-role progress telemetry
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import {
  aggregateStudentProgress,
  aggregateTeacherProgress,
} from '@/domain/learning/progressAggregation';
import { aggregateAdminProgress } from '@/domain/learning/adminProgressAggregation';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin, isSuperAdmin } from '@/lib/roles';

export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/progress' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const roleParam = searchParams.get('role');
    const studentIdParam = searchParams.get('student');
    const courseId = searchParams.get('course');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    await dbConnect();

    const userRole = session.user.role || 'student';
    const effectiveRole = (roleParam && (isAdmin(userRole) || userRole === 'teacher')) ? roleParam : userRole;

    // Drill-down for a specific student when requested by teacher or admin
    if (studentIdParam && (userRole === 'teacher' || isAdmin(userRole))) {
      const { rows, overall } = await aggregateStudentProgress(studentIdParam, {
        courseId,
        skip,
        limit,
      });

      const EnrollmentModel = (await import('@/models/Enrollment')).default;
      const countFilter: Record<string, string> = { student: studentIdParam };
      if (courseId) countFilter.course = courseId;
      const total = await EnrollmentModel.countDocuments(countFilter);

      return NextResponse.json(
        {
          progress: rows,
          overallStats: overall,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' },
        }
      );
    }

    // Teacher Cohort Progress
    if (effectiveRole === 'teacher') {
      const teacherData = await aggregateTeacherProgress(session.user.id, {
        courseId,
        search,
        skip,
        limit,
      });

      return NextResponse.json(
        {
          role: 'teacher',
          courses: teacherData.courses,
          students: teacherData.students,
          overallStats: teacherData.overall,
          pagination: {
            page,
            limit,
            total: teacherData.total,
            totalPages: Math.ceil(teacherData.total / limit),
          },
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' },
        }
      );
    }

    // Admin & SuperAdmin Platform Progress
    if (effectiveRole === 'admin' || effectiveRole === 'superadmin' || isAdmin(userRole)) {
      const adminData = await aggregateAdminProgress({
        organizationId: session.user.organizationId,
        isSuperAdmin: isSuperAdmin(userRole),
        search,
        skip,
        limit,
      });

      return NextResponse.json(
        {
          role: 'admin',
          overallStats: adminData.overall,
          courseHealth: adminData.courseHealth,
          students: adminData.students,
          pagination: {
            page,
            limit,
            total: adminData.total,
            totalPages: Math.ceil(adminData.total / limit),
          },
        },
        {
          status: 200,
          headers: { 'Cache-Control': 'private, s-maxage=30, stale-while-revalidate=60' },
        }
      );
    }

    // Default: Student Progress
    const { rows, overall } = await aggregateStudentProgress(session.user.id, {
      courseId,
      skip,
      limit,
    });

    const EnrollmentModel = (await import('@/models/Enrollment')).default;
    const countFilter: Record<string, string> = { student: session.user.id };
    if (courseId) countFilter.course = courseId;
    const total = await EnrollmentModel.countDocuments(countFilter);

    return NextResponse.json(
      {
        role: 'student',
        progress: rows,
        overallStats: overall,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: { 'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120' },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/progress', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
