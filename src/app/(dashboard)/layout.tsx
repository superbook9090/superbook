// src/app/(dashboard)/layout.tsx
import type { Metadata } from 'next';
import { DASHBOARD_ROBOTS } from '@/lib/seo/metadata';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DashboardChrome from '@/components/dashboard/DashboardChrome';
import DashboardProviders from '@/components/providers/DashboardProviders';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { STUDENT_NAV, TEACHER_NAV } from '@/constants/navigation';

export const metadata: Metadata = {
  robots: DASHBOARD_ROBOTS,
  title: 'Dashboard',
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  const role = session.user?.role;
  const isStaff = ['teacher', 'admin', 'superadmin'].includes(role || '');
  const isAdminUser = isAdmin(role);
  const isSuperAdminUser = isSuperAdmin(role);
  const mainNav = isStaff ? TEACHER_NAV : STUDENT_NAV;

  return (
    <DashboardProviders>
      <DashboardChrome
        session={session}
        isStaff={isStaff}
        isAdminUser={isAdminUser}
        isSuperAdminUser={isSuperAdminUser}
        mainNav={mainNav}
      >
        {children}
      </DashboardChrome>
    </DashboardProviders>
  );
}
