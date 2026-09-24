import QuizAttempt from '@/models/QuizAttempt';
import { listQuestionsForQuiz } from '@/domain/learning/quizContent';
import { finalizeExpiredQuizAttemptIfNeeded } from '@/domain/learning/finalizeExpiredQuizAttempt';
import { invalidatePattern } from '@/lib/redis';
import type { Types } from 'mongoose';

export function toClientQuestions(
  rows: { _id: Types.ObjectId; order: number; prompt: string; options: string[] }[]
) {
  return rows.map((q) => ({
    _id: q._id.toString(),
    order: q.order,
    question: q.prompt,
    options: q.options,
  }));
}

export async function loadSanitizedQuestions(quizId: Types.ObjectId) {
  const rows = await listQuestionsForQuiz(quizId);
  return toClientQuestions(
    rows as unknown as { _id: Types.ObjectId; order: number; prompt: string; options: string[] }[]
  );
}

export interface StartAttemptParams {
  studentId: string;
  quizId: string;
  courseId: Types.ObjectId;
  quizVersion: number;
  totalQuestions: number;
}

export async function startNewQuizAttempt(params: StartAttemptParams) {
  const { studentId, quizId, courseId, quizVersion, totalQuestions } = params;

  const attemptCount = await QuizAttempt.countDocuments({ student: studentId, quiz: quizId });
  const existingAttempt = await QuizAttempt.findOne({
    student: studentId,
    quiz: quizId,
    status: 'in_progress',
  });
  if (existingAttempt) {
    existingAttempt.status = 'abandoned';
    await existingAttempt.save();
  }

  const attempt = new QuizAttempt({
    student: studentId,
    quiz: quizId,
    course: courseId,
    quizVersion,
    answers: [],
    totalQuestions,
    startedAt: new Date(),
    status: 'in_progress',
    attemptNumber: attemptCount + 1,
    violationCount: 0,
  });
  await attempt.save();

  return attempt;
}

export async function finalizeExpiredAttemptIfNeeded<T>(
  attempts: T[],
  userId: string,
  query: Record<string, unknown>,
  selectFields?: Record<string, number>,
  skip: number = 0,
  limit: number = 20
): Promise<T[]> {
  if (!attempts[0]) return attempts;

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
    await invalidatePattern(`quiz-attempts:${userId}:*`);
    const refreshed = await QuizAttempt.find(query, selectFields)
      .populate('quiz', 'title description timeLimit questionCount version course')
      .populate('course', 'title description')
      .populate('student', 'name email')
      .sort({ startedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    return refreshed as unknown as T[];
  }

  return attempts;
}
