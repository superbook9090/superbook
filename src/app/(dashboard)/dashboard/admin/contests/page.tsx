'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { useContests } from '@/features/contests/hooks/useContests';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { AdminTabs, type AdminTabOption } from '@/features/admin/components/AdminTabs';
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

type ContestTab = 'all' | 'live' | 'upcoming' | 'completed';

export default function AdminContestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useUrlTab<ContestTab>(
    ['all', 'live', 'upcoming', 'completed'],
    'live'
  );
  const [search, setSearch] = useState('');

  const { data, isLoading } = useContests({
    instructor: 'all',
    tab: activeTab === 'all' ? undefined : activeTab,
    search: search || undefined,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  const tabs: AdminTabOption<ContestTab>[] = [
    { id: 'all', label: t('common.all'), icon: <Trophy className="w-4 h-4" />, tone: 'primary' },
    {
      id: 'live',
      label: t('contest.live'),
      icon: <Flame className="w-4 h-4" />,
      count: stats.liveCount > 0 ? stats.liveCount : undefined,
      tone: 'danger',
    },
    {
      id: 'upcoming',
      label: t('contest.upcoming'),
      icon: <Clock className="w-4 h-4" />,
      count: stats.upcomingCount > 0 ? stats.upcomingCount : undefined,
      tone: 'info',
    },
    {
      id: 'completed',
      label: t('contest.completed'),
      icon: <CheckCircle className="w-4 h-4" />,
      count: stats.completedCount > 0 ? stats.completedCount : undefined,
      tone: 'success',
    },
  ];

  return (
    <PageWrapper>
      <AdminPageBanner
        icon={Trophy}
        eyebrow={t('common.contests')}
        title={t('common.contests')}
        description={t('contest.adminContestsDesc')}
        actions={
          <Link
            href={ROUTES.teacher.contestCreate}
            className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('contest.createNewContest')}</span>
          </Link>
        }
      />

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: t('common.all'), value: contests.length, tone: 'text-[var(--teacher-primary)]', icon: LayoutList },
          { label: t('contest.live'), value: stats.liveCount, tone: 'text-[var(--error)]', icon: Flame },
          { label: t('contest.upcoming'), value: stats.upcomingCount, tone: 'text-[var(--info)]', icon: Clock },
          { label: t('contest.completed'), value: stats.completedCount, tone: 'text-[var(--success)]', icon: CheckCircle },
        ].map((item) => (
          <div key={item.label} className="teacher-card p-4 flex flex-col gap-1">
            <div className={`flex items-center gap-1.5 text-xs font-bold ${item.tone}`}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </div>
            <p className="text-2xl font-extrabold font-[family-name:var(--font-display)] text-[var(--color-foreground)] tabular-nums">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter & Tabs Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <AdminTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('contest.searchContests')}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/35 min-h-[44px]"
          />
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={t('contest.noContests')}
          description={
            activeTab === 'all' && !search
              ? t('contest.noContestsAdminDesc')
              : t('contest.noContestsFilterDesc')
          }
          action={
            <Link
              href={ROUTES.teacher.contestCreate}
              className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('contest.createNewContest')}</span>
            </Link>
          }
        />
      ) : (
        <ResponsiveGrid variant="dense">
          {contests.map((c) => (
            <ContestCard
              key={c._id}
              contest={c}
              isTeacher
              managePath={ROUTES.admin.contestManage(c._id)}
            />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
