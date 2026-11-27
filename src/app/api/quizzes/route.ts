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
import { getAccessFilter, canManageOrgContent } from '@/lib/accessControl';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { setQuizQuestions } from '@/domain/learning/quizContent';
import { resolveQuizPlacement } from '@/lib/quiz/quizPlacement';
import { isStaffRole } from '@/lib/roles';

const ALLOWED_QUIZ_FIELDS = new Set([
  '_id',
  'title',
  'description',
  'course',
  'chapter',
  'lesson',
  'instructor',
  'organizationId',
  'questionCount',
  'version',
  'timeLimit',
  'isPublished',
  'enableNegativeMarking',
  'negativeMarks',
  'createdAt',
  'updatedAt',
]);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
    const chapter = searchParams.get('chapter');
    const lesson = searchParams.get('lesson');
    const instructor = searchParams.get('instructor');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const sortParam = searchParams.get('sort');

    // Validate ObjectId query params
    if (course && !mongoose.Types.ObjectId.isValid(course)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }
    if (chapter && chapter !== 'none' && chapter !== 'null' && !mongoose.Types.ObjectId.isValid(chapter)) {
      return NextResponse.json({ message: 'Invalid chapter ID' }, { status: 400 });
    }
    if (
      lesson &&
      lesson !== 'none' &&
      lesson !== 'null' &&
      lesson !== 'all' &&
      !mongoose.Types.ObjectId.isValid(lesson)
    ) {
      return NextResponse.json({ message: 'Invalid lesson ID' }, { status: 400 });
    }
    if (instructor && instructor !== 'self' && !mongoose.Types.ObjectId.isValid(instructor)) {
      return NextResponse.json({ message: 'Invalid instructor ID' }, { status: 400 });
    }

    const userRole = session.user?.role;
    const userId = session.user?.id || 'anon';
    const mustBePublished = !session?.user || userRole === 'student';

    // Build cache key scoped by org/superadmin, role, user, placement, and fields
    const orgPrefix =
      userRole === 'superadmin' ? 'superadmin' : session.user?.organizationId || 'public';
    const effectiveStatus = mustBePublished ? 'published' : status || '';
    const cacheKey = `quizzes:${orgPrefix}:${userRole || 'anon'}:${userId}:${course || 'all'}:${chapter || 'all'}:${lesson || 'all'}:${instructor || 'all'}:${fields || 'default'}:${page}:${limit}:${search || ''}:${effectiveStatus}:${sortParam || ''}`;

    // Try cache for published quizzes
    const isPublished = searchParams.get('isPublished') === 'true' || mustBePublished;
    if (isPublished) {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached, {
          status: 200,
          headers: {
            'Cache-Control': 'private, no-store',
          },
        });
      }
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    const andFilters: Record<string, unknown>[] = [];

    if (session.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      const accessFilter = getAccessFilter({
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
      });
      if (Object.keys(accessFilter).length > 0) {
        andFilters.push(accessFilter);
      }

      // Teachers may only list their own quizzes
      if (user.role === 'teacher') {
        andFilters.push({ instructor: new mongoose.Types.ObjectId(user.id) });
      } else if (instructor === 'self') {
        andFilters.push({ instructor: new mongoose.Types.ObjectId(user.id) });
      } else if (instructor) {
        andFilters.push({ instructor });
      }
    }

    if (course) andFilters.push({ course });
    if (chapter === 'none' || chapter === 'null') {
      andFilters.push({ $or: [{ chapter: null }, { chapter: { $exists: false } }] });
    } else if (chapter) {
      andFilters.push({ chapter });
    }
    if (lesson === 'none' || lesson === 'null') {
      andFilters.push({ $or: [{ lesson: null }, { lesson: { $exists: false } }] });
    } else if (lesson && lesson !== 'all') {
      andFilters.push({ lesson });
    }

    if (search && search.trim()) {
      const escapedSearch = escapeRegex(search.trim());
      andFilters.push({
        $or: [
          { title: { $regex: escapedSearch, $options: 'i' } },
          { description: { $regex: escapedSearch, $options: 'i' } },
        ],
      });
    }

    if (mustBePublished || status === 'published' || isPublished) {
      andFilters.push({ isPublished: true });
    } else if (status === 'draft') {
      andFilters.push({ isPublished: false });
    }

    if (andFilters.length === 1) {
      Object.assign(query, andFilters[0]);
    } else if (andFilters.length > 1) {
      query.$and = andFilters;
    }

    // Build select object for field selection (allowlisted)
    const defaultSelectFields: Record<string, number> = {
      title: 1,
      description: 1,
      timeLimit: 1,
      isPublished: 1,
      createdAt: 1,
      questionCount: 1,
      version: 1,
      chapter: 1,
      lesson: 1,
      course: 1,
    };
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields
        .split(',')
        .map((f) => f.trim())
        .filter((f) => ALLOWED_QUIZ_FIELDS.has(f));
      if (fieldList.length > 0) {
        fieldList.forEach((f) => {
          selectFields[f] = 1;
        });
      } else {
        selectFields = defaultSelectFields;
      }
    } else {
      selectFields = defaultSelectFields;
    }

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortParam === 'oldest') {
      sortQuery = { createdAt: 1 };
    } else if (sortParam === 'a-z' || sortParam === 'titleAsc') {
      sortQuery = { title: 1 };
    } else if (sortParam === 'z-a' || sortParam === 'titleDesc') {
      sortQuery = { title: -1 };
    }

    const quizzes = await Quiz.find(query, selectFields)
      .populate('course', 'title description')
      .populate('chapter', 'title')
      .populate('lesson', 'title')
      .populate('instructor', 'name email')
      .sort(sortQuery)
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
        'Cache-Control': 'private, no-store',
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
    if (!isStaffRole(session.user?.role)) {
      return NextResponse.json(
        { message: 'Only teachers and admins can create quizzes' },
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

    const {
      title,
      description,
      course,
      chapter,
      lesson,
      questions,
      timeLimit,
      isPublished,
      enableNegativeMarking,
      negativeMarks,
    } = validationResult.data;

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const quizCount = await Quiz.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('quizzes', quizCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    // Verify course exists and caller is authorized to manage content on it
    if (!mongoose.Types.ObjectId.isValid(course)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    const courseDoc = await Course.findById(course)
      .select('_id instructor organizationId')
      .lean<{
        _id: mongoose.Types.ObjectId;
        instructor: mongoose.Types.ObjectId;
        organizationId?: mongoose.Types.ObjectId | null;
      }>();

    if (!courseDoc) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const user = session.user as { id: string; organizationId?: string | null; role: string };
    const authUser = {
      _id: new mongoose.Types.ObjectId(user.id),
      organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
      role: user.role as 'student' | 'teacher' | 'admin' | 'superadmin',
    };

    if (!canManageOrgContent(courseDoc.organizationId, courseDoc.instructor, authUser)) {
      return NextResponse.json(
        { message: 'Not authorized to create quizzes for this course' },
        { status: 403 }
      );
    }

    const placementResult = await resolveQuizPlacement(course, { chapter, lesson });
    if (!placementResult.ok) {
      return NextResponse.json({ message: placementResult.message }, { status: 400 });
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

    const organizationId =
      courseDoc.organizationId ??
      (user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null);
    const orgId = organizationId?.toString() || 'public';

    const quiz = new Quiz({
      title,
      description,
      course,
      chapter: placementResult.chapterId,
      lesson: placementResult.lessonId,
      instructor: session.user.id,
      organizationId,
      timeLimit: timeLimit || 30,
      isPublished: isPublished || false,
      enableNegativeMarking: !!enableNegativeMarking,
      negativeMarks: typeof negativeMarks === 'number' ? negativeMarks : 0,
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
        points: q.points,
        negativePoints: q.negativePoints,
      })),
      { bumpVersion: false }
    );

    const fresh = await Quiz.findById(quiz._id).lean();

    // Invalidate cache for this organization and superadmin
    await invalidatePattern(`quizzes:${orgId}:*`);
    await invalidatePattern('quizzes:superadmin:*');

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
