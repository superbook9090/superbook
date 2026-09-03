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
      return t('contest.noLiveContestsDesc') || 'Check the Upcoming tab to see scheduled competitions!';
    }
    if (activeTab === 'upcoming') {
      return t('contest.noUpcomingContestsDesc') || 'New contests are scheduled regularly by educators. Stay tuned!';
    }
    return t('contest.noCompletedContestsDesc') || 'Completed contests will appear here with leaderboards.';
  };

  return (
    <PageWrapper className="space-y-6">
      <PageHeader
        title={t('contest.contestsHub') || 'Contests & Competitions'}
        description={
          t('contest.contestsHubDesc') ||
          'Participate in live timed challenges, test your knowledge against peers, and win exciting prizes!'
        }
      />

      {/* Tabs Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'live'
                ? 'bg-[var(--error)] text-white shadow-sm'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            <Flame className={`w-4 h-4 ${activeTab === 'live' ? 'animate-pulse' : ''}`} />
            <span>{t('contest.liveContests') || 'Live Contests'}</span>
            {stats.liveCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'live' ? 'bg-white/20 text-white' : 'bg-[var(--error-light)] text-[var(--error)]'
                }`}
              >
                {stats.liveCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'upcoming'
                ? 'bg-[var(--primary)] text-white shadow-sm'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('contest.upcomingContests') || 'Upcoming'}</span>
            {stats.upcomingCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[11px] font-extrabold ${
                  activeTab === 'upcoming'
                    ? 'bg-white/20 text-white'
                    : 'bg-[var(--info-light)] text-[var(--info)]'
                }`}
              >
                {stats.upcomingCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              activeTab === 'completed'
                ? 'bg-[var(--student-primary)] text-white shadow-sm'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] border border-[var(--border)]'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{t('contest.completedContests') || 'Completed'}</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
            <input
              type="text"
              placeholder={t('contest.searchContests') || 'Search contests...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>

          <select
            value={scheduleFilter}
            onChange={(e) => setScheduleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
          >
            <option value="all">{t('contest.allFrequencies') || 'All Frequencies'}</option>
            <option value="daily">{t('contest.daily') || 'Daily'}</option>
            <option value="weekly">{t('contest.weekly') || 'Weekly'}</option>
            <option value="one_time">{t('contest.oneTime') || 'Special'}</option>
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
              ? t('contest.noLiveContests') || 'No Live Contests Right Now'
              : activeTab === 'upcoming'
              ? t('contest.noUpcomingContests') || 'No Upcoming Contests Scheduled'
              : t('contest.noCompletedContests') || 'No Completed Contests Found'
          }
          description={getEmptyStateDescription()}
        />
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
