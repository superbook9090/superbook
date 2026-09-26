'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { useContests } from '@/features/contests/hooks/useContests';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Trophy, Flame, Clock, CheckCircle, Search, Sparkles, Filter } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTranslation } from '@/hooks/useTranslation';

export default function PublicContestsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'completed'>('live');
  const [scheduleFilter, setScheduleFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useContests({
    tab: activeTab,
    scheduleType: scheduleFilter === 'all' ? undefined : scheduleFilter,
    search: debouncedSearch || undefined,
  });

  const contests = data?.contests || [];
  const stats = data?.stats || { liveCount: 0, upcomingCount: 0, completedCount: 0 };

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6 sm:space-y-8 mt-4 sm:mt-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[var(--student-primary)] via-[var(--student-accent)] to-[var(--primary)] text-white p-6 sm:p-10 md:p-12 shadow-xl antigravity-glass">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 rounded-full bg-black/10 blur-2xl"></div>

        <div className="relative z-10 max-w-2xl space-y-3 sm:space-y-5">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-[10px] sm:text-xs font-extrabold uppercase tracking-wider border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-300" />
            <span className="text-white drop-shadow-sm">{t('contest.liveArena')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-md">
            {t('contest.heroTitle')}
          </h1>
          <p className="text-white/90 text-sm sm:text-base md:text-lg leading-relaxed max-w-xl font-medium drop-shadow-sm">
            {t('contest.heroDesc')}
          </p>
        </div>
      </div>

      {/* Filters & Tabs Section */}
      <div className="flex flex-col gap-4 sticky top-16 sm:top-20 z-20 bg-[var(--background)]/80 backdrop-blur-md py-3 sm:py-0 border-b border-[var(--border)]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">

          {/* Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-4 -mb-2 sm:-mb-4 pt-1 px-1 -mx-1">
            <button
              type="button"
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold transition-all shrink-0 relative overflow-hidden group ${activeTab === 'live'
                ? 'bg-[var(--error)] text-white shadow-md shadow-[var(--error)]/20'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)]'
                }`}
            >
              {activeTab === 'live' && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
              <Flame className={`w-4 h-4 relative z-10 ${activeTab === 'live' ? 'animate-pulse text-white' : 'text-[var(--error)]'}`} />
              <span className="relative z-10">{t('contest.liveContests')}</span>
              {stats.liveCount > 0 && (
                <span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${activeTab === 'live' ? 'bg-white/30 text-white' : 'bg-[var(--error-light)] text-[var(--error)]'
                    }`}
                >
                  {stats.liveCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upcoming')}
              className={`flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold transition-all shrink-0 relative overflow-hidden group ${activeTab === 'upcoming'
                ? 'bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)]'
                }`}
            >
              {activeTab === 'upcoming' && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
              <Clock className={`w-4 h-4 relative z-10 ${activeTab === 'upcoming' ? 'text-white' : 'text-[var(--info)]'}`} />
              <span className="relative z-10">{t('contest.upcomingContests')}</span>
              {stats.upcomingCount > 0 && (
                <span
                  className={`relative z-10 px-1.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-extrabold ${activeTab === 'upcoming' ? 'bg-white/30 text-white' : 'bg-[var(--info-light)] text-[var(--info)]'
                    }`}
                >
                  {stats.upcomingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('completed')}
              className={`flex items-center gap-2 px-4 py-2.5 sm:py-2 rounded-xl text-sm font-bold transition-all shrink-0 relative overflow-hidden group ${activeTab === 'completed'
                ? 'bg-[var(--student-primary)] text-white shadow-md shadow-[var(--student-primary)]/20'
                : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-hover)] border border-[var(--border)]'
                }`}
            >
              {activeTab === 'completed' && <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>}
              <CheckCircle className={`w-4 h-4 relative z-10 ${activeTab === 'completed' ? 'text-white' : 'text-[var(--success)]'}`} />
              <span className="relative z-10">{t('contest.completedContests')}</span>
            </button>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="sm:hidden flex items-center justify-between pb-4 border-b border-[var(--border)]">
            <span className="text-sm font-bold text-[var(--color-foreground)]">
              {activeTab === 'live' ? 'Live' : activeTab === 'upcoming' ? 'Upcoming' : 'Completed'}
            </span>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--card-solid)] border border-[var(--border)] text-xs font-bold text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Desktop / Expanded Mobile Search & Filters */}
          <div className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2 pb-4 sm:pb-4 ${showFilters ? 'flex' : 'hidden sm:flex'}`}>
            <div className="relative flex-1 sm:w-64 group">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
              <input
                type="text"
                placeholder={t('contest.searchContests')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 sm:py-1.5 text-sm rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all shadow-sm"
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
      </div>

      {/* Contest Cards Grid */}
      {isLoading ? (
        <PageSkeleton />
      ) : contests.length === 0 ? (
        <div className="p-10 sm:p-16 text-center rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] flex flex-col items-center gap-4 antigravity-glass shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-muted)] flex items-center justify-center mb-2 shadow-inner">
            <Trophy className="w-8 h-8 text-[var(--color-muted-foreground)] opacity-50" />
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-[var(--color-foreground)]">
            {activeTab === 'live'
              ? t('contest.noLiveContests')
              : activeTab === 'upcoming'
                ? t('contest.noUpcomingContests')
                : t('contest.noCompletedContests')}
          </h3>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md">
            {activeTab === 'live'
              ? t('contest.noLiveContestsDesc')
              : t('contest.noUpcomingContestsDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((c) => (
            <ContestCard key={c._id} contest={c} />
          ))}
        </div>
      )}
    </main>
  );
}
