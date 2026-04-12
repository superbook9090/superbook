// src/app/api/quiz-attempts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import Enrollment from '@/models/Enrollment';

// GET /api/quiz-attempts - Get student's quiz attempts
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const quiz = searchParams.get('quiz');
    const course = searchParams.get('course');

    const query: any = { student: session.user.id };
    if (quiz) query.quiz = quiz;
    if (course) query.course = course;

    const attempts = await QuizAttempt.find(query)
      .populate('quiz', 'title description timeLimit questions')
      .populate('course', 'title')
      .sort({ startedAt: -1 });

    return NextResponse.json({ attempts }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching quiz attempts:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching quiz attempts' },
      { status: 500 }
    );
  }
}

// POST /api/quiz-attempts - Start or submit a quiz attempt
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only students can attempt quizzes
    if (session.user?.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can attempt quizzes' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { quizId, action, answers, timeTaken } = await request.json();

    if (!quizId) {
      return NextResponse.json(
        { message: 'Quiz ID is required' },
        { status: 400 }
      );
    }

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
      status: 'active',
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

      return NextResponse.json(
        { message: 'Quiz started', attempt, questions: quiz.questions },
        { status: 201 }
      );
    }

    // Submitting the quiz
    if (action === 'submit' && answers) {
      // Auto-grade the answers
      const gradedAnswers = answers.map((answer: { questionIndex: number; selectedOption: number }) => {
        const question = quiz.questions[answer.questionIndex];
        const isCorrect = question && answer.selectedOption === question.correctAnswer;
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
      const courseQuizzes = await Quiz.find({ course: quiz.course._id, isPublished: true });
      const completedQuizzes = await QuizAttempt.countDocuments({
        student: session.user.id,
        course: quiz.course._id,
        status: 'completed',
      });

      // Update course progress based on quiz completion (simplified)
      const quizProgress = courseQuizzes.length > 0 ? (completedQuizzes / courseQuizzes.length) * 100 : 0;
      enrollment.progress = Math.round(quizProgress);
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
            answers: gradedAnswers, // Include correct answers for review
          },
          correctAnswers: quiz.questions.map((q: { correctAnswer: number }) => q.correctAnswer),
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: 'Invalid action', attempt },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error handling quiz attempt:', error);
    return NextResponse.json(
      { message: error.message || 'Error handling quiz attempt' },
      { status: 500 }
    );
  }
}
