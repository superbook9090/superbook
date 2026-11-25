'use client';

import React, { useState } from 'react';
import { Trophy, Flame, Clock, CheckCircle, Search, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { PageWrapper, ResponsiveGrid, EmptyState } from '@/components/layout';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { useContests } from '@/features/contests/hooks/useContests';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Dropdown } from '@/components/ui/Dropdown';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { StudentPageBanner } from '@/features/student/components/StudentPageBanner';
import { StudentTabs } from '@/features/student/components/StudentTabs';

export default function StudentContestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useUrlTab<'live' | 'upcoming' | 'completed'>(
    ['live', 'upcoming', 'completed'],
    'live'
  );
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useContests({
    tab: activeTab,
    scheduleType: scheduleFilter === 'all' ? undefined : scheduleFilter,
    search: debouncedSearch || undefined,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  const emptyTitle =
    activeTab === 'live'
      ? t('contest.noLiveContests')
      : activeTab === 'upcoming'
        ? t('contest.noUpcomingContests')
        : t('contest.noCompletedContests');

  const emptyDesc =
    activeTab === 'live'
      ? t('contest.noLiveContestsDesc')
      : activeTab === 'upcoming'
        ? t('contest.noUpcomingContestsDesc')
        : t('contest.noCompletedContestsDesc');

  return (
    <PageWrapper>
      <StudentPageBanner
        icon={Trophy}
        eyebrow={t('common.contests')}
        title={t('contest.contestsHub')}
        description={t('contest.contestsHubDesc')}
      />

      {/* Tabs & Filters Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <StudentTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            {
              id: 'live',
              label: t('contest.liveContests'),
              icon: <Flame className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />,
              count: stats.liveCount > 0 ? stats.liveCount : undefined,
              tone: 'danger',
            },
            {
              id: 'upcoming',
              label: t('contest.upcomingContests'),
              icon: <Clock className="w-4 h-4" />,
              count: stats.upcomingCount > 0 ? stats.upcomingCount : undefined,
              tone: 'info',
            },
            {
              id: 'completed',
              label: t('contest.completedContests'),
              icon: <CheckCircle className="w-4 h-4" />,
              tone: 'success',
            },
          ]}
        />

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1 sm:w-60 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-[var(--student-primary)] transition-colors" />
            <input
              type="text"
              placeholder={t('contest.searchContests')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[42px] pl-9 pr-3.5 py-2 text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--student-primary)]/25 focus:border-[var(--student-primary)] transition-all shadow-xs"
            />
          </div>

          <div className="w-full sm:w-44">
            <Dropdown
              id="contest-schedule-filter"
              startIcon={<Calendar className="w-4 h-4" />}
              value={scheduleFilter}
              onChange={setScheduleFilter}
              options={[
                { value: 'all', label: t('contest.allFrequencies') },
                { value: 'daily', label: t('contest.daily') },
                { value: 'weekly', label: t('contest.weekly') },
                { value: 'one_time', label: t('contest.oneTime') },
              ]}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState icon={Trophy} title={emptyTitle} description={emptyDesc} />
      ) : (
        <ResponsiveGrid variant="cards">
          {contests.map((c) => (
            <ContestCard key={c._id} contest={c} />
          ))}
        </ResponsiveGrid>
      )}
    </PageWrapper>
  );
}
