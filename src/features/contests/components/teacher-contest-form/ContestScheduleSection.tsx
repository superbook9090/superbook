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
    <div className="relative overflow-hidden p-6 sm:p-8 rounded-[2rem] bg-[var(--card-solid)]/40 backdrop-blur-2xl border border-[var(--border)]/50 shadow-xl group transition-all duration-500 hover:shadow-2xl hover:bg-[var(--card-solid)]/60">
      {/* Decorative background glows */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border)]/40">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] shadow-sm">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-[var(--color-foreground)] tracking-tight">
            {t('contest.timingAndSchedule')}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6">
          {/* Start Time */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 group-focus-within/input:text-[var(--primary)] transition-colors uppercase tracking-wider">
              {t('contest.startTime')}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-muted-foreground)] group-focus-within/input:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* End Time */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 group-focus-within/input:text-[var(--primary)] transition-colors uppercase tracking-wider">
              {t('contest.endTime')}
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-muted-foreground)] group-focus-within/input:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="group/input">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 group-focus-within/input:text-[var(--primary)] transition-colors uppercase tracking-wider">
              {t('contest.durationMinutes')}
            </label>
            <div className="relative">
              <Timer className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-muted-foreground)] group-focus-within/input:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="number"
                min="1"
                max="1440"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all"
              />
            </div>
          </div>

          {/* Solutions Release */}
          <div className="group/input flex flex-col justify-start">
            <label className="block text-xs font-bold text-[var(--color-muted-foreground)] mb-2 group-focus-within/input:text-[var(--primary)] transition-colors uppercase tracking-wider flex items-center justify-between">
              <span>{t('contest.solutionsReleaseTime')}</span>
            </label>
            <div className="relative">
              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[var(--color-muted-foreground)] group-focus-within/input:text-[var(--primary)] pointer-events-none transition-colors" />
              <input
                type="datetime-local"
                value={solutionsReleaseAt}
                onChange={(e) => setSolutionsReleaseAt(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm font-medium rounded-2xl bg-[var(--surface-muted)]/50 border border-transparent hover:border-[var(--border)] focus:bg-[var(--surface-muted)] text-[var(--color-foreground)] focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <span className="text-[11px] font-medium text-[var(--color-muted)] mt-2 flex items-center gap-1.5 opacity-80">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--warning)] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--warning)]"></span>
              </span>
              {t('contest.solutionsLockedHint')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
