'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Clock, Lock, Sparkles, User as UserIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDuration } from '@/lib/dateUtils';
import type { ContestLeaderboardEntry, ContestPrize } from '@/lib/api/contests';

interface ContestLeaderboardProps {
  data: ContestLeaderboardEntry[];
  prizes?: ContestPrize[];
  userRank?: number | null;
  currentUserId?: string;
  isLocked?: boolean;
  message?: string;
  totalParticipants?: number;
}

export function ContestLeaderboard({
  data = [],
  currentUserId,
  isLocked = false,
  message,
  totalParticipants = 0,
}: ContestLeaderboardProps) {
  const { t } = useTranslation();

  if (isLocked) {
    return (
      <div className="p-8 sm:p-12 text-center rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex flex-col items-center gap-3">
        <div className="p-3 rounded-full bg-[var(--warning-light)] text-[var(--warning)]">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
          {t('contest.leaderboardLocked') || 'Leaderboard is Locked'}
        </h3>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md">
          {message ||
            t('contest.leaderboardLockedDesc') ||
            'The leaderboard will be revealed after the contest has ended.'}
        </p>
      </div>
    );
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-[var(--warning)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[var(--color-muted)]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[var(--error)]" />;
    return <span className="font-mono font-bold text-xs text-[var(--color-muted-foreground)]">#{rank}</span>;
  };

  const top3 = data.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      {/* Top 3 Podium (if at least 1 entry) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 items-end pt-4">
          {/* Rank 2 */}
          {top3[1] ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="order-2 sm:order-1 p-4 rounded-2xl bg-gradient-to-b from-[var(--color-surface-muted)] to-[var(--card-solid)] border border-[var(--border)] shadow-xs flex flex-col items-center text-center gap-2"
            >
              <div className="p-2.5 rounded-full bg-[var(--color-surface-muted-strong)] shadow-xs">
                <Medal className="w-6 h-6 text-[var(--color-muted)]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-muted)]">
                {t('contest.secondPlace') || '2nd Place'}
              </span>
              <h4 className="text-sm font-bold text-[var(--color-foreground)] truncate max-w-[140px]">
                {top3[1].name}
              </h4>
              <div className="text-xs font-mono font-bold text-[var(--primary)]">
                {top3[1].score} pts ({top3[1].percentage}%)
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(top3[1].timeTaken)}</span>
              </div>
              {top3[1].prize && (
                <div className="mt-1 px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[10px] font-semibold text-[var(--color-foreground)]">
                  🎁 {top3[1].prize.title}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="order-2 sm:order-1" />
          )}

          {/* Rank 1 (Center & Elevated) */}
          {top3[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="order-1 sm:order-2 p-5 rounded-2xl bg-gradient-to-b from-[var(--warning-light)] to-[var(--card-solid)] border-2 border-[var(--warning)]/50 shadow-md flex flex-col items-center text-center gap-2 relative sm:-translate-y-2"
            >
              <div className="absolute -top-3.5 px-3 py-0.5 rounded-full bg-[var(--warning)] text-black font-extrabold text-[10px] tracking-wider uppercase shadow-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {t('contest.winner') || 'Winner'}
              </div>
              <div className="p-3 rounded-full bg-[var(--warning)]/20 shadow-xs">
                <Trophy className="w-8 h-8 text-[var(--warning)]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--warning-foreground)]">
                {t('contest.firstPlace') || '1st Place'}
              </span>
              <h4 className="text-base font-extrabold text-[var(--color-foreground)] truncate max-w-[160px]">
                {top3[0].name}
              </h4>
              <div className="text-sm font-mono font-black text-[var(--primary)]">
                {top3[0].score} pts ({top3[0].percentage}%)
              </div>
              <div className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatDuration(top3[0].timeTaken)}</span>
              </div>
              {top3[0].prize && (
                <div className="mt-1 px-2.5 py-1 rounded-full bg-[var(--warning-light)] border border-[var(--warning)]/30 text-xs font-bold text-[var(--color-foreground)]">
                  🏆 {top3[0].prize.title}
                </div>
              )}
            </motion.div>
          )}

          {/* Rank 3 */}
          {top3[2] ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="order-3 p-4 rounded-2xl bg-gradient-to-b from-[var(--error-light)]/40 to-[var(--card-solid)] border border-[var(--border)] shadow-xs flex flex-col items-center text-center gap-2"
            >
              <div className="p-2.5 rounded-full bg-[var(--error-light)] shadow-xs">
                <Medal className="w-6 h-6 text-[var(--error)]" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--error)]">
                {t('contest.thirdPlace') || '3rd Place'}
              </span>
              <h4 className="text-sm font-bold text-[var(--color-foreground)] truncate max-w-[140px]">
                {top3[2].name}
              </h4>
              <div className="text-xs font-mono font-bold text-[var(--primary)]">
                {top3[2].score} pts ({top3[2].percentage}%)
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] flex items-center gap-1 font-mono">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(top3[2].timeTaken)}</span>
              </div>
              {top3[2].prize && (
                <div className="mt-1 px-2 py-0.5 rounded-full bg-[var(--error-light)] text-[10px] font-semibold text-[var(--color-foreground)]">
                  🎁 {top3[2].prize.title}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="order-3" />
          )}
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="text-sm font-bold text-[var(--color-foreground)]">
              {t('contest.allContestants') || 'All Contestants'}
            </h3>
          </div>
          <span className="text-xs text-[var(--color-muted)] font-semibold">
            {totalParticipants || data.length} {t('contest.participants') || 'participants'}
          </span>
        </div>

        {data.length === 0 ? (
          <div className="p-8 text-center text-xs text-[var(--color-muted-foreground)]">
            {t('contest.noSubmissionsYet') || 'No completed submissions yet. Be the first to join!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] uppercase text-[11px] font-bold">
                <tr>
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4">{t('contest.participant') || 'Contestant'}</th>
                  <th className="py-3 px-4 text-center">{t('contest.score') || 'Score'}</th>
                  <th className="py-3 px-4 text-center">{t('contest.timeTaken') || 'Time'}</th>
                  <th className="py-3 px-4 text-right">{t('contest.prize') || 'Prize'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {data.map((entry) => {
                  const isCurrent = currentUserId && entry.userId === currentUserId;
                  return (
                    <tr
                      key={entry.userId}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-[var(--primary-light)]/40 font-semibold'
                          : 'hover:bg-[var(--color-surface-muted)]/50'
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center w-6 h-6">
                          {getRankBadge(entry.rank)}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[var(--color-surface-muted-strong)] flex items-center justify-center text-xs font-bold text-[var(--color-foreground)] shrink-0">
                            {entry.name ? entry.name[0].toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate text-xs sm:text-sm text-[var(--color-foreground)]">
                            {entry.name}
                            {isCurrent && (
                              <span className="ml-1.5 px-1.5 py-0.2 rounded text-[10px] bg-[var(--primary)] text-white font-bold">
                                {t('common.you') || 'You'}
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-[var(--primary)]">
                        {entry.score} pts ({entry.percentage}%)
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-xs text-[var(--color-muted-foreground)]">
                        {formatDuration(entry.timeTaken)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {entry.prize ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-[var(--warning-light)] text-[var(--warning-foreground)] border border-[var(--warning)]/30">
                            🎁 {entry.prize.title}
                          </span>
                        ) : (
                          <span className="text-[var(--color-muted)] text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
