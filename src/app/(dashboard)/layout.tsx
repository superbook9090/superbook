// src/app/(dashboard)/layout.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import StudentSidebar from '@/components/dashboard/StudentSidebar';
import TeacherSidebar from '@/components/dashboard/TeacherSidebar';
import MobileNav from '@/components/dashboard/MobileNav';
import MobileBottomNav from '@/components/dashboard/MobileBottomNav';
import SessionProvider from '@/components/dashboard/SessionProvider';

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard/student', icon: '📊' },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: '📚' },
  { name: 'Browse', href: '/dashboard/student/browse', icon: '🔍' },
  { name: 'Quizzes', href: '/dashboard/student/quizzes', icon: '❓' },
  { name: 'Progress', href: '/dashboard/student/progress', icon: '📈' },
  { name: 'Profile', href: '/dashboard/student/profile', icon: '👤' },
];

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard/teacher', icon: '📊' },
  { name: 'Courses', href: '/dashboard/teacher/courses', icon: '📚' },
  { name: 'Quizzes', href: '/dashboard/teacher/quizzes', icon: '❓' },
  { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: '📈' },
  { name: 'Profile', href: '/dashboard/teacher/profile', icon: '👤' },
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
    <div className="min-h-screen bg-gray-50 md:flex">
      {/* Mobile Navigation Header */}
      <MobileNav
        user={session.user}
        navigation={isTeacherOrAdmin ? teacherNavigation : studentNavigation}
        colorScheme={isTeacherOrAdmin ? 'green' : 'indigo'}
      />

      {/* Sidebar - Desktop Only */}
      <div className="hidden md:block">
        {isTeacherOrAdmin ? (
          <TeacherSidebar user={session.user} />
        ) : (
          <StudentSidebar user={session.user} />
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-0">
        {/* Desktop Header */}
        <header className="hidden md:block bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {isTeacherOrAdmin ? 'Teacher Dashboard' : 'Student Dashboard'}
            </h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 md:p-6 lg:p-8 pb-20 md:pb-6">
          <SessionProvider>
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </SessionProvider>
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          navigation={isTeacherOrAdmin ? teacherNavigation : studentNavigation}
          colorScheme={isTeacherOrAdmin ? 'green' : 'indigo'}
        />
      </div>
    </div>
  );
}