'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trophy, Medal, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';

interface LeaderboardEntry {
  userId: string;
  name: string;
  image?: string;
  score: number;
  rank: number;
  totalScore?: number;
  averageScore?: number;
  quizCount?: number;
  completedQuizzes?: number;
  lastCompletedAt?: string;
  completedAt?: string;
  timeTaken?: number; // in seconds
}

interface LeaderboardProps {
  data: LeaderboardEntry[];
  title: string;
  subtitle?: string;
  showUserRank?: string; // userId of current user to highlight
  type?: 'quiz' | 'course';
}

export default function Leaderboard({
  data,
  title,
  subtitle,
  showUserRank,
  type = 'quiz'
}: LeaderboardProps) {
  const { t } = useTranslation();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-[var(--warning)]" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-[var(--color-muted)]" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-[var(--error)]" />;
    return <span className="w-8 h-8 flex items-center justify-center text-base font-bold text-[var(--color-muted-foreground)]">#{rank}</span>;
  };

  const getTop3Styles = (rank: number) => {
    if (rank === 1) {
      return 'bg-gradient-to-r from-[var(--warning-light)] to-[var(--warning-light)]/80 border-[var(--warning)]/30 shadow-[var(--warning)]/10';
    }
    if (rank === 2) {
      return 'bg-gradient-to-r from-[var(--color-surface-muted)] to-[var(--color-surface-muted)]/80 border-[var(--color-border)]';
    }
    if (rank === 3) {
      return 'bg-gradient-to-r from-[var(--error-light)]/50 to-[var(--warning-light)]/50 border-[var(--error)]/30';
    }
    return '';
  };


  const getScoreDisplay = (entry: LeaderboardEntry) => {
    if (type === 'course') {
      return {
        primary: entry.totalScore?.toFixed(0) || '0',
        secondary: t('quiz.leaderboard.quizzes', { count: entry.quizCount || 0 }),
        details: `${t('quiz.leaderboard.avgScore')}: ${entry.averageScore?.toFixed(1) || '0'}`
      };
    }
    // Quiz leaderboard: show score and time taken
    const completedDate = entry.completedAt || entry.lastCompletedAt;
    return {
      primary: entry.score.toFixed(0),
      secondary: completedDate ? formatDateTime(completedDate) : 'N/A',
      details: entry.timeTaken ? `${t('quiz.leaderboard.timeTaken')}: ${formatDuration(entry.timeTaken)}` : undefined
    };
  };

  const isCurrentUser = (userId: string) => showUserRank && userId === showUserRank;

  return (
    <div className="bg-[var(--color-card)] rounded-2xl shadow-lg border border-[var(--color-border)] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-white/80 text-sm mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-sm font-medium">{t('quiz.leaderboard.top')} {data.length}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="p-4 sm:p-6">
        {data.length === 0 ? (
          <div className="text-center py-10 sm:py-12">
            <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--color-muted-foreground)]/50 mx-auto mb-4" />
            <p className="text-[var(--color-muted-foreground)] text-lg font-medium">{t('quiz.leaderboard.noData')}</p>
            <p className="text-[var(--color-muted-foreground)]/70 text-sm mt-1">{t('quiz.leaderboard.beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {data.map((entry, index) => {
              const scoreDisplay = getScoreDisplay(entry);
              const top3Style = getTop3Styles(entry.rank);
              const currentUser = isCurrentUser(entry.userId);

              return (
                <motion.div
                  key={entry.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
                  className={`
                    flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border
                    transition-all duration-200 cursor-pointer
                    ${entry.rank <= 3 ? top3Style : 'bg-[var(--color-surface-muted)]/30 border-[var(--color-border)]'}
                    ${currentUser ? 'ring-2 ring-[var(--student-primary)]/30 border-[var(--student-primary)]/50' : ''}
                    hover:shadow-xl hover:border-[var(--color-border-hover)]
                  `}
                >
                  {/* Rank & Avatar - Row on mobile */}
                  <div className="flex items-center gap-3 sm:gap-4">
                    {/* Rank */}
                    <div className={`
                      flex items-center justify-center flex-shrink-0
                      ${entry.rank === 1 ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-8 h-8 sm:w-10 sm:h-10'}
                    `}>
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* Avatar */}
                    {entry.image ? (
                      <Image
                        src={entry.image}
                        alt={entry.name}
                        width={40}
                        height={40}
                        className="rounded-full object-cover w-9 h-9 sm:w-10 sm:h-10"
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {entry.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Name - with You badge inline on mobile */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-[var(--color-foreground)] truncate text-sm sm:text-base">
                          {entry.name}
                        </p>
                        {currentUser && (
                          <span className="text-xs bg-[var(--student-primary)]/10 text-[var(--student-primary)] px-2 py-0.5 rounded-full font-medium">
                            {t('quiz.leaderboard.you')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Score - Full width on mobile, right aligned on desktop */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:ml-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]/50">
                    <div className="text-left sm:text-right">
                      <div className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
                        {scoreDisplay.primary}%
                      </div>
                      <div className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
                        {scoreDisplay.secondary}
                      </div>
                    </div>
                    {scoreDisplay.details && (
                      <div className="text-xs text-[var(--color-muted-foreground)]/70 bg-[var(--color-surface-muted)]/50 px-2 py-1 rounded-lg">
                        {scoreDisplay.details}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
