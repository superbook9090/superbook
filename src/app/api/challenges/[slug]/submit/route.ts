import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import crypto from 'crypto';
import { logApiError, type LogContext } from '@/lib/logger';
import { isFeatureEnabled, getChallengeSettings } from '@/lib/settingsHelpers';
import { submitChallengeSchema } from '@/lib/validation';
import { Challenge, ChallengeAttempt, QuizQuestion } from '@/models';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const params = await context.params;
  const slug = params.slug;

  const logContext: LogContext = {
    method: 'POST',
    path: `/api/challenges/${slug}/submit`,
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

    const body = await req.json();
    const validation = submitChallengeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid submission data', errors: validation.error.issues },
        { status: 400 }
      );
    }

    await dbConnect();

    const challenge = await Challenge.findOne({ slug });
    if (!challenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    if (challenge.status === 'disabled') {
      return NextResponse.json({ message: 'This challenge has been disabled' }, { status: 410 });
    }

    if (challenge.expiresAt && new Date(challenge.expiresAt) < new Date()) {
      challenge.status = 'expired';
      await challenge.save();
      return NextResponse.json({ message: 'This challenge has expired' }, { status: 410 });
    }

    const { guestName, guestSessionId, timeTaken, answers } = validation.data;

    const selectedQuestionIds: string[] = (challenge.selectedQuestions || []).map(
      (id: { toString(): string }) => id.toString()
    );
    if (selectedQuestionIds.length === 0) {
      return NextResponse.json({ message: 'Challenge has no questions' }, { status: 400 });
    }

    const allowedQuestionSet = new Set(selectedQuestionIds);
    const seenQuestionIds = new Set<string>();
    const validatedAnswers: typeof answers = [];

    for (const ans of answers) {
      if (!allowedQuestionSet.has(ans.questionId)) {
        return NextResponse.json(
          { message: 'Invalid question ID in submission' },
          { status: 400 }
        );
      }
      if (seenQuestionIds.has(ans.questionId)) {
        return NextResponse.json(
          { message: 'Duplicate question ID in submission' },
          { status: 400 }
        );
      }
      seenQuestionIds.add(ans.questionId);
      validatedAnswers.push(ans);
    }

    const clampedTimeTaken = Math.max(1, Math.floor(Number(timeTaken) || 1));

    // Fetch ONLY challenge.selectedQuestions to evaluate answers securely on the server
    interface GradedQuestionDoc {
      _id: { toString(): string };
      correctOption: number;
    }

    const questions = (await QuizQuestion.find({
      _id: { $in: challenge.selectedQuestions },
    })
      .select('_id correctOption')
      .lean()) as unknown as GradedQuestionDoc[];

    const questionMap = new Map<string, GradedQuestionDoc>(
      questions.map((q) => [q._id.toString(), q])
    );

    let correctCount = 0;
    const gradedAnswers = validatedAnswers.map((ans, idx) => {
      const q = questionMap.get(ans.questionId);
      const isCorrect = q ? q.correctOption === ans.selectedOption : false;
      if (isCorrect) correctCount += 1;

      return {
        questionId: ans.questionId,
        order: ans.order ?? idx,
        selectedOption: ans.selectedOption,
        correctOption: q ? q.correctOption : null,
        isCorrect,
      };
    });

    const totalQuestions = selectedQuestionIds.length;
    const score = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);

    // Determine win/loss logic
    let isWon = false;
    let isDraw = false;
    if (score > challenge.targetScore) {
      isWon = true;
    } else if (score === challenge.targetScore) {
      if (clampedTimeTaken > 0 && challenge.timeTaken > 0 && clampedTimeTaken < challenge.timeTaken) {
        isWon = true;
      } else if (score > 0 && clampedTimeTaken === challenge.timeTaken) {
        isDraw = true;
      }
    }

    // Optional user session
    const session = await getServerSession(authOptions);
    const opponentUser = session?.user?.id || null;
    const converted = Boolean(opponentUser);

    const claimToken = `clm_${crypto.randomBytes(16).toString('hex')}`;

    const attempt = await ChallengeAttempt.create({
      challenge: challenge._id,
      challenger: challenge.creator,
      opponentUser,
      guestSessionId,
      guestName,
      score,
      correctCount,
      totalQuestions,
      timeTaken: clampedTimeTaken,
      isWon,
      claimToken,
      converted,
      answers: gradedAnswers.map((a) => ({
        questionId: a.questionId,
        order: a.order,
        selectedOption: a.selectedOption,
        isCorrect: a.isCorrect,
      })),
    });

    // Update challenge counts
    const incUpdates: Record<string, number> = { attemptsCount: 1 };
    if (converted) {
      incUpdates.conversionsCount = 1;
    }
    await Challenge.updateOne({ _id: challenge._id }, { $inc: incUpdates });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt._id.toString(),
        claimToken,
        score,
        correctCount,
        totalQuestions,
        timeTaken: clampedTimeTaken,
        targetScore: challenge.targetScore,
        challengerCorrectCount: challenge.correctCount,
        challengerTimeTaken: challenge.timeTaken,
        isWon,
        isDraw,
        converted,
        answers: gradedAnswers,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'POST', logContext.path || '/api/challenges/[slug]/submit', logContext);
    return NextResponse.json(
      { message: 'Failed to submit challenge answers' },
      { status: 500 }
    );
  }
}
