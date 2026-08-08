// src/app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Enrollment, Course } from '@/models';
import { createEnrollmentSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData } from '@/lib/redis';
import { isPrivateCourse } from '@/lib/courseAccess';
import { enrollStudentInCourse } from '@/lib/enrollmentService';
import {
  courseCodeAttemptLimiter,
  getRequestIp,
  rateLimitExceededMessage,
} from '@/lib/rateLimiter';
import { requireFeature } from '@/lib/settingsHelpers';

// Configure Next.js caching for this route
export const dynamic = 'force-dynamic';

// GET /api/enrollments - Get user's enrollments
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/enrollments',
  };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // Build cache key based on query params
    const cacheKey = `enrollments:${session.user.id}:${course || 'all'}:page${page}:limit${limit}:fields${fields || 'default'}`;

    // Try cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { student: session.user.id };
    if (course) query.course = course;

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { status: 1, progress: 1, enrolledAt: 1, completedAt: 1, lessonCompletedCount: 1 };
    }

    const enrollments = await Enrollment.find(query, selectFields)
      .populate({
        path: 'course',
        select: 'title description thumbnail category instructor price slug courseCode',
        populate: { path: 'instructor', select: 'name email' }
      })
      .populate('student', 'name email')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Ensure enrolledAt is properly serialized as ISO string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedEnrollments = enrollments.map((enrollment: any) => {
      if (enrollment.enrolledAt) {
        enrollment.enrolledAt = new Date(enrollment.enrolledAt).toISOString();
      } else {
        // If enrolledAt is missing, set it to current time as fallback
        enrollment.enrolledAt = new Date().toISOString();
      }
      if (enrollment.completedAt) {
        enrollment.completedAt = new Date(enrollment.completedAt).toISOString();
      }
      return enrollment;
    });

    // Apply serialization to convert ObjectIds to strings
    const serializedEnrollments = serialize(sanitizedEnrollments);

    const total = await Enrollment.countDocuments(query);

    const responseData = {
      enrollments: serializedEnrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };

    // Cache for 2 minutes (enrollment data changes on new enrollments)
    await setCachedData(cacheKey, responseData, 120);

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/enrollments', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Enroll in a course
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/enrollments',
  };

  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Only students can enroll
    if (session.user?.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createEnrollmentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { courseId, courseCode } = validationResult.data;

    const course = await Course.findOne({ _id: courseId, isPublished: true })
      .select('courseCode')
      .lean<{ courseCode?: string | null }>();
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or not published' },
        { status: 404 }
      );
    }

    if (isPrivateCourse(course)) {
      const ip = getRequestIp(request);
      const limitKey = `course-code:${session.user.id}:${ip}`;
      const rateCheck = courseCodeAttemptLimiter.check(limitKey);
      if (!rateCheck.allowed) {
        return NextResponse.json({ message: rateLimitExceededMessage() }, { status: 429 });
      }

      if (!courseCode) {
        return NextResponse.json(
          { message: 'Course code is required for this course' },
          { status: 400 }
        );
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const result = await enrollStudentInCourse({
      studentId: session.user.id,
      organizationId: user.organizationId ?? null,
      courseId,
      courseCode,
    });

    if (!result.ok) {
      return NextResponse.json({ message: result.message }, { status: result.status });
    }

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment: result.enrollment },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/enrollments', logContext);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
