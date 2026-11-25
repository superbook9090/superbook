'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  ShieldCheck,
  RefreshCw,
  Crown,
  Bell,
  CalendarIcon,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, parseISO } from 'date-fns';
import { OrganizationBadge } from '@/components/organization/OrganizationBadge';
import { useSessionStore } from '@/store/useSessionStore';
import { cn } from '@/lib/utils';

interface AdminHeroProps {
  userName?: string;
  isSuperAdmin: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

const SUPERADMIN_HAIRLINE = 'linear-gradient(90deg, #f59e0b 0%, var(--teacher-primary) 100%)';

export default function AdminHero({
  userName,
  isSuperAdmin,
  isRefreshing,
  onRefresh,
  dateRange,
  onDateRangeChange,
}: AdminHeroProps) {
  const { t } = useTranslation();
  const sessionUser = useSessionStore((s) => s.session?.user);

  const displayName = useMemo(() => {
    if (!userName) return '';
    return userName.charAt(0).toUpperCase() + userName.slice(1);
  }, [userName]);

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    onDateRangeChange({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
    });
  };

  const parsedStartDate = useMemo(
    () => (dateRange.startDate ? parseISO(dateRange.startDate) : undefined),
    [dateRange.startDate]
  );
  const parsedEndDate = useMemo(
    () => (dateRange.endDate ? parseISO(dateRange.endDate) : undefined),
    [dateRange.endDate]
  );

  const topBarStyle = isSuperAdmin
    ? { background: SUPERADMIN_HAIRLINE }
    : { background: 'var(--teacher-gradient)' };

  return (
    <section
      className={cn(
        'teacher-panel overflow-hidden p-4 sm:p-6 lg:p-7',
        isSuperAdmin && 'border-amber-500/25'
      )}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={topBarStyle} aria-hidden />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={topBarStyle}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div className="space-y-2.5 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                isSuperAdmin
                  ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/30'
                  : 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]'
              )}
            >
              {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isSuperAdmin ? t('admin.superadminTier') : t('admin.adminSuite')}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/25">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--success)]" />
              </span>
              {t('admin.systemsOperational')}
            </span>

            {sessionUser?.organizationName && (
              <OrganizationBadge
                name={sessionUser.organizationName}
                logo={sessionUser.organizationLogo}
                color={sessionUser.organizationColor}
                variant="pill"
              />
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] leading-tight">
            {t('dashboard.welcomeBack')}
            {displayName ? ', ' : '!'}
            {displayName && (
              <span
                className={cn(
                  'bg-clip-text text-transparent bg-gradient-to-r',
                  isSuperAdmin
                    ? 'from-amber-500 to-[var(--teacher-primary)]'
                    : 'from-[var(--teacher-primary)] to-[var(--teacher-accent)]'
                )}
              >
                {displayName}!
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-2xl leading-relaxed">
            {t('admin.adminDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 shrink-0">
          {isSuperAdmin && (
            <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)]">
              <div className="flex items-center gap-0.5 pr-1.5 border-r border-[var(--border)]">
                {[
                  { days: 1, label: t('admin.presetToday') },
                  { days: 7, label: t('admin.preset7D') },
                  { days: 30, label: t('admin.preset30D') },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setPreset(preset.days)}
                    className="px-2.5 min-h-[36px] text-xs font-bold rounded-[8px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)] transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-2.5 min-h-[36px] text-xs font-bold text-[var(--color-foreground)] rounded-[8px] hover:bg-[var(--card-solid)] transition-colors cursor-pointer tabular-nums"
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-[var(--color-muted-foreground)] shrink-0" />
                    {parsedStartDate ? (
                      <span>
                        {format(parsedStartDate, 'dd MMM')}
                        {parsedEndDate ? ` – ${format(parsedEndDate, 'dd MMM')}` : ''}
                      </span>
                    ) : (
                      <span>Pick range</span>
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    autoFocus
                    mode="range"
                    defaultMonth={parsedStartDate}
                    selected={{ from: parsedStartDate, to: parsedEndDate }}
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
            </div>
          )}

          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Link
                href={ROUTES.admin.notifications}
                className="inline-flex items-center justify-center gap-2 px-4 min-h-[44px] rounded-xl text-xs sm:text-sm font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/35 hover:bg-amber-500/25 transition-colors flex-1 sm:flex-initial"
              >
                <Bell className="w-4 h-4 shrink-0" />
                <span>{t('admin.broadcastDispatcher')}</span>
              </Link>
            )}

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="teacher-pill-btn min-h-[44px] px-4 text-xs sm:text-sm font-semibold cursor-pointer flex-1 sm:flex-initial"
            >
              <RefreshCw className={cn('w-4 h-4 text-[var(--teacher-primary)]', isRefreshing && 'animate-spin')} />
              <span>{isRefreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
