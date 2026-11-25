// src/app/(dashboard)/dashboard/admin/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin as checkIsSuperAdmin } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAdminAnalytics } from './analytics/_hooks/useAdminAnalytics';
import AdminHero from './_components/AdminHero';
import SuperadminExecutiveSuite from './_components/SuperadminExecutiveSuite';
import AdminStatsGrid from './_components/AdminStatsGrid';
import AdminQuickActions from './_components/AdminQuickActions';
import AdminRecentActivity from './_components/AdminRecentActivity';
import AdminSystemOverview from './_components/AdminSystemOverview';

export default function AdminDashboardPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { stats, isLoading, isRefreshing, handleRefresh, dateRange, setDateRange } = useAdminAnalytics();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [status, router]);

  if (status === 'loading') {
    return <PageSkeleton />;
  }

  if (!session) {
    return null;
  }

  const isSuperAdmin = checkIsSuperAdmin(session.user?.role);

  return (
    <PageWrapper compact className="pb-10">
      <AdminHero
        userName={session.user?.name}
        isSuperAdmin={isSuperAdmin}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      {isSuperAdmin && <SuperadminExecutiveSuite stats={stats} />}

      <AdminStatsGrid stats={stats} isLoading={isLoading} />

      <AdminQuickActions isSuperAdmin={isSuperAdmin} />

      <AdminRecentActivity stats={stats} />

      <AdminSystemOverview />
    </PageWrapper>
  );
}
