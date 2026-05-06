// src/features/dashboard/components/TeacherSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  BarChart3,
  User,
  LogOut,
  Users,
  Library,
  Newspaper,
  Building2,
  Folder
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useQuiz } from '@/contexts/QuizContext';
import { isAdmin, isSuperAdmin } from '@/lib/roles';

const teacherNavigation = [
  { name: 'common.dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
  { name: 'common.myCourses', href: '/dashboard/teacher/courses', icon: BookOpen },
  { name: 'common.quizzes', href: '/dashboard/teacher/quizzes', icon: HelpCircle },
  { name: 'common.blogs', href: '/dashboard/teacher/blogs', icon: Newspaper, feature: 'enableBlogs' },
  { name: 'common.analytics', href: '/dashboard/teacher/analytics', icon: BarChart3 },
  { name: 'common.profile', href: '/dashboard/teacher/profile', icon: User },
];

const adminNavigation = [
  { name: 'common.users', href: '/dashboard/admin/users', icon: Users },
  { name: 'common.organizations', href: '/dashboard/admin/organizations', icon: Building2, superadminOnly: true },
  { name: 'common.allCourses', href: '/dashboard/admin/courses', icon: Library },
  { name: 'common.allQuizzes', href: '/dashboard/admin/quizzes', icon: HelpCircle },
  { name: 'common.allBlogs', href: '/dashboard/admin/blogs', icon: Newspaper, feature: 'enableBlogs' },
  { name: 'common.files', href: '/dashboard/admin/files', icon: Folder },
  { name: 'common.analytics', href: '/dashboard/admin/analytics', icon: BarChart3 },
  { name: 'common.settings', href: '/dashboard/admin/settings', icon: User },
];

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function TeacherSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isQuizActive } = useQuiz();
  const isAdminUser = isAdmin(user?.role);
  const isSuperAdminUser = isSuperAdmin(user?.role);

  const enableBlogs = useFeature('enableBlogs');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableCourses = useFeature('enableCourses');

  // Hide sidebar when quiz is active
  if (isQuizActive) return null;

  const filteredTeacherNavigation = teacherNavigation.filter(item => {
    if (item.feature === 'enableBlogs') {
      return enableBlogs;
    }
    if (item.feature === 'enableQuizzes') {
      return enableQuizzes;
    }
    if (item.feature === 'enableCourses') {
      return enableCourses;
    }
    return true;
  });

  const filteredAdminNavigation = adminNavigation.filter(item => {
    // Filter out superadminOnly items for non-superadmin users
    if (item.superadminOnly && !isSuperAdminUser) {
      return false;
    }
    if (item.feature === 'enableBlogs') {
      return enableBlogs;
    }
    if (item.feature === 'enableQuizzes') {
      return enableQuizzes;
    }
    if (item.feature === 'enableCourses') {
      return enableCourses;
    }
    return true;
  });

  return (
    <div className="hidden lg:flex flex-col w-72 h-screen bg-gradient-to-br from-[var(--teacher-primary)] via-[var(--teacher-primary)] to-[var(--teacher-primary-dark)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 lg:w-48 lg:h-48 bg-[var(--teacher-primary-light)]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-24 h-24 bg-[var(--teacher-accent)]/10 rounded-full blur-2xl -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl translate-x-1/2 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-br from-[var(--teacher-accent)]/5 to-transparent rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-4 sm:pt-6 pb-4 relative z-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4">
          <Link href="/dashboard/teacher" className="flex items-center gap-2 sm:gap-3 group">
            <PremiumLogo 
              variant="green"
              size="xl"
              theme="teacher"
            />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="mt-4 sm:mt-6 px-4 sm:px-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            isAdminUser
              ? 'bg-[var(--color-error)]/30 text-white border-[var(--color-error)]/30'
              : 'bg-white/20 text-white border-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${isAdminUser ? 'bg-[var(--color-error)]' : 'bg-[var(--teacher-primary-light)]'}`} />
            {isAdminUser ? t('common.administrator') : t('common.teacher')}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-6 sm:mt-8 flex-1 px-3 sm:px-4 space-y-1 min-h-0 overflow-y-auto">
          {filteredTeacherNavigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`group flex items-center px-3 sm:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-[var(--teacher-primary-light)] hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`mr-2 sm:mr-3 p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <span className="truncate">{t(item.name)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {isAdminUser && (
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-white/10">
              <p className="px-3 sm:px-4 text-xs font-semibold text-[var(--teacher-primary-light)]/70 uppercase tracking-wider mb-2">
                {t('common.administration')}
              </p>
              <div className="space-y-1">
                {filteredAdminNavigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (filteredTeacherNavigation.length + index) * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`group flex items-center px-3 sm:px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                            : 'text-[var(--teacher-primary-light)] hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className={`mr-2 sm:mr-3 p-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <span className="truncate">{t(item.name)}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicatorAdmin"
                            className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 relative z-10 bg-gradient-to-b from-transparent to-[var(--teacher-primary-dark)]/50">
        <div className="glass-dark rounded-2xl p-3 sm:p-4">
          <div className="flex items-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--teacher-primary-light)] to-[var(--teacher-accent)] flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="flex-1 min-w-0 ml-2 sm:ml-3">
              <div className="text-xs sm:text-sm font-semibold truncate">{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : user?.name}</div>
              <div className="text-xs text-[var(--teacher-primary-light)] truncate">
                {user?.email?.toUpperCase()}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 p-2 rounded-xl text-[var(--teacher-primary-light)] hover:text-white hover:bg-white/10 transition-all"
              aria-label={t('common.signOut')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
