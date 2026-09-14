'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Swords, Zap, Crown } from 'lucide-react';

interface ChallengeHeadToHeadCardProps {
  challengerName: string;
  challengerImage?: string | null;
  opponentName: string;
  opponentImage?: string | null;
  opponentScore: number;
  opponentCorrect: number;
  opponentTotal: number;
  opponentTime: number;
  challengerScore: number;
  challengerCorrect: number;
  challengerTotal: number;
  challengerTime: number;
  isWon: boolean;
  isDraw: boolean;
  formatTime: (secs: number) => string;
}

export function ChallengeHeadToHeadCard({
  challengerName,
  challengerImage,
  opponentName,
  opponentImage,
  opponentScore,
  opponentCorrect,
  opponentTotal,
  opponentTime,
  challengerScore,
  challengerCorrect,
  challengerTotal,
  challengerTime,
  isWon,
  isDraw,
  formatTime,
}: ChallengeHeadToHeadCardProps) {
  const { t } = useTranslation();

  const isUserWinner = isWon && !isDraw;
  const isChallengerWinner = !isWon && !isDraw;

  const isUserFaster = opponentTime > 0 && challengerTime > 0 && opponentTime < challengerTime;
  const isChallengerFaster = opponentTime > 0 && challengerTime > 0 && challengerTime < opponentTime;
  const timeDiff = Math.abs(opponentTime - challengerTime);

  return (
    <div className="w-full card-surface rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden">
      {/* Header Bar */}
      <div className="px-5 py-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
            {t('challenge.headToHead')}
          </span>
        </div>
        {opponentScore === challengerScore && !isDraw && (
          <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
            <Zap className="w-3 h-3" />
            {t('challenge.fasterBadge', { timeDiff: formatTime(timeDiff) })}
          </span>
        )}
      </div>

      {/* Combatants Grid */}
      <div className="relative grid grid-cols-2 p-5 sm:p-6 gap-2 sm:gap-4">
        {/* Center VS Divider */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-border)] shadow-lg flex items-center justify-center text-[10px] font-black text-[var(--color-muted-foreground)]">
            VS
          </div>
        </div>

        {/* User (Left) */}
        <div
          className={`flex flex-col items-center text-center p-4 rounded-xl transition-all ${
            isUserWinner
              ? 'bg-emerald-500/10 border border-emerald-500/30'
              : 'bg-[var(--color-muted)]/5 border border-transparent'
          }`}
        >
          {/* Avatar & Winner Badge */}
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md overflow-hidden">
              {opponentImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={opponentImage} alt={opponentName} className="w-full h-full object-cover" />
              ) : (
                (opponentName || 'Y')[0].toUpperCase()
              )}
            </div>
            {isUserWinner && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white rounded-full p-1 shadow-md">
                <Crown className="w-3 h-3" />
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-[var(--color-primary)] max-w-full truncate px-1">
            {opponentName}
          </span>

          <span className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mt-1 tracking-tight">
            {opponentScore}%
          </span>

          {/* Stats Pills */}
          <div className="flex flex-col gap-1 mt-3 w-full max-w-[130px]">
            <div className="text-[11px] font-medium py-1 px-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)]">
              {t('challenge.correctCountDesc', {
                correct: String(opponentCorrect),
                total: String(opponentTotal),
              })}
            </div>
            <div className="text-[11px] font-medium py-1 px-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] flex items-center justify-center gap-1">
              <span>⏱️ {formatTime(opponentTime)}</span>
              {isUserFaster && <Zap className="w-2.5 h-2.5 text-emerald-400" />}
            </div>
          </div>
        </div>

        {/* Challenger (Right) */}
        <div
          className={`flex flex-col items-center text-center p-4 rounded-xl transition-all ${
            isChallengerWinner
              ? 'bg-amber-500/10 border border-amber-500/30'
              : 'bg-[var(--color-muted)]/5 border border-transparent'
          }`}
        >
          {/* Avatar & Winner Badge */}
          <div className="relative mb-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-base shadow-md overflow-hidden">
              {challengerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={challengerImage} alt={challengerName} className="w-full h-full object-cover" />
              ) : (
                (challengerName || 'C')[0].toUpperCase()
              )}
            </div>
            {isChallengerWinner && (
              <span className="absolute -top-2 -right-2 bg-amber-600 text-white rounded-full p-1 shadow-md">
                <Crown className="w-3 h-3" />
              </span>
            )}
          </div>

          <span className="text-xs font-semibold text-amber-500 max-w-full truncate px-1">
            {challengerName}
          </span>

          <span className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mt-1 tracking-tight">
            {challengerScore}%
          </span>

          {/* Stats Pills */}
          <div className="flex flex-col gap-1 mt-3 w-full max-w-[130px]">
            <div className="text-[11px] font-medium py-1 px-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-foreground)]">
              {t('challenge.correctCountDesc', {
                correct: String(challengerCorrect),
                total: String(challengerTotal || opponentTotal),
              })}
            </div>
            <div className="text-[11px] font-medium py-1 px-2 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[var(--color-muted-foreground)] flex items-center justify-center gap-1">
              <span>⏱️ {formatTime(challengerTime)}</span>
              {isChallengerFaster && <Zap className="w-2.5 h-2.5 text-amber-400" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
