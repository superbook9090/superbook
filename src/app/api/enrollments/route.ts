// src/app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { createEnrollmentSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/enrollments - Get user's enrollments
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/enrollments',
  };

  try {
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
      selectFields = { status: 1, progress: 1, enrolledAt: 1, completedAt: 1 };
    }

    const enrollments = await Enrollment.find(query, selectFields)
      .populate('course', 'title description thumbnail category instructor price')
      .populate('student', 'name email')
      .populate('completedLessons', 'title')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply serialization to convert ObjectIds to strings
    const serializedEnrollments = serialize(enrollments);

    const total = await Enrollment.countDocuments(query);

    return NextResponse.json({
      enrollments: serializedEnrollments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
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

    const { courseId } = validationResult.data;

    // Verify course exists and is published
    const course = await Course.findOne({ _id: courseId, isPublished: true }).lean();
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or not published' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    }).lean();

    if (existingEnrollment) {
      return NextResponse.json(
        { message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: session.user.id,
      course: courseId,
      status: 'active',
      progress: 0,
    });

    await enrollment.save();

    // Also add student to course's enrolledStudents array
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: session.user.id },
    });

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment },
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
