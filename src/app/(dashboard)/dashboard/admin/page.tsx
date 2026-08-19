// src/app/(dashboard)/dashboard/admin/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin as checkIsSuperAdmin } from '@/lib/roles';
import { PageWrapper } from '@/components/layout';
import { useAdminAnalytics } from './analytics/_hooks/useAdminAnalytics';
import AdminHero from './_components/AdminHero';
import AdminStatsGrid from './_components/AdminStatsGrid';
import AdminQuickActions from './_components/AdminQuickActions';
import AdminRecentActivity from './_components/AdminRecentActivity';
import AdminSystemOverview from './_components/AdminSystemOverview';

export default function AdminDashboardPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { stats, isLoading, isRefreshing, handleRefresh } = useAdminAnalytics();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--teacher-border)] border-t-[var(--teacher-primary)] rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push(ROUTES.login);
    return null;
  }

  const isSuperAdmin = checkIsSuperAdmin(session.user?.role);

  return (
    <PageWrapper className="space-y-6">
      <AdminHero
        userName={session.user?.name}
        isSuperAdmin={isSuperAdmin}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <AdminStatsGrid
        stats={stats}
        isLoading={isLoading}
      />

      <AdminQuickActions isSuperAdmin={isSuperAdmin} />

      <AdminRecentActivity stats={stats} />

      <AdminSystemOverview />
    </PageWrapper>
  );
}
