'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  Clock,
  HelpCircle,
  Calendar,
  ChevronRight,
  Flame,
  CheckCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ContestCountdown } from './ContestCountdown';
import { ContestPrizesShowcase } from './ContestPrizesShowcase';
import type { ContestItem } from '@/lib/api/contests';
import { formatDateTime } from '@/lib/dateUtils';

interface ContestCardProps {
  contest: ContestItem;
  isTeacher?: boolean;
  onManageClick?: () => void;
}

export function ContestCard({ contest, isTeacher = false }: ContestCardProps) {
  const { t } = useTranslation();

  const state = contest.computedState || 'upcoming';

  const getStateBadge = () => {
    if (state === 'live') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--error)] text-white shadow-xs animate-pulse">
          <Flame className="w-3.5 h-3.5" />
          <span>{t('contest.liveNow') || 'LIVE NOW'}</span>
        </span>
      );
    }
    if (state === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--info-light)] text-[var(--info)] border border-[var(--info)]/20">
          <Clock className="w-3.5 h-3.5" />
          <span>{t('contest.upcoming') || 'UPCOMING'}</span>
        </span>
      );
    }
    if (state === 'completed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--color-border)]">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{t('contest.completed') || 'COMPLETED'}</span>
        </span>
      );
    }
    return null;
  };

  const getScheduleBadge = () => {
    if (contest.scheduleType === 'daily') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--warning-light)] text-[var(--warning-foreground)] border border-[var(--warning)]/20">
          {t('contest.daily') || 'Daily Challenge'}
        </span>
      );
    }
    if (contest.scheduleType === 'weekly') {
      return (
        <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-primary)]/20">
          {t('contest.weekly') || 'Weekly League'}
        </span>
      );
    }
    return null;
  };

  const userAttempt = contest.userAttempt;

  const targetLink = isTeacher
    ? `/dashboard/teacher/contests/${contest._id}`
    : state === 'live'
    ? `/dashboard/student/contests/${contest._id}/take`
    : `/dashboard/student/contests/${contest._id}/result`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-[var(--card-solid)] shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group ${
        state === 'live' ? 'border-[var(--error)]/40 ring-1 ring-[var(--error)]/20' : 'border-[var(--border)]'
      }`}
    >
      {/* Top Banner Stripe */}
      {state === 'live' && (
        <div className="h-1.5 bg-gradient-to-r from-[var(--error)] via-[var(--warning)] to-[var(--primary)]" />
      )}

      <div className="p-5 sm:p-6 flex flex-col gap-4 flex-1">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {getStateBadge()}
            {getScheduleBadge()}
          </div>

          {state === 'live' && (
            <ContestCountdown
              targetDate={contest.endTime}
              compact
              urgent
              type="ends_in"
            />
          )}

          {state === 'upcoming' && (
            <div className="text-xs text-[var(--color-muted-foreground)] font-mono">
              <ContestCountdown targetDate={contest.startTime} compact type="starts_in" />
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {contest.title}
          </h3>
          {contest.description && (
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] line-clamp-2 mt-1.5">
              {contest.description}
            </p>
          )}
        </div>

        {/* Prize Pill if available */}
        {contest.prizes && contest.prizes.length > 0 && (
          <div>
            <ContestPrizesShowcase prizes={contest.prizes} compact />
          </div>
        )}

        {/* Meta Stats Row */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--color-muted-foreground)]">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
            <span>{contest.duration} {t('common.minutes') || 'mins'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
            <span>{contest.questionCount} {t('common.questions') || 'questions'}</span>
          </div>

          <div className="flex items-center gap-1.5 col-span-2">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
            <span className="truncate">
              {formatDateTime(contest.startTime)}
            </span>
          </div>
        </div>

        {/* User Submission Summary if student already submitted */}
        {userAttempt && (
          <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] flex items-center justify-between text-xs">
            <span className="font-semibold text-[var(--color-foreground)] flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-[var(--success)]" />
              {t('contest.yourScore') || 'Your Score'}:
            </span>
            <span className="font-bold text-[var(--primary)] text-sm">
              {userAttempt.score} pts ({userAttempt.percentage}%)
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 bg-[var(--color-surface-muted)]/50 border-t border-[var(--border)] flex items-center justify-between gap-3">
        <div className="text-xs text-[var(--color-muted)] truncate">
          {contest.instructor?.name && (
            <span>
              {t('contest.byInstructor', { name: contest.instructor.name }) || `By ${contest.instructor.name}`}
            </span>
          )}
        </div>

        <Link
          href={targetLink}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
            state === 'live'
              ? 'bg-gradient-to-r from-[var(--error)] to-[var(--primary)] text-white hover:shadow-md hover:scale-[1.02]'
              : 'bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] hover:bg-[var(--primary)] hover:text-white'
          }`}
        >
          {isTeacher ? (
            <>
              <span>{t('contest.manageContest') || 'Manage'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          ) : state === 'live' ? (
            <>
              {userAttempt?.status === 'in_progress' ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('contest.resumeAttempt') || 'Resume'}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{t('contest.joinContest') || 'Join Contest'}</span>
                </>
              )}
            </>
          ) : state === 'upcoming' ? (
            <>
              <span>{t('contest.viewDetails') || 'View Details'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <Trophy className="w-3.5 h-3.5 text-[var(--warning)]" />
              <span>{t('contest.viewResults') || 'View Results'}</span>
            </>
          )}
        </Link>
      </div>
    </motion.div>
  );
}
