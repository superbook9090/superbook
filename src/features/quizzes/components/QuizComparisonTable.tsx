'use client';

import { useTranslation } from '@/hooks/useTranslation';
import type { AttemptMetrics } from '@/lib/quiz/attemptMetrics';
import {
  formatCount,
  formatMarks,
  formatPercent,
  formatTimeTaken,
} from '@/lib/quiz/attemptMetrics';

type ComparisonRow = {
  key: string;
  label: string;
  you: string;
  topper: string;
  average: string;
  rowClass: string;
};

function buildRows(
  you: AttemptMetrics,
  topper: AttemptMetrics,
  average: AttemptMetrics,
  labels: Record<string, string>
): ComparisonRow[] {
  const total = Math.round(you.totalQuestions);

  return [
    {
      key: 'score',
      label: labels.score,
      you: formatMarks(you.scoreMarks, you.maxMarks),
      topper: formatMarks(topper.scoreMarks, topper.maxMarks),
      average: formatMarks(average.scoreMarks, average.maxMarks),
      rowClass: 'bg-violet-100/80 dark:bg-violet-500/15',
    },
    {
      key: 'accuracy',
      label: labels.accuracy,
      you: formatPercent(you.accuracy),
      topper: formatPercent(topper.accuracy),
      average: formatPercent(average.accuracy),
      rowClass: 'bg-sky-100/80 dark:bg-sky-500/15',
    },
    {
      key: 'correct',
      label: labels.correct,
      you: formatCount(you.correct, total),
      topper: formatCount(topper.correct, total),
      average: formatCount(average.correct, total),
      rowClass: 'bg-amber-100/80 dark:bg-amber-500/15',
    },
    {
      key: 'wrong',
      label: labels.wrong,
      you: formatCount(you.wrong, total),
      topper: formatCount(topper.wrong, total),
      average: formatCount(average.wrong, total),
      rowClass: 'bg-rose-100/80 dark:bg-rose-500/15',
    },
    {
      key: 'time',
      label: labels.time,
      you: formatTimeTaken(you.timeTaken, you.timeLimitMinutes),
      topper: formatTimeTaken(topper.timeTaken, topper.timeLimitMinutes),
      average: formatTimeTaken(average.timeTaken, average.timeLimitMinutes),
      rowClass: 'bg-yellow-100/80 dark:bg-yellow-500/15',
    },
  ];
}

function MetricCell({ value, rowClass }: { value: string; rowClass: string }) {
  return (
    <td className="p-2 sm:p-3 text-center border border-[var(--color-border)]">
      <span className={`inline-block min-w-[4.5rem] px-2 py-1 rounded-md text-xs sm:text-sm font-medium text-[var(--color-foreground)] ${rowClass}`}>
        {value}
      </span>
    </td>
  );
}

export function QuizComparisonTable({
  you,
  topper,
  average,
}: {
  you: AttemptMetrics;
  topper: AttemptMetrics;
  average: AttemptMetrics;
}) {
  const { t } = useTranslation();

  const rows = buildRows(you, topper, average, {
    score: t('quizResult.comparisonScore'),
    accuracy: t('quizResult.comparisonAccuracy'),
    correct: t('quizResult.comparisonCorrect'),
    wrong: t('quizResult.comparisonWrong'),
    time: t('quizResult.comparisonTime'),
  });

  return (
    <div className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 mb-4 overflow-x-auto">
      <h2 className="text-center text-base sm:text-lg font-semibold text-[var(--color-foreground)] mb-4">
        {t('quizResult.comparison')}
      </h2>

      <table className="w-full min-w-[320px] border-collapse text-sm">
        <thead>
          <tr>
            <th className="p-2 sm:p-3 border border-[var(--color-border)] rounded-tl-lg" />
            <th className="p-2 sm:p-3 text-center font-semibold border border-[var(--color-border)] bg-violet-100/90 dark:bg-violet-500/20 text-[var(--color-foreground)]">
              {t('quizResult.comparisonYou')}
            </th>
            <th className="p-2 sm:p-3 text-center font-semibold border border-[var(--color-border)] bg-emerald-100/90 dark:bg-emerald-500/20 text-[var(--color-foreground)]">
              {t('quizResult.comparisonTopper')}
            </th>
            <th className="p-2 sm:p-3 text-center font-semibold border border-[var(--color-border)] rounded-tr-lg bg-sky-100/90 dark:bg-sky-500/20 text-[var(--color-foreground)]">
              {t('quizResult.comparisonAverage')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="p-2 sm:p-3 font-medium text-[var(--color-foreground)] border border-[var(--color-border)] whitespace-nowrap">
                {row.label}
              </td>
              <MetricCell value={row.you} rowClass={row.rowClass} />
              <MetricCell value={row.topper} rowClass={row.rowClass} />
              <MetricCell value={row.average} rowClass={row.rowClass} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
