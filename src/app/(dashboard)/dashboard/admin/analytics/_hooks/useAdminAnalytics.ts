'use client';

import { useState, useEffect, useCallback } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';
import { useUrlTab } from '@/hooks/useUrlTab';
import { useAlert } from '@/components/ui/AlertContainer';
import { fetchAnalytics } from '@/lib/api/analytics';
import { getApiErrorMessage } from '@/lib/api/http';
import { queryKeys } from '@/lib/react-query/query-keys';
import { useSessionStore } from '@/store/useSessionStore';
import type { AdminStats, AnalyticsTabKey } from '../_components/types';

export function useAdminAnalytics() {
  const { session, status } = useSessionStore();
  const { t } = useTranslation();
  const { addAlert } = useAlert();

  const [activeTab, setActiveTab] = useUrlTab<AnalyticsTabKey>(
    ['overview', 'users', 'courses', 'quizzes', 'activity'],
    'overview'
  );

  // Date range state
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: '',
    endDate: '',
  });

  const orgScope = `${session?.user?.role || 'guest'}:${session?.user?.organizationId || 'global'}`;

  const query = useQuery({
    queryKey: queryKeys.analytics.admin(orgScope, dateRange.startDate, dateRange.endDate),
    queryFn: async () => {
      const data = (await fetchAnalytics('admin', dateRange)) as { stats?: AdminStats };
      return data.stats ?? null;
    },
    enabled: status === 'authenticated' && Boolean(session?.user?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes frontend cache shared across Admin Dashboard & Analytics
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    if (query.error) {
      addAlert({
        type: 'error',
        message: getApiErrorMessage(query.error, t('errors.errorLoadingAnalytics')),
      });
    }
  }, [query.error, addAlert, t]);

  const handleRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  return {
    session,
    status,
    stats: query.data ?? null,
    isLoading: query.isPending,
    isRefreshing: query.isFetching && !query.isPending,
    activeTab,
    setActiveTab,
    lastUpdated: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    handleRefresh,
    dateRange,
    setDateRange,
  };
}
