'use client';

import type { Session } from 'next-auth';
import { usePathname } from 'next/navigation';
import { RoleThemeProvider } from '@/contexts/RoleThemeContext';
import { QuizProvider } from '@/contexts/QuizContext';
import { DashboardContent } from '@/components/layout';
import { ADMIN_NAV, type DashboardNavItem } from '@/constants/navigation';
import {
  LazyDashboardHeader,
  LazyMobileBottomNav,
  LazyMobileNav,
  LazyPushNotificationManager,
  LazyStudentSidebar,
  LazyTeacherSidebar,
} from '@/lib/lazy';
import FeatureRouteGuard from '@/components/dashboard/FeatureRouteGuard';
import dynamic from 'next/dynamic';

const LazyContestMarketingPopup = dynamic(
  () => import('@/components/marketing/ContestMarketingPopup'),
  { ssr: false }
);

type DashboardChromeProps = {
  session: Session;
  isStaff: boolean;
  isAdminUser: boolean;
  isSuperAdminUser: boolean;
  mainNav: DashboardNavItem[];
  children: React.ReactNode;
};

export default function DashboardChrome({
  session,
  isStaff,
  isAdminUser,
  isSuperAdminUser,
  mainNav,
  children,
}: DashboardChromeProps) {
  const role = session.user?.role;
  const pathname = usePathname();
  
  // Hide mobile navs when taking a quiz
  const isTakingQuiz = pathname?.includes('/take') || false;

  return (
    <QuizProvider>
      <FeatureRouteGuard role={role} />
      <div className="dashboard-shell" data-role={(role || 'student').toLowerCase()}>
        <div className="dashboard-aurora" aria-hidden="true">
          <div className="dashboard-aurora__blob dashboard-aurora__blob--one" />
          <div className="dashboard-aurora__blob dashboard-aurora__blob--two" />
        </div>
        {!isTakingQuiz && (
          <LazyMobileNav
            user={session.user}
            navigation={mainNav}
            adminNavigation={isAdminUser ? ADMIN_NAV : []}
            isSuperAdmin={isSuperAdminUser}
          />
        )}

        <aside className="hidden md:block flex-shrink-0 [&>.sidebar-rail:nth-of-type(n+2)]:hidden [&>div:nth-of-type(n+2)]:hidden" aria-label="Sidebar">
          {isStaff ? (
            <LazyTeacherSidebar user={session.user} />
          ) : (
            <LazyStudentSidebar user={session.user} />
          )}
        </aside>

        <div className="dashboard-col flex flex-1 flex-col min-h-0 md:h-screen overflow-hidden">
          <LazyDashboardHeader
            isTeacherOrAdmin={isStaff}
            showNotifications={role === 'student'}
          />

          <RoleThemeProvider role={role || 'student'}>
            <DashboardContent>
              <LazyPushNotificationManager />
              <LazyContestMarketingPopup />
              {children}
            </DashboardContent>
          </RoleThemeProvider>

          {!isTakingQuiz && (
            <LazyMobileBottomNav 
              items={isAdminUser ? ADMIN_NAV : mainNav}
              isAdminUser={isAdminUser}
              isSuperAdmin={isSuperAdminUser}
            />
          )}
        </div>
      </div>
    </QuizProvider>
  );
}
