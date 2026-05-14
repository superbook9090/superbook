// src/app/api/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { Course } from '@/models';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';
import { createQuizSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import mongoose from 'mongoose';
import { getAccessFilter } from '@/lib/accessControl';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { setQuizQuestions } from '@/domain/learning/quizContent';

// GET /api/quizzes - Get all quizzes (with optional filtering)
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/quizzes',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check if quizzes feature is enabled
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const instructor = searchParams.get('instructor');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // Build cache key (only for published quizzes)
    const orgId = session.user?.organizationId || 'public';
    const cacheKey = `quizzes:${orgId}:${course || 'all'}:${instructor || 'all'}:${page}:${limit}`;

    // Try cache for published quizzes
    const isPublished = searchParams.get('isPublished') === 'true';
    if (isPublished) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // Apply organization-based access control
    if (session.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      const accessFilter = getAccessFilter({
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
      });
      Object.assign(query, accessFilter);
    }

    if (course) query.course = course;
    if (instructor) query.instructor = instructor;

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { title: 1, description: 1, timeLimit: 1, isPublished: 1, createdAt: 1, questionCount: 1, version: 1 };
    }

    const quizzes = await Quiz.find(query, selectFields)
      .populate('course', 'title description')
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply serialization to convert ObjectIds to strings
    const serializedQuizzes = serialize(quizzes);

    const total = await Quiz.countDocuments(query);

    const responseData = {
      quizzes: serializedQuizzes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    };

    // Cache the response for published quizzes
    if (isPublished) {
      await setCachedData(cacheKey, responseData, 300); // 5 minutes
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/quizzes', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz (Teacher only)
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/quizzes',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check if quizzes feature is enabled
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    // Only teachers and admins can create quizzes
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create quizzes' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createQuizSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, course, questions, timeLimit, isPublished } = validationResult.data;

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const quizCount = await Quiz.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('quizzes', quizCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    // Verify course exists and belongs to this instructor
    const courseDoc = await Course.findOne({
      _id: course,
      instructor: session.user.id,
    }).lean();

    if (!courseDoc) {
      return NextResponse.json(
        { message: 'Course not found or you are not the instructor' },
        { status: 404 }
      );
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { message: 'At least one question is required' },
        { status: 400 }
      );
    }

    for (const q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return NextResponse.json(
          { message: 'Each question must have text, at least 2 options, and a correct answer' },
          { status: 400 }
        );
      }
    }

    // Get organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const organizationId = user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null;
    const orgId = organizationId?.toString() || 'public';

    const quiz = new Quiz({
      title,
      description,
      course,
      instructor: session.user.id,
      organizationId,
      timeLimit: timeLimit || 30,
      isPublished: isPublished || false,
      questionCount: 0,
      version: 1,
    });

    await quiz.save();
    await setQuizQuestions(
      quiz._id as mongoose.Types.ObjectId,
      questions.map((q) => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
      })),
      { bumpVersion: false }
    );

    const fresh = await Quiz.findById(quiz._id).lean();

    // Invalidate cache for this organization
    await invalidatePattern(`quizzes:${orgId}:*`);

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz: fresh },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quizzes', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
