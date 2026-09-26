'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import {
  ShieldCheck,
  RefreshCw,
  Crown,
  Bell,
  Sparkles,
} from 'lucide-react';

interface AdminHeroProps {
  userName?: string;
  isSuperAdmin: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
  dateRange: { startDate: string; endDate: string };
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export default function AdminHero({
  userName,
  isSuperAdmin,
  isRefreshing,
  onRefresh,
  dateRange,
  onDateRangeChange,
}: AdminHeroProps) {
  const { t } = useTranslation();

  const displayName = useMemo(() => {
    if (!userName) return '';
    return userName.charAt(0).toUpperCase() + userName.slice(1);
  }, [userName]);

  const setPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    if (days > 0) {
      start.setDate(start.getDate() - days);
    } else {
      start.setFullYear(start.getFullYear() - 1);
    }
    onDateRangeChange({
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`relative overflow-hidden px-3.5 py-3 sm:px-4 sm:py-3.5 rounded-xl sm:rounded-2xl border backdrop-blur-xl ${
        isSuperAdmin
          ? 'border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[var(--card-solid)] to-purple-500/10 shadow-xs'
          : 'border-[var(--teacher-border)]/60 bg-gradient-to-br from-[var(--teacher-soft)]/50 via-[var(--card-solid)] to-[var(--student-soft)]/30 shadow-xs'
      }`}
    >
      {/* Ambient background glow */}
      <div
        className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
          isSuperAdmin ? 'bg-amber-400/15' : 'bg-[var(--teacher-primary)]/15'
        }`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left Column: Compact Identity & Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className={`p-2 rounded-xl shrink-0 border shadow-xs ${
              isSuperAdmin
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                : 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]'
            }`}
          >
            {isSuperAdmin ? <Crown className="w-4 h-4 text-amber-500" /> : <ShieldCheck className="w-4 h-4" />}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-base font-black tracking-tight text-[var(--color-foreground)] truncate">
                <span>{t('dashboard.welcomeBack')}{displayName ? ', ' : '!'}</span>
                {displayName && (
                  <span className="gradient-text inline-flex items-center gap-1">
                    {displayName}
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
                  </span>
                )}
              </h1>

              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">
                  {t('admin.superadminTier')}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shrink-0">
                  {t('admin.adminSuite')}
                </span>
              )}

              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--success-light)] text-[var(--success)] border border-[var(--success)]/20 shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--success)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[var(--success)]" />
                </span>
                <span>{t('admin.systemsOperational')}</span>
              </div>
            </div>

            <p className="text-[11px] text-[var(--color-muted-foreground)] truncate mt-0.5">
              {t('admin.adminDesc')}
            </p>
          </div>
        </div>

        {/* Right Column: Sleek Horizontal Toolbar */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-start md:justify-end">
          {isSuperAdmin && (
            <div className="inline-flex items-center gap-1 p-0.5 sm:p-1 rounded-xl antigravity-glass border border-[var(--border)] shadow-xs">
              <div className="flex items-center gap-0.5 px-0.5 border-r border-[var(--border)]/60">
                <button
                  type="button"
                  onClick={() => setPreset(1)}
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                  title="Last 24 Hours"
                >
                  {t('admin.presetToday')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(7)}
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                  title="Last 7 Days"
                >
                  {t('admin.preset7D')}
                </button>
                <button
                  type="button"
                  onClick={() => setPreset(30)}
                  className="px-1.5 py-0.5 text-[10px] font-bold rounded hover:bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors cursor-pointer"
                  title="Last 30 Days"
                >
                  {t('admin.preset30D')}
                </button>
              </div>

              <div className="flex items-center gap-1 px-1 text-[11px]">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
                  className="bg-transparent text-[var(--color-foreground)] border-none outline-none cursor-pointer text-[11px] font-medium"
                  aria-label="Start Date"
                />
                <span className="text-[var(--color-muted-foreground)] text-[9px] font-bold uppercase">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
                  className="bg-transparent text-[var(--color-foreground)] border-none outline-none cursor-pointer text-[11px] font-medium"
                  aria-label="End Date"
                />
              </div>
            </div>
          )}

          {isSuperAdmin && (
            <Link
              href={ROUTES.admin.notifications}
              className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-500/25 transition-all shadow-xs min-h-[34px]"
              title={t('admin.emergencyBroadcast')}
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('admin.broadcastDispatcher')}</span>
            </Link>
          )}

          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold antigravity-glass text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--primary)]/50 hover:shadow-xs active:scale-95 transition-all min-h-[34px] cursor-pointer"
            aria-label={t('dashboard.refresh')}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[var(--primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isRefreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
