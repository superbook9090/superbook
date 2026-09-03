'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { ShieldCheck, RefreshCw, Crown } from 'lucide-react';

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

  const displayName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="hero-banner relative overflow-hidden"
    >
      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
              {isSuperAdmin ? <Crown className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>{isSuperAdmin ? 'Superadmin' : t('admin.adminDashboard')}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--success-light)] text-[var(--success)]">
              <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
              <span>{t('dashboard.allOperational')}</span>
            </div>
          </div>

          <h1 className="heading-xl">
            {t('dashboard.welcomeBack')}{displayName ? `, ` : '!'}
            {displayName && <span className="gradient-text">{displayName}!</span>}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('admin.adminDesc')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 md:pt-0">
          {isSuperAdmin && (
            <div className="flex items-center gap-2 bg-[var(--card-solid)] border border-[var(--border)] rounded-xl px-3 py-2 text-sm shadow-[var(--shadow-sm)]">
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, startDate: e.target.value })}
                className="bg-transparent text-[var(--color-foreground)] border-none outline-none cursor-pointer"
                aria-label="Start Date"
              />
              <span className="text-[var(--color-muted-foreground)]">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => onDateRangeChange({ ...dateRange, endDate: e.target.value })}
                className="bg-transparent text-[var(--color-foreground)] border-none outline-none cursor-pointer"
                aria-label="End Date"
              />
            </div>
          )}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[var(--card-solid)] text-[var(--color-foreground)] border border-[var(--border)] hover:border-[var(--teacher-border)] hover:bg-[var(--teacher-soft)] transition-all shadow-[var(--shadow-sm)] min-h-[44px]"
          >
            <RefreshCw className={`w-4 h-4 text-[var(--teacher-primary)] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? t('dashboard.refreshing') : t('dashboard.refresh')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
