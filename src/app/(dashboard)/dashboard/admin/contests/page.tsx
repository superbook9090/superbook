'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useContests } from '@/features/contests/hooks/useContests';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  Trophy,
  Plus,
  Flame,
  Clock,
  CheckCircle,
  LayoutList,
  Search,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export default function AdminContestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading } = useContests({
    instructor: 'all',
    tab: activeTab === 'all' ? undefined : activeTab,
    search: search || undefined,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  return (
    <PageWrapper className="space-y-6">
      {/* Hero Header Banner */}
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--admin-soft)] text-[var(--admin-primary)] border border-[var(--admin-border)]">
            <Trophy className="w-3.5 h-3.5" />
            <span>{t('common.contests') || 'All Contests'}</span>
          </div>
          <h1 className="heading-xl">{t('common.contests') || 'All Contests'}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('contest.adminContestsDesc') || 'View, manage, and moderate all contests across the platform.'}
          </p>
        </div>

        <Link
          href={ROUTES.teacher.contestCreate}
          className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('contest.createNewContest') || 'Create Contest'}</span>
        </Link>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(
          [
            { label: t('common.all') || 'Total', value: contests.length, color: 'var(--admin-primary)', icon: <LayoutList className="w-4 h-4" /> },
            { label: t('contest.live') || 'Live', value: stats.liveCount, color: 'var(--error)', icon: <Flame className="w-4 h-4" /> },
            { label: t('contest.upcoming') || 'Upcoming', value: stats.upcomingCount, color: 'var(--primary)', icon: <Clock className="w-4 h-4" /> },
            { label: t('contest.completed') || 'Completed', value: stats.completedCount, color: 'var(--success)', icon: <CheckCircle className="w-4 h-4" /> },
          ] as { label: string; value: number; color: string; icon: React.ReactNode }[]
        ).map((s) => (
          <div
            key={s.label}
            className="antigravity-glass rounded-2xl border border-[var(--border)] p-4 flex flex-col gap-1 shadow-sm"
          >
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: s.color }}>
              {s.icon}
              <span>{s.label}</span>
            </div>
            <p className="text-2xl font-black text-[var(--color-foreground)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)]" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('contest.searchContests') || 'Search contests by title or description…'}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/40 min-h-[44px]"
        />
      </div>

      {/* Pill Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--border)] pb-3 overflow-x-auto no-scrollbar">
        {(
          [
            { id: 'all', label: t('common.all') || 'All', icon: <Trophy className="w-4 h-4" />, activeColor: 'bg-[var(--admin-primary)]', badge: null },
            { id: 'live', label: t('contest.live') || 'Live', icon: <Flame className="w-4 h-4" />, activeColor: 'bg-[var(--error)]', badge: stats.liveCount },
            { id: 'upcoming', label: t('contest.upcoming') || 'Upcoming', icon: <Clock className="w-4 h-4" />, activeColor: 'bg-[var(--primary)]', badge: stats.upcomingCount },
            { id: 'completed', label: t('contest.completed') || 'Completed', icon: <CheckCircle className="w-4 h-4" />, activeColor: 'bg-[var(--student-primary)]', badge: stats.completedCount },
          ] as { id: string; label: string; icon: React.ReactNode; activeColor: string; badge: number | null }[]
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'all' | 'live' | 'upcoming' | 'completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 min-h-[44px] ${
              activeTab === tab.id
                ? `${tab.activeColor} text-white shadow-md`
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== null && tab.badge > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/25 text-white font-black">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('contest.noContests') || 'No Contests Found'}
          description={
            activeTab === 'all' && !search
              ? (t('contest.noContestsAdminDesc') || 'No contests have been created on the platform yet.')
              : (t('contest.noContestsFilterDesc') || 'Try adjusting your filters or search query.')
          }
          action={
            <Link
              href={ROUTES.teacher.contestCreate}
              className="btn-premium inline-flex items-center gap-2 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>{t('contest.createNewContest') || 'Create Contest'}</span>
            </Link>
          }
        />
      ) : (
        <div className="perspective-1000">
          <ResponsiveGrid variant="cards">
            {contests.map((c) => (
              <ContestCard
                key={c._id}
                contest={c}
                isTeacher
                managePath={ROUTES.admin.contestManage(c._id)}
              />
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </PageWrapper>
  );
}
