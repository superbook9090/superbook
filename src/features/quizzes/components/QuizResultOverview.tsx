'use client';

import {
  Award,
  Trophy,
  Users,
  Check,
  X,
  Minus,
  Target,
  type LucideIcon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { AttemptMetrics } from '@/lib/quiz/attemptMetrics';
import { formatMarks, formatPercent } from '@/lib/quiz/attemptMetrics';
import { cn } from '@/lib/utils';

type StatTone = 'blue' | 'purple' | 'pink' | 'green' | 'red' | 'sky' | 'orange';

const TONE_STYLES: Record<StatTone, { icon: string; bg: string }> = {
  blue: { icon: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-500/15' },
  purple: { icon: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-500/15' },
  pink: { icon: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-500/15' },
  green: { icon: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-500/15' },
  red: { icon: 'text-red-600', bg: 'bg-red-100 dark:bg-red-500/15' },
  sky: { icon: 'text-sky-600', bg: 'bg-sky-100 dark:bg-sky-500/15' },
  orange: { icon: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-500/15' },
};

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: StatTone;
  className?: string;
}) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={cn('flex flex-col items-center text-center px-1 py-2 sm:py-3 min-w-0', className)}>
      <div
        className={cn(
          'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-2 shrink-0',
          styles.bg
        )}
      >
        <Icon className={cn('w-5 h-5', styles.icon)} />
      </div>
      <p className="text-xs sm:text-sm md:text-base font-bold text-[var(--color-foreground)] leading-tight break-words max-w-full">
        {value}
      </p>
      <p className="text-[10px] sm:text-[11px] md:text-xs text-[var(--color-muted-foreground)] mt-1 leading-snug px-0.5">
        {label}
      </p>
    </div>
  );
}

function AnswerDonut({
  correct,
  incorrect,
  unattempted,
  labels,
}: {
  correct: number;
  incorrect: number;
  unattempted: number;
  labels: { correct: string; incorrect: string; unattempted: string };
}) {
  const total = correct + incorrect + unattempted;
  const size = 168;
  const stroke = 24;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { value: correct, color: '#22c55e', label: labels.correct },
    { value: incorrect, color: '#ef4444', label: labels.incorrect },
    { value: unattempted, color: '#38bdf8', label: labels.unattempted },
  ];

  const drawableSegments = segments.filter((s) => s.value > 0);

  let offset = 0;

  return (
    <div className="flex flex-col items-center w-full">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="shrink-0 -rotate-90 w-[140px] h-[140px] sm:w-[168px] sm:h-[168px]"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          drawableSegments.map((segment) => {
            const length = (segment.value / total) * circumference;
            const dasharray = `${length} ${circumference - length}`;
            const dashoffset = -offset;
            offset += length;
            return (
              <circle
                key={segment.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={segment.color}
                strokeWidth={stroke}
                strokeDasharray={dasharray}
                strokeDashoffset={dashoffset}
                strokeLinecap="butt"
              />
            );
          })}
      </svg>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3 sm:mt-4 px-2">
        {segments.map((segment) => (
          <div key={segment.label} className="flex items-center gap-1.5 text-xs sm:text-sm">
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: segment.color, opacity: segment.value > 0 ? 1 : 0.35 }}
            />
            <span className="text-[var(--color-muted-foreground)]">
              {segment.label}
              {segment.value > 0 ? '' : ' (0)'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizResultOverview({
  metrics,
  rank,
  totalParticipants,
  percentile,
}: {
  metrics: AttemptMetrics;
  rank: number;
  totalParticipants: number;
  percentile: number;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] overflow-hidden mb-4">
      <div className="p-3 sm:p-5 lg:p-6">
        <div className="grid lg:grid-cols-[1fr_auto] lg:gap-10 xl:gap-12 lg:items-center">
          <div className="min-w-0">
            <div className="grid grid-cols-3 gap-0.5 sm:gap-2 border-b border-[var(--color-border)] pb-3 sm:pb-4 mb-3 sm:mb-4">
              <StatCard
                icon={Award}
                tone="blue"
                label={t('quizResult.yourScore')}
                value={formatMarks(metrics.scoreMarks, metrics.maxMarks)}
              />
              <StatCard
                icon={Trophy}
                tone="purple"
                label={t('quizResult.rank')}
                value={`${rank} / ${totalParticipants}`}
              />
              <StatCard
                icon={Users}
                tone="pink"
                label={t('quizResult.percentile')}
                value={formatPercent(percentile)}
              />
            </div>

            <div className="grid grid-cols-3 gap-0.5 sm:gap-2 border-b border-[var(--color-border)] pb-3 sm:pb-4 mb-3 sm:mb-4">
              <StatCard
                icon={Check}
                tone="green"
                label={t('quizResult.correct')}
                value={String(Math.round(metrics.correct))}
              />
              <StatCard
                icon={X}
                tone="red"
                label={t('quizResult.incorrect')}
                value={String(Math.round(metrics.wrong))}
              />
              <StatCard
                icon={Minus}
                tone="sky"
                label={t('quizResult.unattempted')}
                value={String(Math.round(metrics.unattempted))}
              />
            </div>

            <StatCard
              icon={Target}
              tone="orange"
              label={t('quizResult.comparisonAccuracy')}
              value={formatPercent(metrics.accuracy)}
              className="mx-auto lg:max-w-[33%]"
            />
          </div>

          <div className="mt-2 pt-4 border-t border-[var(--color-border)] lg:mt-0 lg:pt-0 lg:border-t-0 lg:min-w-[180px] xl:min-w-[220px]">
            <AnswerDonut
              correct={Math.round(metrics.correct)}
              incorrect={Math.round(metrics.wrong)}
              unattempted={Math.round(metrics.unattempted)}
              labels={{
                correct: t('quizResult.correct'),
                incorrect: t('quizResult.incorrect'),
                unattempted: t('quizResult.unattempted'),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
