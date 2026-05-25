import type { AttemptMetrics } from '@/lib/quiz/attemptMetrics';
import { computeAttemptMetrics } from '@/lib/quiz/attemptMetrics';
import type { QuizComparison } from '@/lib/quiz/quizComparison';

export const DEFAULT_TIME_LIMIT_MINUTES = 30;

export function safeNumber(value: unknown, fallback = 0): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeAttemptMetrics(metrics: Partial<AttemptMetrics>): AttemptMetrics {
  const totalQuestions = Math.max(0, Math.round(safeNumber(metrics.totalQuestions)));
  const maxMarks = Math.max(safeNumber(metrics.maxMarks), totalQuestions, 1);

  return {
    scoreMarks: Math.max(0, safeNumber(metrics.scoreMarks)),
    maxMarks,
    scorePercent: Math.min(100, Math.max(0, safeNumber(metrics.scorePercent))),
    accuracy: Math.min(100, Math.max(0, safeNumber(metrics.accuracy))),
    correct: Math.max(0, Math.round(safeNumber(metrics.correct))),
    wrong: Math.max(0, Math.round(safeNumber(metrics.wrong))),
    unattempted: Math.max(0, Math.round(safeNumber(metrics.unattempted))),
    totalQuestions,
    timeTaken: Math.max(0, safeNumber(metrics.timeTaken)),
    timeLimitMinutes: Math.max(1, safeNumber(metrics.timeLimitMinutes, DEFAULT_TIME_LIMIT_MINUTES)),
  };
}

export function normalizeScoreScale(scale: Partial<QuizComparison['scoreScale']>): QuizComparison['scoreScale'] {
  const value = Math.min(100, Math.max(0, safeNumber(scale.value)));
  let min = Math.max(0, safeNumber(scale.min));
  let max = Math.min(100, safeNumber(scale.max, 100));

  if (max <= min) {
    min = Math.max(0, value - 10);
    max = Math.min(100, value + 10);
  }
  if (max <= min) {
    min = 0;
    max = 100;
  }

  return { min, max, value };
}

export function normalizeQuizComparison(comparison: Partial<QuizComparison>): QuizComparison {
  const you = normalizeAttemptMetrics(comparison.you ?? {});
  const topper = normalizeAttemptMetrics(comparison.topper ?? you);
  const average = normalizeAttemptMetrics(comparison.average ?? you);
  const totalParticipants = Math.max(1, Math.round(safeNumber(comparison.totalParticipants, 1)));
  const rank = Math.min(
    totalParticipants,
    Math.max(1, Math.round(safeNumber(comparison.rank, 1)))
  );
  const percentile = Math.min(
    100,
    Math.max(0, safeNumber(comparison.percentile, totalParticipants <= 1 ? 100 : 0))
  );

  return {
    you,
    topper,
    average,
    rank,
    totalParticipants,
    percentile,
    scoreScale: normalizeScoreScale(comparison.scoreScale ?? { min: 0, max: 100, value: you.scorePercent }),
  };
}

type GradedAnswer = {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
};

/** Build comparison from attempt data when API omits or partial comparison. */
export function buildFallbackComparison(input: {
  score: number;
  totalQuestions: number;
  timeTaken: number;
  timeLimitMinutes: number;
  answers: GradedAnswer[];
}): QuizComparison {
  const totalQuestions = Math.max(
    0,
    safeNumber(input.totalQuestions),
    input.answers.length
  );
  const timeLimitMinutes = Math.max(1, safeNumber(input.timeLimitMinutes, DEFAULT_TIME_LIMIT_MINUTES));

  const you = normalizeAttemptMetrics(
    computeAttemptMetrics(
      input.answers.map((a) => ({
        questionId: a.questionId,
        selectedOption: safeNumber(a.selectedOption, -1),
        isCorrect: Boolean(a.isCorrect),
      })),
      new Map(input.answers.map((a) => [a.questionId, { points: 1 }])),
      totalQuestions,
      safeNumber(input.timeTaken),
      timeLimitMinutes,
      safeNumber(input.score)
    )
  );

  return normalizeQuizComparison({
    you,
    topper: you,
    average: you,
    rank: 1,
    totalParticipants: 1,
    percentile: 100,
    scoreScale: { min: 0, max: 100, value: you.scorePercent },
  });
}

export function resolveQuizComparison(input: {
  comparison?: Partial<QuizComparison> | null;
  score: number;
  totalQuestions: number;
  timeTaken: number;
  timeLimitMinutes: number;
  answers: GradedAnswer[];
}): QuizComparison {
  if (input.comparison?.you) {
    return normalizeQuizComparison(input.comparison);
  }
  return buildFallbackComparison(input);
}
