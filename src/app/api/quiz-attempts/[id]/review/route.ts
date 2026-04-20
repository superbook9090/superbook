// src/app/api/quiz-attempts/[id]/review/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/quiz-attempts/[id]/review - Get quiz review data (only for completed attempts)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: `/api/quiz-attempts/${params.id}/review`,
  };

  try {
    await dbConnect();

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    const attemptId = params.id;

    // Fetch the attempt with full details
    const attempt = await QuizAttempt.findById(attemptId)
      .populate('quiz')
      .populate('course', 'title description')
      .populate('student', 'name email')
      .lean() as any;

    if (!attempt) {
      return NextResponse.json({ message: 'Attempt not found' }, { status: 404 });
    }

    // Security: Only the student who took the quiz can review it
    if (attempt.student._id.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Security: Only allow review for completed attempts
    if (attempt.status !== 'completed') {
      return NextResponse.json(
        { message: 'Quiz must be completed before reviewing' },
        { status: 400 }
      );
    }

    // Fetch the full quiz with correct answers
    const quiz = await Quiz.findById(attempt.quiz._id).lean() as any;

    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Create review data with correct answers
    const reviewData = {
      attempt: {
        _id: attempt._id,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalQuestions: attempt.totalQuestions,
        timeTaken: attempt.timeTaken,
        attemptNumber: attempt.attemptNumber,
        submittedAt: attempt.submittedAt,
      },
      quiz: {
        _id: quiz._id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        questions: quiz.questions.map((q: any) => ({
          _id: q._id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
        })),
      },
      answers: attempt.answers.map((a: any) => ({
        questionIndex: a.questionIndex,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
    };

    // Apply serialization to convert ObjectIds to strings
    const serializedReviewData = serialize(reviewData);

    return NextResponse.json(serializedReviewData, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'GET', `/api/quiz-attempts/${params.id}/review`, logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
