// src/app/api/quiz-attempts/route.ts — greenfield: normalized QuizQuestion + compact attempts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import { createQuizAttemptSchema } from '@/lib/validation';
import { logInfo, logError, logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { requireFeature } from '@/lib/settingsHelpers';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';
import { finalizeExpiredQuizAttemptIfNeeded } from '@/domain/learning/finalizeExpiredQuizAttempt';
import type { Types } from 'mongoose';

function toClientQuestions(rows: { _id: Types.ObjectId; order: number; prompt: string; options: string[] }[]) {
  return rows.map((q) => ({
    _id: q._id.toString(),
    order: q.order,
    question: q.prompt,
    options: q.options,
  }));
}

async function loadSanitizedQuestions(quizId: Types.ObjectId) {
  const rows = await listQuestionsForQuiz(quizId);
  return toClientQuestions(rows as unknown as { _id: Types.ObjectId; order: number; prompt: string; options: string[] }[]);
}

// GET /api/quiz-attempts
export async function GET(request: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/quiz-attempts' };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user) logContext.userId = session.user.id;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const quiz = searchParams.get('quiz');
    const course = searchParams.get('course');
    const attemptId = searchParams.get('attemptId');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const cacheKey = `quiz-attempts:${session.user.id}:${quiz || 'all'}:${course || 'all'}:${attemptId || 'all'}:page${page}:limit${limit}`;

    const cached = await getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
      });
    }

    const query: Record<string, unknown> = { student: session.user.id };
    if (quiz) query.quiz = quiz;
    if (course) query.course = course;
    if (attemptId) query._id = attemptId;

    const selectFields = !attemptId
      ? {
          quiz: 1,
          course: 1,
          score: 1,
          status: 1,
          startedAt: 1,
          submittedAt: 1,
          timeTaken: 1,
          attemptNumber: 1,
          correctCount: 1,
          totalQuestions: 1,
          quizVersion: 1,
        }
      : undefined;

    let attempts = await QuizAttempt.find(query, selectFields)
      .populate('quiz', 'title description timeLimit questionCount version course')
      .populate('course', 'title description')
      .populate('student', 'name email')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    if (attemptId && attempts[0]) {
      const raw = attempts[0] as unknown as {
        _id: Types.ObjectId;
        status: string;
        startedAt: Date;
        quiz: Types.ObjectId | { _id: Types.ObjectId };
        course: Types.ObjectId;
        quizVersion: number;
        totalQuestions: number;
        violationCount?: number;
      };
      const quizRef = raw.quiz;
      const quizId =
        typeof quizRef === 'object' && quizRef !== null && '_id' in quizRef
          ? quizRef._id
          : (quizRef as Types.ObjectId);

      const finalized = await finalizeExpiredQuizAttemptIfNeeded({
        _id: raw._id,
        status: raw.status,
        startedAt: raw.startedAt,
        quiz: quizId,
        course: raw.course,
        quizVersion: raw.quizVersion,
        totalQuestions: raw.totalQuestions,
        violationCount: raw.violationCount,
      });

      if (finalized) {
        await invalidatePattern(`quiz-attempts:${session.user.id}:*`);
        attempts = await QuizAttempt.find(query, selectFields)
          .populate('quiz', 'title description timeLimit questionCount version course')
          .populate('course', 'title description')
          .populate('student', 'name email')
          .sort({ startedAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean();
      }
    }

    const sanitizedAttempts = attempts.map((attempt) => {
      const a = { ...attempt } as Record<string, unknown>;
      if (a.startedAt) a.startedAt = new Date(a.startedAt as Date).toISOString();
      if (a.submittedAt) a.submittedAt = new Date(a.submittedAt as Date).toISOString();
      return a;
    });

    let questions: ReturnType<typeof toClientQuestions> | undefined;
    if (attemptId && sanitizedAttempts[0]) {
      const qid = (sanitizedAttempts[0].quiz as { _id: Types.ObjectId })?._id;
      if (qid) questions = await loadSanitizedQuestions(qid);
    }

    const serializedAttempts = serialize(sanitizedAttempts);
    const total = await QuizAttempt.countDocuments(query);

    const responseData = {
      attempts: serializedAttempts,
      ...(questions ? { questions } : {}),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };

    await setCachedData(cacheKey, responseData, 300);

    return NextResponse.json(responseData, {
      status: 200,
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/quiz-attempts', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

// POST — start | submit
export async function POST(request: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/quiz-attempts' };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (session.user) logContext.userId = session.user.id;

    if (session.user?.role !== 'student') {
      return NextResponse.json({ message: 'Only students can attempt quizzes' }, { status: 403 });
    }

    await dbConnect();

    const body = await request.json();
    logInfo('Quiz attempt request body', logContext, { body });

    const validationResult = createQuizAttemptSchema.safeParse(body);
    if (!validationResult.success) {
      logError('Validation error', logContext, { issues: validationResult.error.issues });
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const { quizId, action, answers, timeTaken } = validationResult.data;

    const quiz = (await Quiz.findById(quizId).populate('course', '_id').lean()) as {
      _id: Types.ObjectId;
      isPublished: boolean;
      course: { _id: Types.ObjectId };
      version: number;
    } | null;
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }
    if (!quiz.isPublished) {
      return NextResponse.json({ message: 'This quiz is not available' }, { status: 403 });
    }

    const courseId = (quiz.course as { _id: Types.ObjectId })._id;

    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    });
    if (!enrollment) {
      return NextResponse.json({ message: 'You must enroll in the course to take this quiz' }, { status: 403 });
    }

    const qRows = await listQuestionsForQuiz(quiz._id);
    const questionList = qRows as unknown as { _id: Types.ObjectId; order: number; correctOption: number }[];
    const totalQuestions = questionList.length;

    if (action === 'start') {
      const attemptCount = await QuizAttempt.countDocuments({ student: session.user.id, quiz: quizId });
      const existingAttempt = await QuizAttempt.findOne({
        student: session.user.id,
        quiz: quizId,
        status: 'in_progress',
      });
      if (existingAttempt) {
        existingAttempt.status = 'abandoned';
        await existingAttempt.save();
      }

      const attempt = new QuizAttempt({
        student: session.user.id,
        quiz: quizId,
        course: courseId,
        quizVersion: quiz.version,
        answers: [],
        totalQuestions,
        startedAt: new Date(),
        status: 'in_progress',
        attemptNumber: attemptCount + 1,
        violationCount: 0,
      });
      await attempt.save();

      const questions = toClientQuestions(
        qRows as unknown as { _id: Types.ObjectId; order: number; prompt: string; options: string[] }[]
      );

      return NextResponse.json({ message: 'Quiz started', attempt, questions }, { status: 201 });
    }

    const attempt = await QuizAttempt.findOne({
      student: session.user.id,
      quiz: quizId,
      status: 'in_progress',
    });
    if (!attempt) {
      return NextResponse.json({ message: 'No in-progress quiz found. Please start a new attempt.' }, { status: 404 });
    }

    if (action === 'submit' && answers) {
      if (attempt.status !== 'in_progress') {
        return NextResponse.json({ message: 'Quiz has already been submitted' }, { status: 400 });
      }

      if (answers.length !== totalQuestions) {
        return NextResponse.json({ message: 'Invalid number of answers' }, { status: 400 });
      }

      const byId = new Map(questionList.map((q) => [q._id.toString(), q]));
      const valid = answers.every((a) => byId.has(a.questionId));
      if (!valid) {
        return NextResponse.json({ message: 'Unknown question id in answers' }, { status: 400 });
      }

      const isForceSubmit = (body as { forceSubmit?: boolean }).forceSubmit === true;

      const gradedAnswers = answers.map((answer) => {
        const q = byId.get(answer.questionId)!;
        const isCorrect = answer.selectedOption !== -1 && answer.selectedOption === q.correctOption;
        return {
          question: q._id,
          order: q.order,
          selectedOption: answer.selectedOption,
          isCorrect: !!isCorrect,
        };
      });

      const correctCount = gradedAnswers.filter((a) => a.isCorrect).length;
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

      attempt.answers = gradedAnswers;
      attempt.correctCount = correctCount;
      attempt.score = score;
      attempt.timeTaken = timeTaken || Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
      attempt.status = isForceSubmit ? 'force_submitted' : 'completed';
      if (isForceSubmit) attempt.violationCount = (attempt.violationCount || 0) + 1;
      attempt.submittedAt = new Date();
      await attempt.save();

      const courseQuizzes = await Quiz.countDocuments({ course: courseId, isPublished: true });
      const completedDistinct = await QuizAttempt.distinct('quiz', {
        student: session.user.id,
        course: courseId,
        status: { $in: ['completed', 'force_submitted'] },
      });
      const completedQuizzes = completedDistinct.length;
      const quizProgress = courseQuizzes > 0 ? (completedQuizzes / courseQuizzes) * 100 : 0;
      enrollment.progress = Math.min(100, Math.round(quizProgress));
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
      await enrollment.save();

      await invalidatePattern(`quiz-attempts:${session.user.id}:*`);
      await invalidatePattern(`dashboard:${session.user.id}:*`);

      return NextResponse.json(
        {
          message: 'Quiz submitted successfully',
          attempt: {
            ...attempt.toObject(),
            answers: gradedAnswers.map((a) => ({
              question: a.question.toString(),
              order: a.order,
              selectedOption: a.selectedOption,
            })),
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: 'Invalid action', attempt }, { status: 400 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quiz-attempts', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
