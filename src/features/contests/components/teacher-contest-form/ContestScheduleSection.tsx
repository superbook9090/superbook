'use client';

import React from 'react';
import { Clock, CalendarDays, Timer } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ContestScheduleSectionProps {
  startTime: string;
  setStartTime: (value: string) => void;
  endTime: string;
  setEndTime: (value: string) => void;
  duration: string;
  setDuration: (value: string) => void;
  solutionsReleaseAt: string;
  setSolutionsReleaseAt: (value: string) => void;
}

export function ContestScheduleSection({
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  duration,
  setDuration,
  solutionsReleaseAt,
  setSolutionsReleaseAt,
}: ContestScheduleSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="p-6 rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)] text-sm font-bold text-[var(--color-foreground)]">
        <Clock className="w-4 h-4 text-[var(--primary)]" />
        <span>{t('contest.timingAndSchedule') || '2. Schedule & Solutions Release'}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Start Time */}
        <div className="group">
          <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
            {t('contest.startTime') || 'Start Date & Time *'}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* End Time */}
        <div className="group">
          <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
            {t('contest.endTime') || 'End Date & Time *'}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="group">
          <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
            {t('contest.durationMinutes') || 'Attempt Duration (Minutes) *'}
          </label>
          <div className="relative">
            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
            <input
              type="number"
              min="1"
              max="1440"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Solutions Release */}
        <div className="group">
          <label className="block text-xs font-semibold text-[var(--color-muted-foreground)] mb-1.5 group-focus-within:text-[var(--primary)] transition-colors">
            {t('contest.solutionsReleaseTime') || 'Solutions Unlock Time (Optional)'}
          </label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--primary)] pointer-events-none transition-colors" />
            <input
              type="datetime-local"
              value={solutionsReleaseAt}
              onChange={(e) => setSolutionsReleaseAt(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-[var(--color-surface-muted)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/40 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
            />
          </div>
          <span className="text-[11px] text-[var(--color-muted)] mt-1 block">
            {t('contest.solutionsLockedHint') || 'Answers remain locked for students until this time. Defaults to end time.'}
          </span>
        </div>
      </div>
    </div>
  );
}
