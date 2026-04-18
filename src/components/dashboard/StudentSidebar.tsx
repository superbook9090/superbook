// src/components/dashboard/StudentSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  HelpCircle,
  TrendingUp,
  User,
  LogOut,
  GraduationCap,
  Newspaper,
  Heart
} from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';

const studentNavigation = [
  { name: 'common.dashboard', href: '/dashboard/student', icon: LayoutDashboard },
  { name: 'common.myCourses', href: '/dashboard/student/courses', icon: BookOpen },
  { name: 'common.browse', href: '/dashboard/student/browse', icon: Search },
  { name: 'common.blogs', href: '/dashboard/student/blogs', icon: Newspaper, feature: 'enableBlogs' },
  { name: 'common.favorites', href: '/dashboard/student/favorites', icon: Heart, feature: 'enableBlogs' },
  { name: 'common.quizzes', href: '/dashboard/student/quizzes', icon: HelpCircle },
  { name: 'common.progress', href: '/dashboard/student/progress', icon: TrendingUp },
  { name: 'common.profile', href: '/dashboard/student/profile', icon: User },
];

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function StudentSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();

  const enableBlogs = useFeature('enableBlogs');
  const enableQuizzes = useFeature('enableQuizzes');
  const enableCourses = useFeature('enableCourses');

  const filteredNavigation = studentNavigation.filter(item => {
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
    <div className="flex flex-col w-72 h-screen bg-gradient-to-b from-[#4f46e5] to-[#3730a3] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-6 pb-4 relative z-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-5 py-4">
          <Link href="/dashboard/student" className="flex items-center gap-3 group">
            <img
              src="/logo.svg"
              alt="Super Book Logo"
              className="h-9 w-auto bg-transparent object-contain transition-transform duration-300 group-hover:scale-105 group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
            />
            <div className="flex flex-col items-start">
              <h1 className="text-white text-xl font-bold leading-tight">SUPER BOOK</h1>
              <p className="text-indigo-200 text-xs leading-none mt-0.5">{t('common.learningPlatform')}</p>
            </div>
          </Link>
        </div>

        {/* Role Badge */}
        <div className="mt-6 px-6">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
            {t('common.student')}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-8 flex-1 px-4 space-y-1 min-h-0 overflow-y-auto">
          {filteredNavigation.map((item, index) => {
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
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm'
                      : 'text-indigo-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`mr-3 p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
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
        </nav>
      </div>

      {/* User Profile Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-4 relative z-10 bg-gradient-to-b from-transparent to-[#3730a3]/50">
        <div className="glass-dark rounded-2xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0 ml-3">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-indigo-200 truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 p-2 rounded-xl text-indigo-200 hover:text-white hover:bg-white/10 transition-all"
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
