import type { AttemptMetrics } from '@/lib/quiz/attemptMetrics';
import { averageMetrics, computeAttemptMetrics, type QuestionPoints } from '@/lib/quiz/attemptMetrics';
import { normalizeQuizComparison, safeNumber } from './resultDefaults';

type StoredAnswer = {
  question: { toString(): string };
  selectedOption: number;
  isCorrect: boolean;
};

type StoredAttempt = {
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  answers: StoredAnswer[];
};

export type QuizComparison = {
  you: AttemptMetrics;
  topper: AttemptMetrics;
  average: AttemptMetrics;
  rank: number;
  totalParticipants: number;
  percentile: number;
  scoreScale: { min: number; max: number; value: number };
};

function buildQuestionPointsMap(
  questions: { _id: { toString(): string }; points?: number }[]
): Map<string, QuestionPoints> {
  return new Map(questions.map((q) => [q._id.toString(), { points: q.points ?? 1 }]));
}

function metricsFromAttempt(
  attempt: StoredAttempt,
  questionPoints: Map<string, QuestionPoints>,
  timeLimitMinutes: number
): AttemptMetrics {
  return computeAttemptMetrics(
    attempt.answers.map((a) => ({
      questionId: a.question.toString(),
      selectedOption: a.selectedOption,
      isCorrect: a.isCorrect,
    })),
    questionPoints,
    attempt.totalQuestions,
    attempt.timeTaken,
    timeLimitMinutes,
    attempt.score
  );
}

function isBetterAttempt(a: StoredAttempt, b: StoredAttempt): boolean {
  if (a.score !== b.score) return a.score > b.score;
  return a.timeTaken < b.timeTaken;
}

function computeRank(userAttempt: StoredAttempt, peers: StoredAttempt[]): number {
  return peers.filter((peer) => isBetterAttempt(peer, userAttempt)).length + 1;
}

function computePercentile(rank: number, totalParticipants: number): number {
  if (totalParticipants <= 1) return 100;
  return ((totalParticipants - rank) / totalParticipants) * 100;
}

export function buildQuizComparison(
  userAttempt: StoredAttempt,
  peerAttempts: StoredAttempt[],
  questions: { _id: { toString(): string }; points?: number }[],
  timeLimitMinutes: number
): QuizComparison {
  const questionPoints = buildQuestionPointsMap(questions);
  const you = metricsFromAttempt(userAttempt, questionPoints, timeLimitMinutes);

  const peers = peerAttempts.length > 0 ? peerAttempts : [userAttempt];
  const topperAttempt = peers.reduce((best, current) => (isBetterAttempt(current, best) ? current : best), peers[0]);
  const topper = metricsFromAttempt(topperAttempt, questionPoints, timeLimitMinutes);

  const allMetrics = peers.map((a) => metricsFromAttempt(a, questionPoints, timeLimitMinutes));
  const average = averageMetrics(allMetrics) ?? you;

  const scores = [...allMetrics.map((m) => m.scorePercent), you.scorePercent].filter(Number.isFinite);
  const min = scores.length ? Math.min(...scores) : 0;
  const max = scores.length ? Math.max(...scores) : 100;

  const rank = computeRank(userAttempt, peers);

  return normalizeQuizComparison({
    you,
    topper,
    average,
    rank,
    totalParticipants: peers.length,
    percentile: computePercentile(rank, peers.length),
    scoreScale: {
      min: Math.max(0, Math.floor(safeNumber(min) / 5) * 5),
      max: Math.min(100, Math.ceil(safeNumber(max) / 5) * 5 || 100),
      value: you.scorePercent,
    },
  });
}
