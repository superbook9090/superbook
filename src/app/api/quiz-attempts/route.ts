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
import {
  toClientQuestions,
  loadSanitizedQuestions,
  startNewQuizAttempt,
  finalizeExpiredAttemptIfNeeded,
} from '@/lib/quizzes/quizAttemptQueries';
import {
  gradeQuizAnswers,
  updateCourseEnrollmentProgress,
  recordChallengeAttemptIfLinked,
  QuestionGradingDoc,
} from '@/lib/quizzes/quizAttemptEvaluation';
import type { Types } from 'mongoose';

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
    const page = parseInt(searchParams.get('page'), 10);
    const limit = parseInt(searchParams.get('limit'), 10);
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

    if (attemptId) {
      attempts = await finalizeExpiredAttemptIfNeeded(
        attempts,
        session.user.id,
        query,
        selectFields,
        skip,
        limit
      );
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

// POST /api/quiz-attempts - start | submit
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

    await dbConnect();

    const body = await request.json();
    logInfo('Quiz attempt request body', logContext, { body });

    const validationResult = createQuizAttemptSchema.safeParse(body);
    if (!validationResult.success) {
      logError('Validation error', logContext, { issues: validationResult.error.issues });
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const { quizId, action, answers, timeTaken } = validationResult.data;

    if (session.user?.role !== 'student') {
      const challengeAttempt = await QuizAttempt.findOne({
        student: session.user.id,
        quiz: quizId,
        status: 'in_progress',
        challenge: { $ne: null },
      });
      if (!challengeAttempt) {
        return NextResponse.json({ message: 'Only students can attempt quizzes' }, { status: 403 });
      }
    }

    const quiz = (await Quiz.findById(quizId).populate('course', '_id').lean()) as {
      _id: Types.ObjectId;
      isPublished: boolean;
      course: { _id: Types.ObjectId };
      version: number;
      enableNegativeMarking?: boolean;
      negativeMarks?: number;
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
    const questionList = qRows as unknown as QuestionGradingDoc[];
    const totalQuestions = questionList.length;

    if (action === 'start') {
      const attempt = await startNewQuizAttempt({
        studentId: session.user.id,
        quizId,
        courseId,
        quizVersion: quiz.version,
        totalQuestions,
      });

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
      const { gradedAnswers, correctCount, score } = gradeQuizAnswers(
        questionList,
        answers,
        quiz.enableNegativeMarking,
        quiz.negativeMarks
      );

      attempt.answers = gradedAnswers;
      attempt.correctCount = correctCount;
      attempt.score = score;
      attempt.timeTaken = timeTaken || Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
      attempt.status = isForceSubmit ? 'force_submitted' : 'completed';
      if (isForceSubmit) attempt.violationCount = (attempt.violationCount || 0) + 1;
      attempt.submittedAt = new Date();
      await attempt.save();

      await updateCourseEnrollmentProgress(session.user.id, courseId);

      const challengeSlug = await recordChallengeAttemptIfLinked(
        attempt,
        session.user,
        score,
        correctCount,
        totalQuestions,
        gradedAnswers
      );

      await invalidatePattern(`quiz-attempts:${session.user.id}:*`);
      await invalidatePattern(`dashboard:${session.user.id}:*`);

      return NextResponse.json(
        {
          message: 'Quiz submitted successfully',
          challengeSlug,
          attempt: {
            ...attempt.toObject(),
            challengeSlug,
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
