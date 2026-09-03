'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import { ContestCard } from '@/features/contests/components/ContestCard';
import { useContests } from '@/features/contests/hooks/useContests';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Trophy, Flame, Clock, CheckCircle, Search, Sparkles } from 'lucide-react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useTranslation } from '@/hooks/useTranslation';

export default function PublicContestsPage() {
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

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] text-white p-8 sm:p-12 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-extrabold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[var(--warning)]" />
              <span>{t('contest.liveArena') || 'Quiz-Do Contest Arena'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {t('contest.heroTitle') || 'Compete in Live Quizzes & Win Rewards'}
            </h1>
            <p className="text-white/80 text-sm sm:text-base leading-relaxed">
              {t('contest.heroDesc') ||
                'Join scheduled national and daily quiz contests created by expert educators. Climb the live leaderboard and earn trophies, certificates, and prizes!'}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
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
                    activeTab === 'upcoming' ? 'bg-white/20 text-white' : 'bg-[var(--info-light)] text-[var(--info)]'
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

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)]" />
              <input
                type="text"
                placeholder={t('contest.searchContests') || 'Search contests...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none"
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

        {/* Contest Cards Grid */}
        {isLoading ? (
          <PageSkeleton />
        ) : contests.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] flex flex-col items-center gap-3">
            <Trophy className="w-12 h-12 text-[var(--color-muted)]" />
            <h3 className="text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {activeTab === 'live'
                ? t('contest.noLiveContests') || 'No Live Contests Right Now'
                : activeTab === 'upcoming'
                ? t('contest.noUpcomingContests') || 'No Upcoming Contests Scheduled'
                : t('contest.noCompletedContests') || 'No Completed Contests Found'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-md">
              {activeTab === 'live'
                ? t('contest.noLiveContestsDesc') || 'Check the Upcoming tab to view and prepare for scheduled live competitions!'
                : t('contest.noUpcomingContestsDesc') || 'New contests are scheduled regularly by educators. Stay tuned!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {contests.map((c) => (
              <ContestCard key={c._id} contest={c} />
            ))}
          </div>
        )}
      </main>
    );
}
