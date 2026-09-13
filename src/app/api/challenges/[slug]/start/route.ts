import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Challenge, Quiz, QuizAttempt, Enrollment } from '@/models';
import { requireFeature } from '@/lib/settingsHelpers';

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const featureGuard = await requireFeature('enableQuizChallenges');
    if (featureGuard) return featureGuard;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { slug } = await context.params;
    await dbConnect();

    const challenge = await Challenge.findOne({ slug });
    if (!challenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.status === 'disabled') {
      return NextResponse.json({ message: 'This challenge is disabled' }, { status: 410 });
    }

    if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
      return NextResponse.json({ message: 'This challenge has expired' }, { status: 410 });
    }

    const quiz = await Quiz.findById(challenge.quiz);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Auto-enroll user in course if needed so the quiz take page and attempts are authorized
    if (quiz.course) {
      const enrollment = await Enrollment.findOne({
        student: session.user.id,
        course: quiz.course,
      });
      if (!enrollment) {
        await Enrollment.create({
          student: session.user.id,
          course: quiz.course,
          enrolledAt: new Date(),
          status: 'active',
        });
      }
    }

    // If student already has an in_progress attempt for this quiz, reuse or link it
    const existing = await QuizAttempt.findOne({
      student: session.user.id,
      quiz: quiz._id,
      status: 'in_progress',
    });

    if (existing) {
      existing.challenge = challenge._id;
      await existing.save();
      return NextResponse.json({ success: true, attemptId: existing._id.toString() });
    }

    const attemptCount = await QuizAttempt.countDocuments({
      student: session.user.id,
      quiz: quiz._id,
    });

    const newAttempt = await QuizAttempt.create({
      student: session.user.id,
      quiz: quiz._id,
      course: quiz.course || null,
      challenge: challenge._id,
      quizVersion: quiz.version || 1,
      totalQuestions: challenge.selectedQuestions?.length || quiz.questionCount || 1,
      startedAt: new Date(),
      status: 'in_progress',
      attemptNumber: attemptCount + 1,
      answers: [],
    });

    return NextResponse.json({
      success: true,
      attemptId: newAttempt._id.toString(),
    });
  } catch (error) {
    console.error('Failed to start challenge quiz attempt:', error);
    return NextResponse.json(
      { message: 'Failed to start challenge. Please try again.' },
      { status: 500 }
    );
  }
}
