'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useContests } from '@/features/contests/hooks/useContests';
import { useSessionStore } from '@/store/useSessionStore';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  Trophy,
  Plus,
  Flame,
  Clock,
  CheckCircle,
  Lock,
  Mail,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function TeacherContestsPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const user = session?.user as { role?: string; canCreateContests?: boolean } | undefined;

  const isAuthorized =
    user?.role === 'superadmin' || Boolean(user?.canCreateContests);

  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');

  const { data, isLoading } = useContests({
    instructor: 'self',
    tab: activeTab === 'all' ? undefined : activeTab,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  // If teacher is not authorized by Superadmin
  if (!isAuthorized) {
    return (
      <PageWrapper className="space-y-6">
        <PageHeader
          title={t('contest.teacherContests') || 'Contests Management'}
          description={t('contest.teacherContestsDesc') || 'Create and host scheduled quiz competitions.'}
        />

        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--card-solid)] border border-[var(--warning)]/40 shadow-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-[var(--warning-light)] text-[var(--warning)] shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
            {t('contest.permissionRequired') || 'Contest Creation Access Required'}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {t('contest.permissionRequiredDesc') ||
              'Contest hosting is restricted to authorized educators. A Superadmin can grant you contest creation permissions from the user administration panel.'}
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.contact}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <Mail className="w-4 h-4" />
              <span>{t('contact.title') || 'Contact Administration'}</span>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title={t('contest.teacherContests') || 'Contests Management'}
          description={
            t('contest.teacherContestsDesc') ||
            'Create, schedule, and monitor your live student contests, prizes, and leaderboards.'
          }
        />

        <Link
          href="/dashboard/teacher/contests/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--student-primary)] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('contest.createNewContest') || 'Create New Contest'}</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'all'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('common.all') || 'All Contests'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'live'
              ? 'bg-[var(--error)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{t('contest.live') || 'Live'}</span>
          {stats.liveCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {stats.liveCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'upcoming'
              ? 'bg-[var(--primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('contest.upcoming') || 'Upcoming'}</span>
          {stats.upcomingCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-extrabold">
              {stats.upcomingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
            activeTab === 'completed'
              ? 'bg-[var(--student-primary)] text-white shadow-xs'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{t('contest.completed') || 'Completed'}</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('contest.noTeacherContests') || 'No Contests Created Yet'}
          description={
            t('contest.noTeacherContestsDesc') ||
            'Create your first scheduled competition to engage your students and distribute prizes.'
          }
          action={
            <Link
              href="/dashboard/teacher/contests/create"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-xs font-bold shadow-xs hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              <span>{t('contest.createNewContest') || 'Create Contest'}</span>
            </Link>
          }
        />
      ) : (
        <ResponsiveGrid variant="cards">
          {contests.map((c) => (
            <ContestCard key={c._id} contest={c} isTeacher />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
