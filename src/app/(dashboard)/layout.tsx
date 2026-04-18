// src/app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import StudentSidebar from '@/components/dashboard/StudentSidebar';
import TeacherSidebar from '@/components/dashboard/TeacherSidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import SessionProvider from '@/components/dashboard/SessionProvider';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard/student', icon: 'LayoutDashboard' },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: 'BookOpen' },
  { name: 'Browse', href: '/dashboard/student/browse', icon: 'Search' },
  { name: 'Quizzes', href: '/dashboard/student/quizzes', icon: 'HelpCircle' },
  { name: 'Progress', href: '/dashboard/student/progress', icon: 'TrendingUp' },
  { name: 'Profile', href: '/dashboard/student/profile', icon: 'User' },
];

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard/teacher', icon: 'LayoutDashboard' },
  { name: 'Courses', href: '/dashboard/teacher/courses', icon: 'BookOpen' },
  { name: 'Quizzes', href: '/dashboard/teacher/quizzes', icon: 'HelpCircle' },
  { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: 'BarChart3' },
  { name: 'Profile', href: '/dashboard/teacher/profile', icon: 'User' },
];

const adminNavigation = [
  { name: 'Users', href: '/dashboard/admin/users', icon: 'Users' },
  { name: 'Courses', href: '/dashboard/admin/courses', icon: 'BookOpen' },
  { name: 'Quizzes', href: '/dashboard/admin/quizzes', icon: 'HelpCircle' },
  { name: 'Blogs', href: '/dashboard/admin/blogs', icon: 'Library' },
  { name: 'Analytics', href: '/dashboard/admin/analytics', icon: 'BarChart3' },
  { name: 'Settings', href: '/dashboard/admin/settings', icon: 'User' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const role = session.user?.role;
  const isTeacherOrAdmin = role === 'teacher' || role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Navigation Header - Fixed */}
      <MobileNav
        user={session.user}
        navigation={isTeacherOrAdmin ? teacherNavigation : studentNavigation}
        adminNavigation={isTeacherOrAdmin ? adminNavigation : []}
        colorScheme={isTeacherOrAdmin ? 'emerald' : 'indigo'}
      />

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:block flex-shrink-0">
        {isTeacherOrAdmin ? (
          <TeacherSidebar user={session.user} />
        ) : (
          <StudentSidebar user={session.user} />
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0 md:h-screen overflow-hidden">
        {/* Desktop Header - Sticky */}
        <DashboardHeader isTeacherOrAdmin={isTeacherOrAdmin} />

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <SessionProvider>
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </SessionProvider>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          navigation={isTeacherOrAdmin ? teacherNavigation : studentNavigation}
          colorScheme={isTeacherOrAdmin ? 'emerald' : 'indigo'}
        />
      </div>
    </div>
  );
}