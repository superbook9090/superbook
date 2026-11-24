import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import QuizAttempt from '@/models/QuizAttempt';
import Contest from '@/models/Contest';
import ContestAttempt from '@/models/ContestAttempt';
import Challenge from '@/models/Challenge';
import '@/models/Course';
import '@/models/User';
import { deleteQuizzesAndQuestions } from '@/lib/cascade/deleteRelated';
import { invalidatePattern } from '@/lib/redis';

export const INACTIVE_QUIZ_MIN_AGE_DAYS = 10;
export const INACTIVE_QUIZ_MIN_DAYS = 1;
export const INACTIVE_QUIZ_MAX_DAYS = 3650;

export function parseQuizCleanupDays(raw: unknown, fallback = INACTIVE_QUIZ_MIN_AGE_DAYS): number | null {
  if (raw === undefined || raw === null || raw === '') return fallback;
  const num = typeof raw === 'number' ? raw : Number(String(raw).trim());
  if (!Number.isInteger(num) || num < INACTIVE_QUIZ_MIN_DAYS || num > INACTIVE_QUIZ_MAX_DAYS) {
    return null;
  }
  return num;
}

export interface InactiveQuizCandidate {
  _id: string;
  title: string;
  isPublished: boolean;
  questionCount: number;
  timeLimit: number;
  organizationId: string | null;
  createdAt: string;
  ageDays: number;
  course: {
    _id: string;
    title: string;
  } | null;
  instructor: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface PopulatedCourseDoc {
  _id: { toString(): string };
  title?: string;
}

interface PopulatedInstructorDoc {
  _id: { toString(): string };
  name?: string;
  email?: string;
  role?: string;
}

interface RawQuizDoc {
  _id: mongoose.Types.ObjectId;
  title: string;
  isPublished?: boolean;
  questionCount?: number;
  timeLimit?: number;
  organizationId?: mongoose.Types.ObjectId | null;
  createdAt: Date;
  course?: PopulatedCourseDoc | mongoose.Types.ObjectId | null;
  instructor?: PopulatedInstructorDoc | mongoose.Types.ObjectId | null;
}

export async function findInactiveZeroAttemptQuizzes(
  onlyQuizIds?: string[],
  minAgeDays = INACTIVE_QUIZ_MIN_AGE_DAYS
): Promise<{ quizzes: InactiveQuizCandidate[]; cutoffDate: Date; minAgeDays: number }> {
  await dbConnect();

  const resolvedDays = parseQuizCleanupDays(minAgeDays) ?? INACTIVE_QUIZ_MIN_AGE_DAYS;
  const nowMs = Date.now();
  const cutoffDate = new Date(nowMs - resolvedDays * 24 * 60 * 60 * 1000);

  const filter: Record<string, unknown> = {
    createdAt: { $lt: cutoffDate },
  };

  if (Array.isArray(onlyQuizIds)) {
    const validIds = onlyQuizIds
      .filter((id) => typeof id === 'string' && mongoose.Types.ObjectId.isValid(id))
      .map((id) => new mongoose.Types.ObjectId(id));
    if (validIds.length === 0) {
      return { quizzes: [], cutoffDate, minAgeDays: resolvedDays };
    }
    filter._id = { $in: validIds };
  }

  const oldQuizzes = (await Quiz.find(filter)
    .select('_id title isPublished questionCount timeLimit organizationId createdAt course instructor')
    .populate('course', 'title')
    .populate('instructor', 'name email role')
    .sort({ createdAt: 1 })
    .lean()) as unknown as RawQuizDoc[];

  if (oldQuizzes.length === 0) {
    return { quizzes: [], cutoffDate, minAgeDays: resolvedDays };
  }

  const candidateIds = oldQuizzes.map((q) => q._id);

  // Authoritative checks: exclude any quiz with student attempts, or linked to any Contest / ContestAttempt / Challenge
  const [attemptedIds, contestLinkedIds, contestAttemptIds, challengeLinkedIds] = await Promise.all([
    QuizAttempt.distinct('quiz', { quiz: { $in: candidateIds } }),
    Contest.distinct('quizzes.quiz', { 'quizzes.quiz': { $in: candidateIds } }),
    ContestAttempt.distinct('answers.quizId', { 'answers.quizId': { $in: candidateIds } }),
    Challenge.distinct('quiz', { quiz: { $in: candidateIds } }),
  ]);

  const protectedIdSet = new Set<string>([
    ...attemptedIds.map((id) => String(id)),
    ...contestLinkedIds.map((id) => String(id)),
    ...contestAttemptIds.map((id) => String(id)),
    ...challengeLinkedIds.map((id) => String(id)),
  ]);

  const eligibleQuizzes: InactiveQuizCandidate[] = [];

  for (const quiz of oldQuizzes) {
    const idStr = quiz._id.toString();
    if (protectedIdSet.has(idStr)) continue;

    const createdMs = new Date(quiz.createdAt).getTime();
    const ageDays = Math.floor((nowMs - createdMs) / (24 * 60 * 60 * 1000));

    const rawCourse = quiz.course;
    const coursePopulated =
      rawCourse && typeof rawCourse === 'object' && '_id' in rawCourse && 'title' in rawCourse;
    const course = coursePopulated
      ? {
          _id: (rawCourse as PopulatedCourseDoc)._id.toString(),
          title: (rawCourse as PopulatedCourseDoc).title || 'Untitled Course',
        }
      : null;

    const rawInstructor = quiz.instructor;
    const instructorPopulated =
      rawInstructor &&
      typeof rawInstructor === 'object' &&
      '_id' in rawInstructor &&
      ('email' in rawInstructor || 'name' in rawInstructor);
    const instructor = instructorPopulated
      ? {
          _id: (rawInstructor as PopulatedInstructorDoc)._id.toString(),
          name: (rawInstructor as PopulatedInstructorDoc).name || 'Teacher',
          email: (rawInstructor as PopulatedInstructorDoc).email || '',
          role: (rawInstructor as PopulatedInstructorDoc).role || 'teacher',
        }
      : null;

    eligibleQuizzes.push({
      _id: idStr,
      title: quiz.title,
      isPublished: Boolean(quiz.isPublished),
      questionCount: quiz.questionCount ?? 0,
      timeLimit: quiz.timeLimit ?? 0,
      organizationId: quiz.organizationId ? quiz.organizationId.toString() : null,
      createdAt: new Date(quiz.createdAt).toISOString(),
      ageDays,
      course,
      instructor,
    });
  }

  return { quizzes: eligibleQuizzes, cutoffDate, minAgeDays: resolvedDays };
}

export interface QuizCleanupExecutionResult {
  deletedCount: number;
  skippedCount: number;
  minAgeDays: number;
  deletedQuizzes: Array<{ _id: string; title: string }>;
}

/**
 * Deletes all eligible inactive quizzes (created > N days ago, 0 attempts, not used by contests/challenges)
 * along with their questions. Intentionally sends NO emails.
 */
export async function cleanupInactiveZeroAttemptQuizzes(params?: {
  quizIds?: string[];
  minAgeDays?: number;
}): Promise<QuizCleanupExecutionResult> {
  const { quizzes, cutoffDate, minAgeDays } = await findInactiveZeroAttemptQuizzes(
    params?.quizIds,
    params?.minAgeDays
  );

  const deletedQuizzes: Array<{ _id: string; title: string }> = [];
  const verifiedDeleteIds: string[] = [];
  const affectedOrgIds = new Set<string>();
  let skippedCount = 0;

  for (const candidate of quizzes) {
    // Re-verify live counts and references right before deleting (TOCTOU protection)
    const [liveAttemptCount, contestRef, contestAttemptRef, challengeRef, liveQuiz] = await Promise.all([
      QuizAttempt.countDocuments({ quiz: candidate._id }),
      Contest.exists({ 'quizzes.quiz': candidate._id }),
      ContestAttempt.exists({ 'answers.quizId': candidate._id }),
      Challenge.exists({ quiz: candidate._id }),
      Quiz.findById(candidate._id).select('_id createdAt organizationId').lean<{
        _id: mongoose.Types.ObjectId;
        createdAt: Date;
        organizationId?: mongoose.Types.ObjectId | null;
      }>(),
    ]);

    if (
      !liveQuiz ||
      liveAttemptCount > 0 ||
      Boolean(contestRef) ||
      Boolean(contestAttemptRef) ||
      Boolean(challengeRef) ||
      new Date(liveQuiz.createdAt).getTime() >= cutoffDate.getTime()
    ) {
      skippedCount += 1;
      continue;
    }

    verifiedDeleteIds.push(candidate._id);
    deletedQuizzes.push({ _id: candidate._id, title: candidate.title });
    affectedOrgIds.add(liveQuiz.organizationId?.toString() || 'public');
  }

  if (verifiedDeleteIds.length > 0) {
    await deleteQuizzesAndQuestions(verifiedDeleteIds);
  }

  for (const orgId of affectedOrgIds) {
    await invalidatePattern(`quizzes:${orgId}:*`);
  }

  return {
    deletedCount: deletedQuizzes.length,
    skippedCount,
    minAgeDays,
    deletedQuizzes,
  };
}
