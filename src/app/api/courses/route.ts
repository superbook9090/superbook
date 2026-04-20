// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Course from '@/models/Course';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';
import { createCourseSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/courses - Get all courses (with optional filtering)
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/courses',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const instructor = searchParams.get('instructor');
    const isPublished = searchParams.get('isPublished');
    const available = searchParams.get('available'); // For students to browse
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // If 'available' is set, return published courses student can enroll in
    if (available === 'true' && session.user?.role === 'student') {
      query.isPublished = true;
      // Exclude courses student is already enrolled in
      const Enrollment = (await import('@/models/Enrollment')).default;
      const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
      const enrolledCourseIds = enrollments.map(e => e.course.toString());
      if (enrolledCourseIds.length > 0) {
        query._id = { $nin: enrolledCourseIds };
      }
    } else {
      // Handle 'self' keyword for getting own courses
      if (instructor === 'self') {
        query.instructor = session.user.id;
      } else if (instructor) {
        query.instructor = instructor;
      }
      if (isPublished !== null) query.isPublished = isPublished === 'true';
    }

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { title: 1, description: 1, price: 1, category: 1, thumbnail: 1, isPublished: 1, language: 1, createdAt: 1 };
    }

    const courses = await Course.find(query, selectFields)
      .populate('instructor', 'name email')
      .populate('enrolledStudents', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply serialization to convert ObjectIds to strings
    const serializedCourses = serialize(courses);

    const total = await Course.countDocuments(query);

    return NextResponse.json(
      {
        courses: serializedCourses,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course (Teacher only)
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/courses',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    // Only teachers and admins can create courses
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create courses' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createCourseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, price, category, thumbnail, isPublished, language } = validationResult.data;

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const courseCount = await Course.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('courses', courseCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    // Create course
    const course = new Course({
      title,
      description,
      instructor: session.user.id,
      price: price || 0,
      category,
      thumbnail,
      language: language || 'en',
      isPublished: isPublished || false,
    });

    await course.save();

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
