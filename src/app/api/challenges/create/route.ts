import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import crypto from 'crypto';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature, getChallengeSettings } from '@/lib/settingsHelpers';
import { createChallengeSchema } from '@/lib/validation';
import { Challenge, Course, QuizAttempt, QuizQuestion, Quiz } from '@/models';
import { isSuperAdmin } from '@/lib/roles';

export async function POST(req: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/challenges/create',
  };

  try {
    const featureGuard = await requireFeature('enableQuizChallenges');
    if (featureGuard) return featureGuard;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const validation = createChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();
    const { quizAttemptId } = validation.data;

    interface AttemptDoc {
      _id: { toString(): string };
      student: { toString(): string };
      quiz: { toString(): string };
      course?: { toString(): string } | null;
      status?: string;
      correctCount: number;
      totalQuestions: number;
      timeTaken: number;
      answers?: Array<{ question: { toString(): string }; isCorrect: boolean }>;
    }

    interface QuizDoc {
      _id: { toString(): string };
      course?: { toString(): string } | null;
      isPublished?: boolean;
      organizationId?: { toString(): string } | null;
    }

    interface CourseDoc {
      _id: { toString(): string };
      isPublished?: boolean;
      courseCode?: string | null;
      price?: number;
      organizationId?: { toString(): string } | null;
    }

    interface ExistingChallengeDoc {
      _id: { toString(): string };
      slug: string;
      targetScore: number;
      correctCount: number;
      totalQuestions: number;
      timeTaken: number;
      expiresAt: Date;
    }

    // Verify QuizAttempt exists and belongs to user
    const attempt = (await QuizAttempt.findById(quizAttemptId).lean()) as unknown as AttemptDoc | null;
    if (!attempt) {
      return NextResponse.json({ message: 'Quiz attempt not found' }, { status: 404 });
    }

    if (attempt.student.toString() !== session.user.id) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    if (attempt.status !== 'submitted' && attempt.status !== 'completed') {
      return NextResponse.json(
        { message: 'Challenge can only be created from a completed quiz attempt' },
        { status: 400 }
      );
    }

    // Verify Quiz exists and is published
    const quiz = (await Quiz.findById(attempt.quiz)
      .select('course isPublished organizationId')
      .lean()) as unknown as QuizDoc | null;
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    if (quiz.isPublished !== true) {
      return NextResponse.json(
        { message: 'Challenges can only be created for published quizzes' },
        { status: 400 }
      );
    }

    const courseId = quiz.course || attempt.course || null;
    let course: CourseDoc | null = null;
    if (courseId) {
      course = (await Course.findById(courseId)
        .select('isPublished courseCode price organizationId')
        .lean()) as unknown as CourseDoc | null;

      if (!course || course.isPublished !== true) {
        return NextResponse.json(
          { message: 'Challenges can only be created for published courses' },
          { status: 400 }
        );
      }

      if (course.courseCode) {
        return NextResponse.json(
          { message: 'Challenges cannot be created for private code-gated courses' },
          { status: 403 }
        );
      }

      if (course.price && course.price > 0) {
        return NextResponse.json(
          { message: 'Challenges can only be created for free courses' },
          { status: 403 }
        );
      }
    }

    const userOrgId = session.user.organizationId?.toString() || null;
    const isSuper = isSuperAdmin(session.user.role);
    if (quiz.organizationId && !isSuper && quiz.organizationId.toString() !== userOrgId) {
      return NextResponse.json(
        { message: 'You do not have permission to create a challenge for this quiz' },
        { status: 403 }
      );
    }
    if (course?.organizationId && !isSuper && course.organizationId.toString() !== userOrgId) {
      return NextResponse.json(
        { message: 'You do not have permission to create a challenge for this course' },
        { status: 403 }
      );
    }

    const { challengeExpiryDays } = await getChallengeSettings();

    // Check if challenge already exists for this attempt
    const existing = (await Challenge.findOne({
      quizAttempt: attempt._id,
      creator: session.user.id,
      status: 'active',
      expiresAt: { $gt: new Date() },
    }).lean()) as unknown as ExistingChallengeDoc | null;

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.NEXTAUTH_URL ||
      req.nextUrl.origin;

    if (existing) {
      return NextResponse.json({
        success: true,
        challenge: {
          id: existing._id.toString(),
          slug: existing.slug,
          targetScore: existing.targetScore,
          correctCount: existing.correctCount,
          totalQuestions: existing.totalQuestions,
          timeTaken: existing.timeTaken,
          shareUrl: `${baseUrl}/challenge/${existing.slug}`,
          expiresAt: existing.expiresAt,
        },
      });
    }

    // Determine questions for the challenge (full quiz)
    let selectedQuestionIds: Array<{ toString(): string }> = [];
    if (attempt.answers && attempt.answers.length > 0) {
      selectedQuestionIds = attempt.answers.map((a) => a.question);
    } else {
      const dbQuestions = (await QuizQuestion.find({ quiz: attempt.quiz }).select('_id').lean()) as unknown as Array<{ _id: { toString(): string } }>;
      selectedQuestionIds = dbQuestions.map((q) => q._id);
    }

    const chosenQuestionIds = selectedQuestionIds;

    // Calculate challenger's score for the full question set
    let subsetCorrect = 0;
    if (attempt.answers && attempt.answers.length > 0) {
      const chosenSet = new Set(chosenQuestionIds.map((id) => id.toString()));
      subsetCorrect = attempt.answers.filter(
        (a) => chosenSet.has(a.question.toString()) && a.isCorrect
      ).length;
    } else {
      subsetCorrect = attempt.correctCount;
    }

    const targetScore = chosenQuestionIds.length > 0
      ? Math.round((subsetCorrect / chosenQuestionIds.length) * 100)
      : 0;
    const expiresAt = new Date(Date.now() + (challengeExpiryDays || 7) * 24 * 60 * 60 * 1000);

    // Generate unique slug
    let slug = '';
    let isUnique = false;
    while (!isUnique) {
      slug = `ch_${crypto.randomBytes(8).toString('hex')}`;
      const conflict = await Challenge.findOne({ slug }).select('_id').lean();
      if (!conflict) isUnique = true;
    }

    const challenge = await Challenge.create({
      creator: session.user.id,
      quiz: attempt.quiz,
      quizAttempt: attempt._id,
      course: attempt.course || null,
      targetScore,
      correctCount: subsetCorrect,
      totalQuestions: chosenQuestionIds.length,
      timeTaken: attempt.timeTaken || 0,
      selectedQuestions: chosenQuestionIds,
      slug,
      status: 'active',
      viewsCount: 0,
      attemptsCount: 0,
      conversionsCount: 0,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge._id.toString(),
        slug: challenge.slug,
        targetScore: challenge.targetScore,
        correctCount: challenge.correctCount,
        totalQuestions: challenge.totalQuestions,
        timeTaken: challenge.timeTaken,
        shareUrl: `${baseUrl}/challenge/${challenge.slug}`,
        expiresAt: challenge.expiresAt,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path || '/api/challenges/create', logContext);
    return NextResponse.json(
      { message: 'Failed to create challenge. Please try again.' },
      { status: 500 }
    );
  }
}
