'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
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
import TeacherContestsStats from './_components/TeacherContestsStats';

export default function TeacherContestsPage() {
  const { t } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const user = session?.user as { role?: string; canCreateContests?: boolean } | undefined;

  const isAuthorized =
    user?.role === 'superadmin' || Boolean(user?.canCreateContests);

  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('live');

  const { data, isLoading } = useContests({
    instructor: 'self',
    tab: activeTab === 'all' ? undefined : activeTab,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  // If teacher is not authorized by Superadmin
  if (!isAuthorized) {
    return (
      <PageWrapper>
        <div className="p-8 sm:p-12 rounded-3xl bg-[var(--card-solid)] antigravity-glass border border-[var(--warning)]/40 shadow-sm text-center max-w-2xl mx-auto flex flex-col items-center gap-4">
          <div className="p-4 rounded-2xl bg-[var(--warning-light)] text-[var(--warning)] shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="heading-lg text-[var(--color-foreground)]">
            {t('contest.permissionRequired')}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
            {t('contest.permissionRequiredDesc')}
          </p>
          <div className="pt-2">
            <Link
              href={ROUTES.contact}
              className="btn-premium inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px]"
            >
              <Mail className="w-4 h-4" />
              <span>{t('contact.title')}</span>
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Hero Header Banner */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-6 md:p-8 rounded-3xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('contest.teacherContests')}</span>
          </div>
          <h1 className="heading-xl">{t('contest.teacherContests')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('contest.teacherContestsDesc')}
          </p>
        </div>

        <Link
          href={ROUTES.teacher.contestCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('contest.createNewContest')}</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <TeacherContestsStats stats={stats} totalCount={contests.length} />

      {/* Modern Glowing Pill Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'all'
              ? 'bg-[var(--teacher-primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>{t('common.all')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'live'
              ? 'bg-[var(--error)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{t('contest.live')}</span>
          {stats.liveCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/25 text-white font-black animate-pulse">
              {stats.liveCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'upcoming'
              ? 'bg-[var(--primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('contest.upcoming')}</span>
          {stats.upcomingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/25 text-white font-black">
              {stats.upcomingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
            activeTab === 'completed'
              ? 'bg-[var(--student-primary)] text-white shadow-md'
              : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{t('contest.completed')}</span>
          {stats.completedCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/25 text-white font-black">
              {stats.completedCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Rendering */}
      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('contest.noTeacherContests')}
          description={
            t('contest.noTeacherContestsDesc')
          }
          action={
            <Link
              href={ROUTES.teacher.contestCreate}
              className="btn-premium inline-flex items-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('contest.createNewContest')}</span>
            </Link>
          }
        />
      ) : (
        <div className="perspective-1000">
          <ResponsiveGrid variant="cards">
            {contests.map((c) => (
              <ContestCard key={c._id} contest={c} isTeacher />
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </PageWrapper>
  );
}
