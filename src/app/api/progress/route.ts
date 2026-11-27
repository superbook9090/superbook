// src/app/api/progress/route.ts — multi-role progress telemetry
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import User from '@/models/User';
import EnrollmentModel from '@/models/Enrollment';
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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
    const skip = (page - 1) * limit;

    await dbConnect();

    const userRole = session.user.role || 'student';

    // Never allow privilege escalation via ?role=...
    if ((roleParam === 'admin' || roleParam === 'superadmin') && !isAdmin(userRole)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    if (roleParam === 'teacher' && userRole !== 'teacher' && !isAdmin(userRole)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    let effectiveRole = userRole;
    if (roleParam === 'student') {
      effectiveRole = 'student';
    } else if (roleParam === 'teacher' && (userRole === 'teacher' || isAdmin(userRole))) {
      effectiveRole = 'teacher';
    } else if ((roleParam === 'admin' || roleParam === 'superadmin') && isAdmin(userRole)) {
      effectiveRole = isSuperAdmin(userRole) ? 'superadmin' : 'admin';
    }

    // Drill-down for a specific student when requested by teacher or admin
    if (studentIdParam && (userRole === 'teacher' || isAdmin(userRole))) {
      if (!mongoose.Types.ObjectId.isValid(studentIdParam)) {
        return NextResponse.json({ message: 'Invalid student ID' }, { status: 400 });
      }
      if (courseId && !mongoose.Types.ObjectId.isValid(courseId)) {
        return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
      }

      if (!isSuperAdmin(userRole)) {
        if (isAdmin(userRole)) {
          // Org admin must have organizationId and target student must belong to the same org
          if (!session.user.organizationId) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
          }
          const targetStudent = await User.findById(studentIdParam)
            .select('organizationId')
            .lean<{ organizationId?: mongoose.Types.ObjectId | null }>();
          if (
            !targetStudent?.organizationId ||
            targetStudent.organizationId.toString() !== session.user.organizationId.toString()
          ) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
          }
          if (courseId) {
            const targetCourse = await Course.findById(courseId)
              .select('organizationId')
              .lean<{ organizationId?: mongoose.Types.ObjectId | null }>();
            if (
              !targetCourse?.organizationId ||
              targetCourse.organizationId.toString() !== session.user.organizationId.toString()
            ) {
              return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
          }
        } else if (userRole === 'teacher') {
          // Teacher may only inspect students enrolled in at least one course taught by them
          const teacherCourses = await Course.find({ instructor: session.user.id })
            .select('_id')
            .lean<{ _id: mongoose.Types.ObjectId }[]>();
          const teacherCourseIds = teacherCourses.map((c) => c._id);

          if (courseId) {
            const ownsCourse = teacherCourseIds.some((cid) => cid.toString() === courseId);
            if (!ownsCourse) {
              return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
            }
          }

          const hasEnrollment =
            teacherCourseIds.length > 0 &&
            Boolean(
              await EnrollmentModel.exists({
                student: studentIdParam,
                course: courseId ? courseId : { $in: teacherCourseIds },
              })
            );
          if (!hasEnrollment) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
          }
        }
      }

      const { rows, overall } = await aggregateStudentProgress(studentIdParam, {
        courseId,
        skip,
        limit,
      });

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
    if (isAdmin(userRole) && (effectiveRole === 'admin' || effectiveRole === 'superadmin')) {
      if (!isSuperAdmin(userRole) && !session.user.organizationId) {
        return NextResponse.json(
          { message: 'Forbidden: organization context required' },
          { status: 403 }
        );
      }

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
