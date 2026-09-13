import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { logApiError, type LogContext } from '@/lib/logger';
import { isFeatureEnabled, getChallengeSettings } from '@/lib/settingsHelpers';
import { Challenge, QuizQuestion, Quiz, User } from '@/models';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = params.slug;

  const logContext: LogContext = {
    method: 'GET',
    path: `/api/challenges/${slug}`,
  };

  try {
    const enabled = await isFeatureEnabled('enableQuizChallenges');
    if (!enabled) {
      return NextResponse.json(
        { message: 'Challenges are currently unavailable.' },
        { status: 403 }
      );
    }

    const { allowGuestChallenges } = await getChallengeSettings();
    if (!allowGuestChallenges) {
      return NextResponse.json(
        { message: 'Guest challenges are currently paused.' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Find challenge
    const challenge = await Challenge.findOne({ slug })
      .populate({ path: 'creator', model: User, select: 'name image' })
      .populate({ path: 'quiz', model: Quiz, select: 'title description' });

    if (!challenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.status === 'disabled') {
      return NextResponse.json(
        { message: 'This challenge has been disabled.' },
        { status: 410 }
      );
    }

    // Check expiry
    if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
      if (challenge.status !== 'expired') {
        challenge.status = 'expired';
        await challenge.save();
      }
      return NextResponse.json(
        {
          message: 'This challenge has expired.',
          expired: true,
          challenger: {
            name: challenge.creator?.name || 'Quizdo Challenger',
            image: challenge.creator?.image,
          },
          quiz: {
            title: challenge.quiz?.title || 'Quiz Challenge',
          },
        },
        { status: 410 }
      );
    }

    // Increment views
    await Challenge.updateOne({ _id: challenge._id }, { $inc: { viewsCount: 1 } });

    interface QuestionPublicDoc {
      _id: { toString(): string };
      prompt: string;
      options: string[];
      points?: number;
    }

    // Fetch questions without exposing correctOption
    const questionDocs = (await QuizQuestion.find({
      _id: { $in: challenge.selectedQuestions },
    })
      .select('_id prompt options points')
      .lean()) as unknown as QuestionPublicDoc[];

    // Preserve the original order of questions
    const questionMap = new Map<string, QuestionPublicDoc>(
      questionDocs.map((q) => [q._id.toString(), q])
    );
    const selectedIds: Array<{ toString(): string }> = challenge.selectedQuestions || [];
    const orderedQuestions: Array<{ id: string; prompt: string; options: string[]; points: number }> = [];

    for (const id of selectedIds) {
      const q = questionMap.get(id.toString());
      if (q) {
        orderedQuestions.push({
          id: q._id.toString(),
          prompt: q.prompt,
          options: q.options,
          points: q.points || 1,
        });
      }
    }

    return NextResponse.json({
      success: true,
      challenge: {
        id: challenge._id.toString(),
        slug: challenge.slug,
        challenger: {
          id: challenge.creator?._id?.toString(),
          name: challenge.creator?.name || 'A Quizdo Student',
          image: challenge.creator?.image || null,
        },
        quiz: {
          id: challenge.quiz?._id?.toString(),
          title: challenge.quiz?.title || 'Quiz Challenge',
          description: challenge.quiz?.description || '',
        },
        targetScore: challenge.targetScore,
        correctCount: challenge.correctCount,
        totalQuestions: challenge.totalQuestions,
        timeTaken: challenge.timeTaken,
        expiresAt: challenge.expiresAt,
        questions: orderedQuestions,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', logContext.path || '/api/challenges/[slug]', logContext);
    return NextResponse.json(
      { message: 'Failed to load challenge.' },
      { status: 500 }
    );
  }
}
