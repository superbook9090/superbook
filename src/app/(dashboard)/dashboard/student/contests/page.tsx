'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { PageWrapper, PageHeader, ResponsiveGrid, EmptyState } from '@/components/layout';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { useContests } from '@/features/contests/hooks/useContests';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Trophy, Flame, Clock, CheckCircle, Search } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';

export default function StudentContestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'completed'>('live');
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

  const getEmptyStateDescription = () => {
    if (activeTab === 'live') {
      return t('contest.noLiveContestsDesc');
    }
    if (activeTab === 'upcoming') {
      return t('contest.noUpcomingContestsDesc');
    }
    return t('contest.noCompletedContestsDesc');
  };

  return (
    <PageWrapper>
      <PageHeader
        title={t('contest.contestsHub')}
        description={
          t('contest.contestsHubDesc')
        }
      />

      {/* Tabs Row */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-5 pb-4 border-b border-[var(--border)]/50">
        <div className="antigravity-tab-group overflow-x-auto no-scrollbar py-1">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`antigravity-tab-btn whitespace-nowrap ${
              activeTab === 'live'
                ? 'antigravity-tab-btn--active text-[var(--error)] border-[var(--error)]/40 shadow-[var(--error)]/20'
                : ''
            }`}
          >
            <Flame className={`w-4 h-4 text-[var(--error)] ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
            <span>{t('contest.liveContests')}</span>
            {stats.liveCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-extrabold bg-[var(--error-light)] text-[var(--error)]">
                {stats.liveCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`antigravity-tab-btn whitespace-nowrap ${activeTab === 'upcoming' ? 'antigravity-tab-btn--active' : ''}`}
          >
            <Clock className="w-4 h-4 text-[var(--info)]" />
            <span>{t('contest.upcomingContests')}</span>
            {stats.upcomingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[11px] font-extrabold bg-[var(--info-light)] text-[var(--info)]">
                {stats.upcomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`antigravity-tab-btn whitespace-nowrap ${activeTab === 'completed' ? 'antigravity-tab-btn--active' : ''}`}
          >
            <CheckCircle className="w-4 h-4 text-[var(--success)]" />
            <span>{t('contest.completedContests')}</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 sm:w-64 group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
            <input
              type="text"
              placeholder={t('contest.searchContests')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 sm:py-1.5 text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all shadow-sm"
            />
          </div>

          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="px-4 sm:px-3 py-2 sm:py-1.5 text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all shadow-sm cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_12px_center] bg-[length:10px] pr-8"
          >
            <option value="all">{t('contest.allFrequencies')}</option>
            <option value="daily">{t('contest.daily')}</option>
            <option value="weekly">{t('contest.weekly')}</option>
            <option value="one_time">{t('contest.oneTime')}</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title={
            activeTab === 'live'
              ? t('contest.noLiveContests')
              : activeTab === 'upcoming'
              ? t('contest.noUpcomingContests')
              : t('contest.noCompletedContests')
          }
          description={getEmptyStateDescription()}
        />
      ) : (
        <div className="perspective-1000">
          <ResponsiveGrid variant="cards">
            {contests.map((c) => (
              <ContestCard key={c._id} contest={c} />
            ))}
          </ResponsiveGrid>
        </div>
      )}
    </PageWrapper>
  );
}
