// src/app/api/quiz-attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';
import { createQuizAttemptSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/quiz-attempts - Get student's quiz attempts
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/quiz-attempts',
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
    const quiz = searchParams.get('quiz');
    const course = searchParams.get('course');
    const attemptId = searchParams.get('attemptId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { student: session.user.id };
    if (quiz) query.quiz = quiz;
    if (course) query.course = course;
    if (attemptId) query._id = attemptId;

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { score: 1, status: 1, startedAt: 1, submittedAt: 1, timeTaken: 1, attemptNumber: 1, correctCount: 1, answers: 1, totalQuestions: 1 };
    }

    const attempts = await QuizAttempt.find(query, selectFields)
      .populate('quiz', 'title description timeLimit questions')
      .populate('course', 'title description')
      .populate('student', 'name email')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Sanitize quiz questions - remove correctAnswer before sending to frontend
    // Use separate review endpoint for completed attempts with correct answers
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitizedAttempts = attempts.map((attempt: any) => {
      if (attempt.quiz && attempt.quiz.questions) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attempt.quiz.questions = attempt.quiz.questions.map((q: any) => ({
          _id: q._id?.toString(),
          question: q.question,
          options: q.options,
        }));
      }
      // For completed attempts, include isCorrect in answers
      if (attempt.status === 'completed' && attempt.answers) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        attempt.answers = attempt.answers.map((a: any) => ({
          questionIndex: a.questionIndex,
          selectedOption: a.selectedOption,
          isCorrect: a.isCorrect,
        }));
      }
      return attempt;
    });

    // Apply serialization to convert ObjectIds to strings
    const serializedAttempts = serialize(sanitizedAttempts);

    const total = await QuizAttempt.countDocuments(query);

    return NextResponse.json({
      attempts: serializedAttempts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/quiz-attempts', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/quiz-attempts - Start or submit a quiz attempt
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/quiz-attempts',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Only students can attempt quizzes
    if (session.user?.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can attempt quizzes' },
        { status: 403 }
      );
    }

    await dbConnect();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createQuizAttemptSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { quizId, action, answers, timeTaken } = validationResult.data;

    // Get quiz details
    const quiz = await Quiz.findById(quizId).populate('course', '_id');
    if (!quiz) {
      return NextResponse.json(
        { message: 'Quiz not found' },
        { status: 404 }
      );
    }

    if (!quiz.isPublished) {
      return NextResponse.json(
        { message: 'This quiz is not available' },
        { status: 403 }
      );
    }

    // Check if student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: session.user.id,
      course: quiz.course._id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: 'You must enroll in the course to take this quiz' },
        { status: 403 }
      );
    }

    // Find or create in-progress attempt
    let attempt = await QuizAttempt.findOne({
      student: session.user.id,
      quiz: quizId,
      status: 'in_progress',
    });

    // If starting new attempt
    if (!attempt || action === 'start') {
      // Count previous attempts
      const attemptCount = await QuizAttempt.countDocuments({
        student: session.user.id,
        quiz: quizId,
      });

      // Check time limit for previous in-progress attempts
      if (attempt) {
        const timeLimitMs = quiz.timeLimit * 60 * 1000;
        const elapsed = Date.now() - attempt.startedAt.getTime();
        if (elapsed > timeLimitMs) {
          attempt.status = 'abandoned';
          await attempt.save();
          attempt = null;
        }
      }

      if (!attempt) {
        attempt = new QuizAttempt({
          student: session.user.id,
          quiz: quizId,
          course: quiz.course._id,
          answers: [],
          totalQuestions: quiz.questions.length,
          startedAt: new Date(),
          status: 'in_progress',
          attemptNumber: attemptCount + 1,
        });
        await attempt.save();
      }

      // Sanitize questions - remove correctAnswer before sending to frontend
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sanitizedQuestions = quiz.questions.map((q: any) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
      }));

      return NextResponse.json(
        { message: 'Quiz started', attempt, questions: sanitizedQuestions },
        { status: 201 }
      );
    }

    // Submitting the quiz
    if (action === 'submit' && answers) {
      // Validate: check if attempt is in progress
      if (attempt.status !== 'in_progress') {
        return NextResponse.json(
          { message: 'Quiz has already been submitted' },
          { status: 400 }
        );
      }

      // Validate: check if answers length matches questions length
      if (answers.length !== quiz.questions.length) {
        return NextResponse.json(
          { message: 'Invalid number of answers' },
          { status: 400 }
        );
      }

      // Validate: check if all question indices are valid
      const validIndices = answers.every((a: { questionIndex: number }) =>
        a.questionIndex >= 0 && a.questionIndex < quiz.questions.length
      );
      if (!validIndices) {
        return NextResponse.json(
          { message: 'Invalid question index in answers' },
          { status: 400 }
        );
      }

      // Auto-grade the answers
      const gradedAnswers = answers.map((answer: { questionIndex: number; selectedOption: number }) => {
        const question = quiz.questions[answer.questionIndex];
        const isCorrect = question && answer.selectedOption !== -1 && answer.selectedOption === question.correctAnswer;
        return {
          questionIndex: answer.questionIndex,
          selectedOption: answer.selectedOption,
          isCorrect: isCorrect || false,
        };
      });

      const correctCount = gradedAnswers.filter((a: { isCorrect: boolean }) => a.isCorrect).length;
      const score = Math.round((correctCount / quiz.questions.length) * 100);

      // Update attempt
      attempt.answers = gradedAnswers;
      attempt.correctCount = correctCount;
      attempt.score = score;
      attempt.timeTaken = timeTaken || Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);
      attempt.status = 'completed';
      attempt.submittedAt = new Date();

      await attempt.save();

      // Update enrollment progress based on quiz completion
      // Find all completed quizzes for this course
      const courseQuizzes = await Quiz.find({ course: quiz.course._id, isPublished: true }).lean();
      const completedAttempts = await QuizAttempt.find({
        student: session.user.id,
        course: quiz.course._id,
        status: 'completed',
      }).lean();

      // Count unique quizzes completed (not total attempts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const completedQuizzes = new Set(completedAttempts.map((a: any) => a.quiz.toString())).size;

      // Update course progress based on quiz completion (simplified)
      const quizProgress = courseQuizzes.length > 0 ? (completedQuizzes / courseQuizzes.length) * 100 : 0;
      enrollment.progress = Math.min(100, Math.round(quizProgress)); // Cap at 100
      if (enrollment.progress >= 100) {
        enrollment.status = 'completed';
        enrollment.completedAt = new Date();
      }
      await enrollment.save();

      return NextResponse.json(
        {
          message: 'Quiz submitted successfully',
          attempt: {
            ...attempt.toObject(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            answers: gradedAnswers.map((a: any) => ({
              questionIndex: a.questionIndex,
              selectedOption: a.selectedOption,
            })),
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Invalid action', attempt },
      { status: 400 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/quiz-attempts', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
