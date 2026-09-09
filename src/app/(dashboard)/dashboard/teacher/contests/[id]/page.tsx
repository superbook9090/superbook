'use client';

import React, { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  useContest,
  useContestLeaderboard,
  useContestTeacherAttempts,
  useEndContest,
  useDeleteContest,
} from '@/features/contests/hooks/useContests';
import { ContestLeaderboard } from '@/features/contests/components/ContestLeaderboard';
import { ContestPrizesShowcase } from '@/features/contests/components/ContestPrizesShowcase';
import { LazyConfirmModal } from '@/lib/lazy';
import { Trophy, Users, Layers } from 'lucide-react';
import { ApiClientError } from '@/lib/api/http';
import { ROUTES } from '@/constants/routes';
import TeacherContestHeader from './_components/TeacherContestHeader';
import TeacherContestStats from './_components/TeacherContestStats';
import TeacherContestAttemptsTable from './_components/TeacherContestAttemptsTable';

export default function TeacherContestManagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { t } = useTranslation();
  const router = useRouter();
  const { addAlert } = useAlert();

  const [activeTab, setActiveTab] = useState<'leaderboard' | 'attempts' | 'overview'>('leaderboard');
  const [showEndModal, setShowEndModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: contestData, isLoading: contestLoading } = useContest(id);
  const { data: leaderboardData, isLoading: leaderboardLoading } = useContestLeaderboard(id);
  const { data: attemptsData, isLoading: attemptsLoading } = useContestTeacherAttempts(id);

  const endMutation = useEndContest();
  const deleteMutation = useDeleteContest();

  if (contestLoading) return <PageSkeleton />;

  const contest = contestData?.contest;
  if (!contest) {
    return (
      <PageWrapper>
        <div className="p-8 text-center text-sm text-[var(--color-error)]">
          Contest not found.
        </div>
      </PageWrapper>
    );
  }

  const state = contest.computedState || 'upcoming';
  const stats = attemptsData?.stats || {
    totalParticipants: 0,
    completedCount: 0,
    avgScore: 0,
    highestScore: 0,
    avgTimeTaken: 0,
  };

  const handleEndContest = async () => {
    try {
      await endMutation.mutateAsync(id);
      addAlert({ type: 'success', message: 'Contest concluded successfully!' });
      setShowEndModal(false);
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : 'Failed to end contest',
      });
    }
  };

  const handleDeleteContest = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      addAlert({ type: 'success', message: 'Contest deleted/cancelled successfully!' });
      router.push(ROUTES.teacher.contests);
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : 'Failed to delete contest',
      });
    }
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Header Banner & Action Bar */}
      <TeacherContestHeader
        contest={contest}
        state={state}
        onEndContest={() => setShowEndModal(true)}
        onDeleteContest={() => setShowDeleteModal(true)}
      />

      {/* KPI Stats Strip */}
      <TeacherContestStats stats={stats} />

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'leaderboard'
              ? 'bg-[var(--teacher-primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('contest.leaderboard') || 'Live Leaderboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attempts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'attempts'
              ? 'bg-[var(--teacher-primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('contest.studentAttempts') || 'Student Submissions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'overview'
              ? 'bg-[var(--teacher-primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('contest.overview') || 'Prizes & Guidelines'}</span>
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === 'leaderboard' ? (
        leaderboardLoading ? (
          <PageSkeleton />
        ) : (
          <ContestLeaderboard
            data={leaderboardData?.leaderboard || []}
            prizes={contest.prizes || []}
            totalParticipants={leaderboardData?.totalParticipants}
          />
        )
      ) : activeTab === 'attempts' ? (
        attemptsLoading ? (
          <PageSkeleton />
        ) : (
          /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
          <TeacherContestAttemptsTable attempts={(attemptsData?.attempts as any[]) || []} />
        )
      ) : (
        <div className="space-y-6">
          {contest.prizes && contest.prizes.length > 0 && (
            <ContestPrizesShowcase prizes={contest.prizes} />
          )}

          {contest.instructions && (
            <div className="p-6 rounded-3xl bg-[var(--card-solid)] antigravity-glass border border-[var(--border)] shadow-xs space-y-2">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)]">
                {t('contest.instructions') || 'Contest Guidelines & Rules'}
              </h3>
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] whitespace-pre-line leading-relaxed">
                {contest.instructions}
              </p>
            </div>
          )}
        </div>
      )}

      {/* End Modal */}
      <LazyConfirmModal
        isOpen={showEndModal}
        title={t('contest.endContestConfirmTitle') || 'End Contest Early?'}
        message={t('contest.endContestConfirmDesc') || 'Conclude this contest now and release solutions and final results for all participants.'}
        confirmText={t('contest.endContestNow') || 'End Contest Now'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={handleEndContest}
        onCancel={() => setShowEndModal(false)}
        type="warning"
      />

      {/* Delete Modal */}
      <LazyConfirmModal
        isOpen={showDeleteModal}
        title={t('contest.deleteContestConfirmTitle') || 'Delete Contest?'}
        message={t('contest.deleteContestConfirmDesc') || 'Are you sure you want to delete or cancel this contest? If student attempts already exist, the contest will be safely cancelled.'}
        confirmText={t('contest.confirmDelete') || 'Confirm Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={handleDeleteContest}
        onCancel={() => setShowDeleteModal(false)}
        type="danger"
      />
    </PageWrapper>
  );
}
