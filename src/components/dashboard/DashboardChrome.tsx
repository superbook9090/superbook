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
      <div className="dashboard-shell" data-role={(role || 'student').toLowerCase()}>
        {!isTakingQuiz && (
          <LazyMobileNav
            user={session.user}
            navigation={mainNav}
            adminNavigation={isAdminUser ? ADMIN_NAV : []}
            isSuperAdmin={isSuperAdminUser}
          />
        )}

        <aside className="hidden md:block flex-shrink-0" aria-label="Sidebar">
          {isStaff ? (
            <LazyTeacherSidebar user={session.user} />
          ) : (
            <LazyStudentSidebar user={session.user} />
          )}
        </aside>

        <div className="flex flex-1 flex-col min-h-0 md:h-screen overflow-hidden">
          <LazyDashboardHeader
            isTeacherOrAdmin={isStaff}
            showNotifications={role === 'student'}
          />

          <RoleThemeProvider role={role || 'student'}>
            <DashboardContent>
              <LazyPushNotificationManager />
              {children}
            </DashboardContent>
          </RoleThemeProvider>

          {!isTakingQuiz && <LazyMobileBottomNav items={mainNav} />}
        </div>
      </div>
    </QuizProvider>
  );
}
