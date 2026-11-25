'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { isSuperAdmin } from '@/lib/roles';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { PageWrapper, EmptyState } from '@/components/layout';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import { useAdminAnalytics } from './_hooks/useAdminAnalytics';
import { AdminAnalyticsHero } from './_components/AdminAnalyticsHero';
import { AdminOverviewTab } from './_components/AdminOverviewTab';
import { AdminUsersTab } from './_components/AdminUsersTab';
import { AdminContentTab } from './_components/AdminContentTab';
import { AdminPerformanceTab } from './_components/AdminPerformanceTab';
import { AdminActivityTab } from './_components/AdminActivityTab';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
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
  } = useAdminAnalytics();

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
    }
  }, [session, status, router]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  const isSuper = isSuperAdmin(session?.user?.role);

  return (
    <PageWrapper className="overflow-x-hidden">
      <AdminAnalyticsHero
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        lastUpdated={lastUpdated}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        isSuperAdmin={isSuper}
        activityCount={stats?.recentActivity?.length}
      />

      {!stats ? (
        <EmptyState
          title={t('progress.noDataAvailable')}
          description={t('progress.tryRefreshing')}
          action={
            <Button variant="secondary" onClick={handleRefresh}>
              {t('adminAnalytics.refresh')}
            </Button>
          }
        />
      ) : (
        <div className={`transition-opacity duration-150 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          {activeTab === 'overview' && <AdminOverviewTab stats={stats} />}
          {activeTab === 'users' && <AdminUsersTab stats={stats} />}
          {activeTab === 'courses' && <AdminContentTab stats={stats} />}
          {activeTab === 'quizzes' && <AdminPerformanceTab stats={stats} />}
          {activeTab === 'activity' && (
            <AdminActivityTab activity={stats.recentActivity || []} />
          )}
        </div>
      )}
    </PageWrapper>
  );
}
