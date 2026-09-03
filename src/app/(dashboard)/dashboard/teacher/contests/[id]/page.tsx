'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
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
import { ContestCountdown } from '@/features/contests/components/ContestCountdown';
import { LazyConfirmModal } from '@/lib/lazy';
import {
  Trophy,
  Users,
  Clock,
  CheckCircle,
  Edit,
  StopCircle,
  Trash2,
  ArrowLeft,
  Flame,
  Layers,
} from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/dateUtils';
import { ApiClientError } from '@/lib/api/http';

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

  if (contestLoading) {
    return <PageSkeleton />;
  }

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

  // End contest early handler
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

  // Delete / Cancel handler
  const handleDeleteContest = async () => {
    try {
      await deleteMutation.mutateAsync(id);
      addAlert({ type: 'success', message: 'Contest deleted/cancelled successfully!' });
      router.push('/dashboard/teacher/contests');
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : 'Failed to delete contest',
      });
    }
  };

  return (
    <PageWrapper className="space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/dashboard/teacher/contests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('contest.backToContests') || 'Back to Contests'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {state === 'upcoming' && (
            <Link
              href={`/dashboard/teacher/contests/${id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border border-[var(--border)] shadow-xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>{t('common.edit') || 'Edit Contest'}</span>
            </Link>
          )}

          {state === 'live' && (
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--warning-light)] text-[var(--warning-foreground)] border border-[var(--warning)]/30 shadow-xs hover:bg-[var(--warning-light)]/80 transition-colors"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>{t('contest.endContestEarly') || 'End Contest Early'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30 shadow-xs hover:bg-[var(--error-light)]/80 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{t('common.delete') || 'Delete'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {state === 'live' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[var(--error)] text-white animate-pulse">
                <Flame className="w-3 h-3" />
                LIVE
              </span>
            ) : state === 'upcoming' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--info-light)] text-[var(--info)]">
                <Clock className="w-3 h-3" />
                UPCOMING
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                <CheckCircle className="w-3 h-3" />
                COMPLETED
              </span>
            )}

            <span className="text-xs font-bold px-2 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] uppercase">
              {contest.scheduleType.replace('_', '-')}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
            {contest.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--color-muted-foreground)]">
            <span>Start: {formatDateTime(contest.startTime)}</span>
            <span>•</span>
            <span>End: {formatDateTime(contest.endTime)}</span>
            <span>•</span>
            <span>Duration: {contest.duration} mins</span>
          </div>
        </div>

        {state === 'live' && (
          <div className="p-4 rounded-2xl bg-[var(--color-surface-muted)]/60 border border-[var(--border)] text-center">
            <ContestCountdown
              targetDate={contest.endTime}
              label={t('contest.remainingLiveTime') || 'Remaining Live Time'}
              type="ends_in"
            />
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] mb-1">
            <Users className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('contest.participants') || 'Participants'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-foreground)]">
            {stats.totalParticipants}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] mb-1">
            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
            <span>{t('contest.submissions') || 'Submissions'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-foreground)]">
            {stats.completedCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] mb-1">
            <Trophy className="w-4 h-4 text-[var(--warning)]" />
            <span>{t('contest.highestScore') || 'Highest Score'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--warning-foreground)]">
            {stats.highestScore} pts
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-muted)] mb-1">
            <Clock className="w-4 h-4 text-[var(--info)]" />
            <span>{t('contest.avgTime') || 'Avg Time'}</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-mono text-[var(--color-foreground)]">
            {formatDuration(stats.avgTimeTaken)}
          </p>
        </div>
      </div>

      {/* Tabs Row */}
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
          <span>{t('contest.leaderboard') || 'Live Leaderboard'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('attempts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'attempts'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{t('contest.studentAttempts') || 'Student Submissions'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>{t('contest.overview') || 'Prizes & Guidelines'}</span>
        </button>
      </div>

      {/* Tab Content */}
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
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] overflow-hidden shadow-xs">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[var(--color-foreground)]">
                {t('contest.studentSubmissions') || 'All Student Attempts'}
              </h3>
              <span className="text-xs text-[var(--color-muted)]">
                {(attemptsData?.attempts || []).length} {t('contest.submissions') || 'submissions'}
              </span>
            </div>

            {(attemptsData?.attempts || []).length === 0 ? (
              <div className="p-8 text-center text-xs text-[var(--color-muted-foreground)]">
                {t('contest.noStudentsAttempted') || 'No students have attempted this contest yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] uppercase text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-4">{t('contest.participant') || 'Student'}</th>
                      <th className="py-3 px-4">{t('contest.status') || 'Status'}</th>
                      <th className="py-3 px-4 text-center">{t('contest.score') || 'Score'}</th>
                      <th className="py-3 px-4 text-center">{t('contest.timeTaken') || 'Time'}</th>
                      <th className="py-3 px-4">{t('contest.submittedAt') || 'Submitted At'}</th>
                      <th className="py-3 px-4 text-center">{t('contest.violations') || 'Violations'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {(attemptsData?.attempts as any[]).map((att) => (
                      <tr key={att._id} className="hover:bg-[var(--color-surface-muted)]/50">
                        <td className="py-3 px-4 font-semibold text-[var(--color-foreground)]">
                          {att.student?.name || 'Anonymous'}
                          <span className="block text-[11px] text-[var(--color-muted)] font-normal">
                            {att.student?.email}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                              att.status === 'completed'
                                ? 'bg-[var(--success-light)] text-[var(--success)]'
                                : 'bg-[var(--warning-light)] text-[var(--warning-foreground)]'
                            }`}
                          >
                            {att.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[var(--primary)]">
                          {att.score} pts ({att.percentage}%)
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs text-[var(--color-muted-foreground)]">
                          {formatDuration(att.timeTaken)}
                        </td>
                        <td className="py-3 px-4 text-xs text-[var(--color-muted-foreground)]">
                          {att.submittedAt ? formatDateTime(att.submittedAt) : '-'}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {att.violationCount > 0 ? (
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[var(--error-light)] text-[var(--error)]">
                              {att.violationCount}
                            </span>
                          ) : (
                            <span className="text-[var(--color-muted)] text-xs">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      ) : (
        <div className="space-y-6">
          {contest.prizes && contest.prizes.length > 0 && (
            <ContestPrizesShowcase prizes={contest.prizes} />
          )}

          {contest.instructions && (
            <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-2">
              <h3 className="text-sm font-bold text-[var(--color-foreground)]">
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
        message={
          t('contest.endContestConfirmDesc') ||
          'Conclude this contest now and release solutions and final results for all participants.'
        }
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
        message={
          t('contest.deleteContestConfirmDesc') ||
          'Are you sure you want to delete or cancel this contest? If student attempts already exist, the contest will be safely cancelled.'
        }
        confirmText={t('contest.confirmDelete') || 'Confirm Delete'}
        cancelText={t('common.cancel') || 'Cancel'}
        onConfirm={handleDeleteContest}
        onCancel={() => setShowDeleteModal(false)}
        type="danger"
      />
    </PageWrapper>
  );
}
