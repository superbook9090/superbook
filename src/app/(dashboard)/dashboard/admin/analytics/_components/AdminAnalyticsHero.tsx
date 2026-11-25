'use client';

import { useMemo } from 'react';
import {
  BarChart3,
  RefreshCw,
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Activity,
  CalendarIcon,
  X,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';
import { AdminTabs, type AdminTabOption } from '@/features/admin/components/AdminTabs';
import type { AnalyticsTabKey } from './types';

interface AdminAnalyticsHeroProps {
  activeTab: AnalyticsTabKey;
  onTabChange: (tab: AnalyticsTabKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
  isSuperAdmin?: boolean;
  activityCount?: number;
}

export function AdminAnalyticsHero({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
  dateRange,
  onDateRangeChange,
  isSuperAdmin = false,
  activityCount,
}: AdminAnalyticsHeroProps) {
  const { t } = useTranslation();

  const tabs: AdminTabOption<AnalyticsTabKey>[] = [
    { id: 'overview', label: t('adminAnalytics.tabOverview'), icon: <LayoutDashboard className="w-4 h-4 shrink-0" />, tone: isSuperAdmin ? 'amber' : 'primary' },
    { id: 'users', label: t('adminAnalytics.tabUsers'), icon: <Users className="w-4 h-4 shrink-0" />, tone: isSuperAdmin ? 'amber' : 'primary' },
    { id: 'courses', label: t('adminAnalytics.tabCourses'), icon: <BookOpen className="w-4 h-4 shrink-0" />, tone: isSuperAdmin ? 'amber' : 'primary' },
    { id: 'quizzes', label: t('adminAnalytics.tabQuizzes'), icon: <Award className="w-4 h-4 shrink-0" />, tone: isSuperAdmin ? 'amber' : 'primary' },
    {
      id: 'activity',
      label: t('adminAnalytics.tabActivity'),
      icon: <Activity className="w-4 h-4 shrink-0" />,
      count: activityCount && activityCount > 0 ? activityCount : undefined,
      tone: isSuperAdmin ? 'amber' : 'primary',
    },
  ];

  const parsedStart = useMemo(
    () => (dateRange.startDate ? parseISO(dateRange.startDate) : undefined),
    [dateRange.startDate]
  );
  const parsedEnd = useMemo(
    () => (dateRange.endDate ? parseISO(dateRange.endDate) : undefined),
    [dateRange.endDate]
  );

  const hasRange = Boolean(dateRange.startDate || dateRange.endDate);

  const setPreset = (days: number | null) => {
    if (days === null) {
      onDateRangeChange({ startDate: '', endDate: '' });
      return;
    }
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    onDateRangeChange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
  };

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="space-y-4 w-full min-w-0">
      <AdminPageBanner
        icon={BarChart3}
        eyebrow={t('adminAnalytics.title')}
        title={t('adminAnalytics.title')}
        description={t('adminAnalytics.description')}
        tier={isSuperAdmin ? 'superadmin' : 'admin'}
        badges={
          formattedTime ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] border border-[var(--border)] tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t('adminAnalytics.lastUpdated', { time: formattedTime })}
            </span>
          ) : undefined
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="inline-flex flex-wrap items-center gap-1 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              {[
                { days: null, label: t('common.all') },
                { days: 1, label: t('admin.presetToday') },
                { days: 7, label: t('admin.preset7D') },
                { days: 30, label: t('admin.preset30D') },
              ].map((preset) => {
                const isAllActive = preset.days === null && !hasRange;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setPreset(preset.days)}
                    className={`px-2.5 min-h-[34px] text-xs font-bold rounded-[8px] transition-colors cursor-pointer ${
                      isAllActive
                        ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]/60'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={`inline-flex items-center gap-1.5 px-2.5 min-h-[34px] text-xs font-bold rounded-[8px] transition-colors cursor-pointer tabular-nums ${
                      hasRange
                        ? 'bg-[var(--card-solid)] text-[var(--teacher-primary)] shadow-xs'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]/60'
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {parsedStart
                        ? `${format(parsedStart, 'dd MMM')}${parsedEnd ? ` – ${format(parsedEnd, 'dd MMM')}` : ''}`
                        : 'Range'}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    autoFocus
                    mode="range"
                    defaultMonth={parsedStart}
                    selected={{ from: parsedStart, to: parsedEnd }}
                    onSelect={(range) => {
                      onDateRangeChange({
                        startDate: range?.from ? format(range.from, 'yyyy-MM-dd') : '',
                        endDate: range?.to ? format(range.to, 'yyyy-MM-dd') : '',
                      });
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>

              {hasRange && (
                <button
                  type="button"
                  onClick={() => setPreset(null)}
                  aria-label={t('common.reset')}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)] transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="teacher-pill-btn min-h-[44px] px-3.5 text-xs sm:text-sm font-semibold cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('adminAnalytics.refreshing') : t('adminAnalytics.refresh')}</span>
            </button>
          </div>
        }
      />

      <AdminTabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} fullWidth />
    </div>
  );
}
