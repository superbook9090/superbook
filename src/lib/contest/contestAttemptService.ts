import mongoose from 'mongoose';
import ContestAttempt, { IContestGradedAnswer } from '@/models/ContestAttempt';
import QuizQuestion from '@/models/QuizQuestion';
import { IContest } from '@/models/Contest';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';
import {
  getContestComputedState,
  computeContestTimeRemainingSeconds,
  areContestSolutionsReleased,
} from './contestHelpers';
import { invalidatePattern } from '@/lib/redis';

export async function getContestAttemptsWithStats(contestId: string, page: number = 1, limit: number = 50) {
  const skip = (page - 1) * limit;

  const [attemptsRaw, total, statsAgg] = await Promise.all([
    ContestAttempt.find({ contest: contestId })
      .populate('student', 'name email avatar phone')
      .sort({ score: -1, timeTaken: 1, submittedAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ContestAttempt.countDocuments({ contest: contestId }),
    ContestAttempt.aggregate([
      { $match: { contest: new mongoose.Types.ObjectId(contestId), status: 'completed' } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$score' },
          highestScore: { $max: '$score' },
          avgTimeTaken: { $avg: '$timeTaken' },
          totalCompleted: { $sum: 1 },
        },
      },
    ]),
  ]);

  const stats = statsAgg[0] || {
    avgScore: 0,
    highestScore: 0,
    avgTimeTaken: 0,
    totalCompleted: 0,
  };

  return {
    attemptsRaw,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      totalParticipants: total,
      completedCount: stats.totalCompleted,
      avgScore: Math.round(stats.avgScore * 10) / 10,
      highestScore: stats.highestScore,
      avgTimeTaken: Math.round(stats.avgTimeTaken),
    },
  };
}

export async function loadAllSanitizedQuestions(contest: IContest) {
  const allQuestions: Array<{
    _id: string;
    quizId: string;
    quizTitle?: string;
    order: number;
    question: string;
    options: string[];
    points: number;
    negativePoints?: number;
  }> = [];

  for (const qRef of contest.quizzes || []) {
    const qId = qRef.quiz?._id || qRef.quiz;
    if (qId) {
      const rows = await listQuestionsForQuiz(qId as mongoose.Types.ObjectId);
      (rows as unknown as Array<{ _id: mongoose.Types.ObjectId; prompt: string; options: string[]; order: number; points?: number; negativePoints?: number }>).forEach((q) => {
        allQuestions.push({
          _id: q._id.toString(),
          quizId: qId.toString(),
          quizTitle: qRef.title || 'Contest Section',
          order: q.order,
          question: q.prompt,
          options: q.options,
          points: q.points || 1,
          negativePoints:
            typeof q.negativePoints === 'number' && q.negativePoints > 0
              ? q.negativePoints
              : contest.enableNegativeMarking
                ? contest.negativeMarks || 0
                : 0,
        });
      });
    }
  }
  return allQuestions;
}

export async function handleStartAttempt(
  contest: IContest,
  userId: string,
  userOrgId?: string | null,
  now: Date = new Date()
) {
  const computedState = getContestComputedState(contest, now);
  if (computedState === 'upcoming') {
    return { status: 400, message: 'Contest has not started yet' };
  }
  if (computedState === 'completed') {
    return { status: 400, message: 'Contest has already ended' };
  }

  if (contest.visibility === 'organization' && contest.organizationId) {
    if (contest.organizationId.toString() !== userOrgId) {
      return { status: 403, message: 'This contest is restricted to members of the organization' };
    }
  }

  if (contest.maxParticipants && contest.maxParticipants > 0) {
    const participantCount = (await ContestAttempt.distinct('student', { contest: contest._id })).length;
    const studentHasAttempt = await ContestAttempt.exists({ contest: contest._id, student: userId });
    if (!studentHasAttempt && participantCount >= contest.maxParticipants) {
      return { status: 403, message: 'Contest participant limit has been reached' };
    }
  }

  const existingInProgress = await ContestAttempt.findOne({
    contest: contest._id,
    student: userId,
    status: 'in_progress',
  });

  if (existingInProgress) {
    const remainingSeconds = computeContestTimeRemainingSeconds(
      existingInProgress.startedAt,
      contest.duration,
      contest.endTime,
      now
    );

    if (remainingSeconds > 0) {
      const questions = await loadAllSanitizedQuestions(contest);
      return {
        status: 200,
        message: 'Resuming contest attempt',
        attempt: existingInProgress.toObject(),
        questions,
        timeRemaining: remainingSeconds,
        duration: contest.duration,
        endTime: contest.endTime,
        enableNegativeMarking: contest.enableNegativeMarking,
        negativeMarks: contest.negativeMarks,
      };
    }
    existingInProgress.status = 'timed_out';
    existingInProgress.submittedAt = now;
    await existingInProgress.save();
  }

  const totalAttempts = await ContestAttempt.countDocuments({ contest: contest._id, student: userId });
  if (totalAttempts >= (contest.maxAttempts || 1)) {
    return { status: 400, message: 'You have reached the maximum allowed attempts for this contest' };
  }

  const questions = await loadAllSanitizedQuestions(contest);
  const newAttempt = new ContestAttempt({
    student: userId,
    contest: contest._id,
    answers: [],
    score: 0,
    percentage: 0,
    correctCount: 0,
    totalQuestions: questions.length,
    timeTaken: 0,
    startedAt: now,
    status: 'in_progress',
    attemptNumber: totalAttempts + 1,
    violationCount: 0,
  });

  await newAttempt.save();

  const timeRemaining = computeContestTimeRemainingSeconds(
    newAttempt.startedAt,
    contest.duration,
    contest.endTime,
    now
  );

  return {
    status: 201,
    message: 'Contest attempt started',
    attempt: newAttempt.toObject(),
    questions,
    timeRemaining,
    duration: contest.duration,
    endTime: contest.endTime,
    enableNegativeMarking: contest.enableNegativeMarking,
    negativeMarks: contest.negativeMarks,
  };
}

export interface SubmitAttemptParams {
  submittedAnswers?: Array<{ questionId: string; selectedOption: number }>;
  timeTaken?: number | null;
  violationCount?: number;
}

export async function handleSubmitAttempt(
  contest: IContest,
  userId: string,
  params: SubmitAttemptParams,
  now: Date = new Date()
) {
  const { submittedAnswers = [], timeTaken, violationCount = 0 } = params;

  const attempt = await ContestAttempt.findOne({
    contest: contest._id,
    student: userId,
    status: 'in_progress',
  });

  if (!attempt) {
    const latestAttempt = await ContestAttempt.findOne({
      contest: contest._id,
      student: userId,
    }).sort({ startedAt: -1 });

    if (latestAttempt && (latestAttempt.status === 'completed' || latestAttempt.status === 'timed_out')) {
      const solutionsReleased = areContestSolutionsReleased(contest, now);
      return {
        status: 200,
        message: 'Contest attempt already submitted',
        result: {
          attemptId: latestAttempt._id.toString(),
          score: latestAttempt.score,
          percentage: latestAttempt.percentage,
          correctCount: latestAttempt.correctCount,
          totalQuestions: latestAttempt.totalQuestions,
          timeTaken: latestAttempt.timeTaken,
          submittedAt: latestAttempt.submittedAt,
          solutionsReleaseAt: contest.solutionsReleaseAt || contest.endTime,
          areSolutionsReleased: solutionsReleased,
        },
      };
    }

    return { status: 404, message: 'No active in-progress contest attempt found' };
  }

  const elapsedSeconds = Math.max(1, Math.floor((now.getTime() - new Date(attempt.startedAt).getTime()) / 1000));
  const maxAllowedSeconds = contest.duration * 60 + 30;
  const finalTimeTaken = Math.min(elapsedSeconds, maxAllowedSeconds);

  const quizIds = (contest.quizzes || [])
    .map((qRef) => (typeof qRef.quiz === 'object' && qRef.quiz !== null ? qRef.quiz._id : qRef.quiz))
    .filter((q) => Boolean(q) && mongoose.Types.ObjectId.isValid(String(q)));

  const submittedQuestionIds = submittedAnswers
    .map((a) => a.questionId)
    .filter((qId) => Boolean(qId) && mongoose.Types.ObjectId.isValid(String(qId)));

  const rawQuestionDocs = await QuizQuestion.find({
    $or: [
      ...(quizIds.length > 0 ? [{ quiz: { $in: quizIds } }] : []),
      ...(submittedQuestionIds.length > 0 ? [{ _id: { $in: submittedQuestionIds } }] : []),
    ],
  }).lean();

  type QuestionDocType = {
    _id: mongoose.Types.ObjectId;
    quiz?: mongoose.Types.ObjectId;
    order?: number;
    prompt: string;
    options: string[];
    correctOption: number;
    points?: number;
    negativePoints?: number;
  };
  const questionDocs = rawQuestionDocs as unknown as QuestionDocType[];
  const questionMap = new Map(questionDocs.map((q) => [q._id.toString(), q]));

  let totalPointsAwarded = 0;
  let correctCount = 0;
  let totalPossiblePoints = 0;

  questionDocs.forEach((q) => {
    totalPossiblePoints += q.points || 1;
  });

  const gradedAnswers: IContestGradedAnswer[] = [];

  submittedAnswers.forEach((ans) => {
    const qDoc = questionMap.get(ans.questionId);
    if (qDoc) {
      const isAttempted = typeof ans.selectedOption === 'number' && ans.selectedOption !== -1;
      const isCorrect = isAttempted && ans.selectedOption === qDoc.correctOption;
      let pointsEarned = 0;

      if (isCorrect) {
        pointsEarned = qDoc.points || 1;
        correctCount++;
      } else if (isAttempted && contest.enableNegativeMarking) {
        const penalty =
          typeof qDoc.negativePoints === 'number' && qDoc.negativePoints > 0
            ? qDoc.negativePoints
            : contest.negativeMarks || 0;
        pointsEarned = -penalty;
      }

      totalPointsAwarded += pointsEarned;

      gradedAnswers.push({
        quizId:
          qDoc.quiz && mongoose.Types.ObjectId.isValid(String(qDoc.quiz))
            ? new mongoose.Types.ObjectId(String(qDoc.quiz))
            : undefined,
        question: new mongoose.Types.ObjectId(String(qDoc._id)),
        order: typeof qDoc.order === 'number' ? qDoc.order : 0,
        selectedOption: typeof ans.selectedOption === 'number' ? ans.selectedOption : -1,
        isCorrect,
        points: pointsEarned,
      });
    }
  });

  const percentage =
    totalPossiblePoints > 0
      ? Math.max(0, Math.min(100, Math.round((totalPointsAwarded / totalPossiblePoints) * 1000) / 10))
      : 0;

  attempt.answers = gradedAnswers;
  attempt.score = Math.max(0, Math.round(totalPointsAwarded * 100) / 100);
  attempt.percentage = percentage;
  attempt.correctCount = correctCount;
  attempt.totalQuestions = questionDocs.length > 0 ? questionDocs.length : submittedAnswers.length || 1;
  attempt.timeTaken = timeTaken !== undefined && timeTaken !== null ? timeTaken : finalTimeTaken;
  attempt.status = 'completed';
  attempt.submittedAt = now;
  attempt.violationCount = violationCount;

  await attempt.save();
  await invalidatePattern('contests:*');

  const solutionsReleased = areContestSolutionsReleased(contest, now);

  return {
    status: 200,
    message: 'Contest attempt submitted successfully',
    result: {
      attemptId: attempt._id.toString(),
      score: totalPointsAwarded,
      percentage,
      correctCount,
      totalQuestions: attempt.totalQuestions,
      timeTaken: attempt.timeTaken,
      submittedAt: attempt.submittedAt,
      solutionsReleaseAt: contest.solutionsReleaseAt || contest.endTime,
      areSolutionsReleased: solutionsReleased,
    },
  };
}
