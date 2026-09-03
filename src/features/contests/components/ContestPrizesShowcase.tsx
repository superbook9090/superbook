'use client';

import React from 'react';
import { Trophy, Medal, Award, Gift, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { ContestPrize } from '@/lib/api/contests';

interface ContestPrizesShowcaseProps {
  prizes?: ContestPrize[];
  compact?: boolean;
}

export function ContestPrizesShowcase({ prizes = [], compact = false }: ContestPrizesShowcaseProps) {
  const { t } = useTranslation();

  if (!prizes || prizes.length === 0) {
    return null;
  }

  const getPrizeIcon = (rank: number | string, rewardType?: string) => {
    const rankStr = String(rank);
    if (rankStr === '1') return <Trophy className="w-5 h-5 text-[var(--warning)]" />;
    if (rankStr === '2') return <Medal className="w-5 h-5 text-[var(--color-muted)]" />;
    if (rankStr === '3') return <Medal className="w-5 h-5 text-[var(--accent)]" />;
    if (rewardType === 'gift' || rewardType === 'cash') return <Gift className="w-4 h-4 text-[var(--success)]" />;
    return <Award className="w-4 h-4 text-[var(--info)]" />;
  };

  const getBadgeStyle = (rank: number | string) => {
    const rankStr = String(rank);
    if (rankStr === '1') {
      return 'bg-gradient-to-r from-[var(--warning-light)] to-[var(--warning-light)]/60 border-[var(--warning)]/40 text-[var(--color-foreground)]';
    }
    if (rankStr === '2') {
      return 'bg-gradient-to-r from-[var(--color-surface-muted)] to-[var(--color-surface-muted)]/60 border-[var(--color-border)] text-[var(--color-foreground)]';
    }
    if (rankStr === '3') {
      return 'bg-gradient-to-r from-[var(--error-light)]/50 to-[var(--warning-light)]/50 border-[var(--error)]/30 text-[var(--color-foreground)]';
    }
    return 'bg-[var(--card-solid)] border-[var(--border)] text-[var(--color-foreground)]';
  };

  if (compact) {
    const topPrize = prizes.find((p) => String(p.rank) === '1') || prizes[0];
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--warning-light)] text-[var(--warning-foreground)] border border-[var(--warning)]/30 text-xs font-semibold">
        <Trophy className="w-3.5 h-3.5 shrink-0 text-[var(--warning)]" />
        <span className="truncate max-w-[180px]">
          {topPrize.value ? `${topPrize.title}: ${topPrize.value}` : topPrize.title}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
        <Sparkles className="w-4 h-4 text-[var(--warning)]" />
        <span>{t('contest.prizesAndRewards') || 'Prizes & Rewards'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {prizes.map((prize, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border shadow-2xs flex items-start gap-3 transition-transform hover:-translate-y-0.5 ${getBadgeStyle(
              prize.rank
            )}`}
          >
            <div className="p-2 rounded-lg bg-[var(--card-solid)] shadow-xs shrink-0 flex items-center justify-center">
              {getPrizeIcon(prize.rank, prize.rewardType)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">
                  {t('contest.rank') || 'Rank'} #{prize.rank}
                </span>
                {prize.value && (
                  <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-1.5 py-0.5 rounded">
                    {prize.value}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-[var(--color-foreground)] truncate mt-0.5">
                {prize.title}
              </h4>
              {prize.description && (
                <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 mt-0.5">
                  {prize.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
