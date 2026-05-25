export type QuestionPoints = { points: number };

export type AttemptMetrics = {
  scoreMarks: number;
  maxMarks: number;
  scorePercent: number;
  accuracy: number;
  correct: number;
  wrong: number;
  unattempted: number;
  totalQuestions: number;
  timeTaken: number;
  timeLimitMinutes: number;
};

type GradedAnswer = {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
};

export function computeAttemptMetrics(
  answers: GradedAnswer[],
  questionPoints: Map<string, QuestionPoints>,
  totalQuestions: number,
  timeTaken: number,
  timeLimitMinutes: number,
  scorePercent: number
): AttemptMetrics {
  const maxMarks = Math.max(
    [...questionPoints.values()].reduce((sum, q) => sum + q.points, 0),
    totalQuestions,
    1
  );

  let scoreMarks = 0;
  let correct = 0;
  let wrong = 0;

  for (const answer of answers) {
    const points = questionPoints.get(answer.questionId)?.points ?? 1;
    if (answer.isCorrect) {
      correct += 1;
      scoreMarks += points;
    } else if (answer.selectedOption !== -1) {
      wrong += 1;
    }
  }

  const answered = correct + wrong;
  const unattempted = Math.max(0, totalQuestions - answered);
  const accuracy = answered > 0 ? (correct / answered) * 100 : 0;

  return {
    scoreMarks,
    maxMarks,
    scorePercent,
    accuracy,
    correct,
    wrong,
    unattempted,
    totalQuestions,
    timeTaken,
    timeLimitMinutes,
  };
}

export function averageMetrics(list: AttemptMetrics[]): AttemptMetrics | null {
  if (list.length === 0) return null;

  const n = list.length;
  const sum = list.reduce(
    (acc, m) => ({
      scoreMarks: acc.scoreMarks + m.scoreMarks,
      maxMarks: acc.maxMarks + m.maxMarks,
      scorePercent: acc.scorePercent + m.scorePercent,
      accuracy: acc.accuracy + m.accuracy,
      correct: acc.correct + m.correct,
      wrong: acc.wrong + m.wrong,
      unattempted: acc.unattempted + m.unattempted,
      totalQuestions: acc.totalQuestions + m.totalQuestions,
      timeTaken: acc.timeTaken + m.timeTaken,
      timeLimitMinutes: acc.timeLimitMinutes + m.timeLimitMinutes,
    }),
    {
      scoreMarks: 0,
      maxMarks: 0,
      scorePercent: 0,
      accuracy: 0,
      correct: 0,
      wrong: 0,
      unattempted: 0,
      totalQuestions: 0,
      timeTaken: 0,
      timeLimitMinutes: 0,
    }
  );

  return {
    scoreMarks: sum.scoreMarks / n,
    maxMarks: sum.maxMarks / n,
    scorePercent: sum.scorePercent / n,
    accuracy: sum.accuracy / n,
    correct: sum.correct / n,
    wrong: sum.wrong / n,
    unattempted: sum.unattempted / n,
    totalQuestions: sum.totalQuestions / n,
    timeLimitMinutes: sum.timeLimitMinutes / n,
    timeTaken: sum.timeTaken / n,
  };
}

export function formatMarks(value: number, max: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Math.max(Number.isFinite(max) ? max : 0, 1);
  const decimals = Number.isInteger(safeValue) && Number.isInteger(safeMax) ? 0 : 1;
  return `${safeValue.toFixed(decimals)}/${safeMax.toFixed(decimals)}`;
}

export function formatPercent(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toFixed(2)}%`;
}

export function formatCount(value: number, total: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeTotal = Math.max(Number.isFinite(total) ? total : 0, 0);
  const display = Number.isInteger(safeValue) ? String(Math.round(safeValue)) : safeValue.toFixed(1);
  return `${display}/${Math.round(safeTotal)}`;
}

export function formatTimeTaken(timeTakenSeconds: number, timeLimitMinutes: number): string {
  const minutes = Math.max(0, Math.round((Number.isFinite(timeTakenSeconds) ? timeTakenSeconds : 0) / 60));
  const limit = Math.max(1, Number.isFinite(timeLimitMinutes) ? timeLimitMinutes : 30);
  return `${minutes}/${limit} min`;
}
