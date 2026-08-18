'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  RefreshCw,
  LayoutDashboard,
  Users,
  BookOpen,
  Award,
  Activity,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import type { AnalyticsTabKey } from './types';

interface AdminAnalyticsHeroProps {
  activeTab: AnalyticsTabKey;
  onTabChange: (tab: AnalyticsTabKey) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastUpdated: Date | null;
}

export function AdminAnalyticsHero({
  activeTab,
  onTabChange,
  onRefresh,
  isRefreshing,
  lastUpdated,
}: AdminAnalyticsHeroProps) {
  const { t } = useTranslation();

  const tabs: { key: AnalyticsTabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'overview', label: t('adminAnalytics.tabOverview'), icon: LayoutDashboard },
    { key: 'users', label: t('adminAnalytics.tabUsers'), icon: Users },
    { key: 'courses', label: t('adminAnalytics.tabCourses'), icon: BookOpen },
    { key: 'quizzes', label: t('adminAnalytics.tabQuizzes'), icon: Award },
    { key: 'activity', label: t('adminAnalytics.tabActivity'), icon: Activity },
  ];

  const formattedTime = lastUpdated
    ? lastUpdated.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 w-full min-w-0"
    >
      {/* Top Banner */}
      <div className="hero-banner w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-2.5 sm:p-3 bg-[var(--primary-soft)] text-[var(--primary)] rounded-xl sm:rounded-2xl shrink-0 shadow-xs">
              <BarChart3 className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="heading-lg sm:heading-xl truncate">{t('adminAnalytics.title')}</h1>
              <p className="text-[var(--color-muted-foreground)] text-xs sm:text-sm mt-0.5 sm:mt-1 line-clamp-2 max-w-2xl">
                {t('adminAnalytics.description')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[var(--color-border)] pt-2.5 sm:pt-0">
            {formattedTime && (
              <span className="text-[11px] sm:text-xs text-[var(--color-muted)] font-medium">
                {t('adminAnalytics.lastUpdated', { time: formattedTime })}
              </span>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs font-semibold shadow-xs py-1.5 px-3"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('adminAnalytics.refreshing') : t('adminAnalytics.refresh')}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)] overflow-x-auto scrollbar-none w-full min-w-0">
        {tabs.map(({ key, label, icon: Icon }) => {
          const isActive = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 md:flex-1 justify-center touch-target ${
                isActive
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-[var(--shadow-sm)] font-bold'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--card-solid)]/40'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-[var(--primary)]' : 'text-[var(--color-muted)]'}`} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
