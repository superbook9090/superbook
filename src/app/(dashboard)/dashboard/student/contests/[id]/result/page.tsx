'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  useContest,
  useContestLeaderboard,
  useContestReview,
} from '@/features/contests/hooks/useContests';
import { ContestLeaderboard } from '@/features/contests/components/ContestLeaderboard';
import { ContestSolutionsReview } from '@/features/contests/components/ContestSolutionsReview';
import { ContestPrizesShowcase } from '@/features/contests/components/ContestPrizesShowcase';
import { useSessionStore } from '@/store/useSessionStore';
import {
  Trophy,
  ArrowLeft,
  Lock,
  Sparkles,
} from 'lucide-react';

export default function ContestResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'solutions'>('leaderboard');

  const { data: contestData, isLoading: contestLoading } = useContest(id);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useContestLeaderboard(id);
  const { data: reviewData } = useContestReview(id);

  if (contestLoading) {
    return <PageSkeleton />;
  }

  const contest = contestData?.contest;
  const userAttempt = contest?.userAttempt;
  const userRank = leaderboardData?.userRank;

  // Check if student won a prize
  const wonPrize =
    userRank && contest?.prizes
      ? contest.prizes.find((p) => String(p.rank) === String(userRank))
      : null;

  return (
    <PageWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/student/contests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToContests') || 'Back to Contests'}</span>
        </Link>
      </div>

      {/* Hero Summary Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-extrabold tracking-wider uppercase">
              <Trophy className="w-3.5 h-3.5 text-[var(--warning)]" />
              <span>{contest?.title}</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              {userAttempt
                ? t('contest.contestCompleted') || 'Contest Completed!'
                : t('contest.contestOverview') || 'Contest Results & Standings'}
            </h1>
            <p className="text-xs sm:text-sm text-white/80">
              {contest?.description || 'Review your performance and current standing on the leaderboard.'}
            </p>
          </div>

          {/* User Score & Rank Badge */}
          {userAttempt && (
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
              <div className="text-center px-3 border-r border-white/20">
                <span className="text-[10px] uppercase font-extrabold text-white/70">
                  {t('contest.score') || 'Score'}
                </span>
                <p className="text-xl sm:text-2xl font-mono font-black text-white">
                  {userAttempt.score}
                </p>
                <span className="text-[10px] text-white/70">{userAttempt.percentage}%</span>
              </div>

              {userRank && (
                <div className="text-center px-3">
                  <span className="text-[10px] uppercase font-extrabold text-white/70">
                    {t('contest.rank') || 'Rank'}
                  </span>
                  <p className="text-xl sm:text-2xl font-mono font-black text-[var(--warning)]">
                    #{userRank}
                  </p>
                  <span className="text-[10px] text-white/70">
                    of {leaderboardData?.totalParticipants || 1}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prize Notification Banner if won */}
        {wonPrize && (
          <div className="mt-4 p-3 rounded-xl bg-[var(--warning)]/20 border border-[var(--warning)]/40 flex items-center gap-2 text-xs font-bold text-white">
            <Sparkles className="w-4 h-4 text-[var(--warning)]" />
            <span>
              {t('contest.congratulationsWon', { rank: userRank ?? 1 }) || `Congratulations! You secured Rank #${userRank} and won:`}{' '}
              <strong className="underline">{wonPrize.title}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Prize Showcase if configured */}
      {contest?.prizes && contest.prizes.length > 0 && (
        <ContestPrizesShowcase prizes={contest.prizes} />
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'leaderboard'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('contest.leaderboard') || 'Leaderboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('solutions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'solutions'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{t('contest.solutionsAndReview') || 'Solutions & Answers'}</span>
          {reviewData?.isLocked && <Lock className="w-3 h-3 text-[var(--warning)]" />}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'leaderboard' ? (
        leaderboardLoading ? (
          <PageSkeleton />
        ) : (
          <ContestLeaderboard
            data={leaderboardData?.leaderboard || []}
            prizes={leaderboardData?.prizes || contest?.prizes || []}
            userRank={userRank}
            currentUserId={session?.user?.id}
            isLocked={leaderboardData?.isLocked}
            message={leaderboardData?.message}
            totalParticipants={leaderboardData?.totalParticipants}
          />
        )
      ) : (
        <ContestSolutionsReview
          isLocked={reviewData?.isLocked ?? true}
          solutionsReleaseAt={reviewData?.solutionsReleaseAt || contest?.solutionsReleaseAt}
          questionReviews={reviewData?.questionReviews || []}
          message={reviewData?.message}
        />
      )}
    </PageWrapper>
  );
}
