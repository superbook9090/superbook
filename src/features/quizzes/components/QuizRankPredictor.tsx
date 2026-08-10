'use client';

import { useTranslation } from '@/hooks/useTranslation';

type ScoreScale = {
  min: number;
  max: number;
  value: number;
};

export function QuizRankPredictor({
  rank,
  totalParticipants,
  scoreScale,
}: {
  rank: number;
  totalParticipants: number;
  scoreScale: ScoreScale;
}) {
  const { t } = useTranslation();
  const range = Math.max(scoreScale.max - scoreScale.min, 1);
  const position = Math.min(100, Math.max(0, ((scoreScale.value - scoreScale.min) / range) * 100));

  const ticks: number[] = [];
  const step = range <= 20 ? 5 : 10;
  for (let v = scoreScale.min; v <= scoreScale.max; v += step) {
    ticks.push(v);
  }
  if (ticks[ticks.length - 1] !== scoreScale.max) {
    ticks.push(scoreScale.max);
  }

  return (
    <div className="bg-[var(--card-solid)] rounded-2xl border border-[var(--color-border)] p-4 sm:p-5 mb-4">
      <h2 className="text-center text-base sm:text-lg font-semibold text-[var(--color-foreground)] mb-4">
        {t('quizResult.rankPredictor')}
      </h2>

      <div className="relative px-4 sm:px-8 pb-2">
        <div className="mt-12 border-t-2 border-[var(--color-border)] relative h-6">
          <div
            className="absolute bottom-full mb-1 z-10 -translate-x-1/2 flex flex-col items-center"
            style={{ left: `${position}%` }}
          >
            <div className="rounded-lg bg-[var(--color-foreground)] text-[var(--color-background)] px-3 py-1.5 text-xs sm:text-sm font-semibold whitespace-nowrap shadow-md">
              {t('quizResult.rankLabel', { rank })}
            </div>
            <div className="h-0 w-0 border-x-[6px] border-x-transparent border-t-[8px] border-t-[var(--color-foreground)]" />
          </div>
          {ticks.map((tick) => {
            const tickPos = ((tick - scoreScale.min) / range) * 100;
            return (
              <div
                key={tick}
                className="absolute -top-1 flex flex-col items-center"
                style={{ left: `${tickPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="h-3 w-px bg-[var(--color-border)]" />
                <span className="mt-1 text-[10px] sm:text-xs text-[var(--color-muted-foreground)]">{tick}</span>
              </div>
            );
          })}
        </div>
      </div>

      {totalParticipants > 0 && (
        <p className="text-center text-xs text-[var(--color-muted-foreground)] mt-3">
          {t('quizResult.rankAmongParticipants', { total: totalParticipants })}
        </p>
      )}
    </div>
  );
}
