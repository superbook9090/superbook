// src/app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import StudentSidebar from '@/features/dashboard/components/StudentSidebar';
import TeacherSidebar from '@/features/dashboard/components/TeacherSidebar';
import MobileNav from '@/features/dashboard/components/MobileNav';
import MobileBottomNav from '@/features/dashboard/components/MobileBottomNav';
import DashboardHeader from '@/features/dashboard/components/DashboardHeader';
import { RoleThemeProvider } from '@/contexts/RoleThemeContext';
import { QuizProvider } from '@/contexts/QuizContext';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import PushNotificationManager from '@/components/providers/PushNotificationManager';
import { DashboardContent } from '@/components/layout';
import { ADMIN_NAV, STUDENT_NAV, TEACHER_NAV } from '@/constants/navigation';

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
    <QuizProvider>
      <div
        className="dashboard-shell"
        data-role={(role || 'student').toLowerCase()}
      >
        <MobileNav
          user={session.user}
          navigation={mainNav}
          adminNavigation={isAdminUser ? ADMIN_NAV : []}
          isSuperAdmin={isSuperAdminUser}
        />

        <aside className="hidden md:block flex-shrink-0" aria-label="Sidebar">
          {isStaff ? (
            <TeacherSidebar user={session.user} />
          ) : (
            <StudentSidebar user={session.user} />
          )}
        </aside>

        <div className="flex flex-1 flex-col min-h-0 md:h-screen overflow-hidden">
          <DashboardHeader isTeacherOrAdmin={isStaff} showNotifications={role === 'student'} />

          <RoleThemeProvider role={role || 'student'}>
            <DashboardContent>
              <PushNotificationManager />
              {children}
            </DashboardContent>
          </RoleThemeProvider>

          <MobileBottomNav items={mainNav} />
        </div>
      </div>
    </QuizProvider>
  );
}
