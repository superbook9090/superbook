'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
import { fetchAnalytics } from '@/lib/api/analytics';
import { getApiErrorMessage } from '@/lib/api/http';
import { useSessionStore } from '@/store/useSessionStore';
import type { AdminStats, AnalyticsTabKey } from '../_components/types';

export function useAdminAnalytics() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<AnalyticsTabKey>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Date range state
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const fetchStats = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setIsRefreshing(true);
      }
      try {
        const data = (await fetchAnalytics('admin', dateRange)) as { stats?: AdminStats };
        if (data.stats) {
          setStats(data.stats);
          setLastUpdated(new Date());
        }
      } catch (err) {
        addAlert({
          type: 'error',
          message: getApiErrorMessage(err, t('errors.errorLoadingAnalytics')),
        });
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [t, addAlert, dateRange]
  );

  useEffect(() => {
    if (status === 'loading') return;
    if (session) {
      fetchStats();
    }
  }, [session, status, fetchStats]);

  const handleRefresh = () => {
    fetchStats(true);
  };

  return {
    session,
    status,
    stats,
    isLoading,
    isRefreshing,
    activeTab,
    setActiveTab,
    lastUpdated,
    handleRefresh,
    dateRange,
    setDateRange,
  };
}
