// src/components/dashboard/TeacherSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  BarChart3,
  User,
  LogOut,
  GraduationCap,
  Users,
  Library
} from 'lucide-react';

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard/teacher', icon: LayoutDashboard },
  { name: 'My Courses', href: '/dashboard/teacher/courses', icon: BookOpen },
  { name: 'Quizzes', href: '/dashboard/teacher/quizzes', icon: HelpCircle },
  { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/dashboard/teacher/profile', icon: User },
];

const adminNavigation = [
  { name: 'Users', href: '/dashboard/admin/users', icon: Users },
  { name: 'All Courses', href: '/dashboard/admin/courses', icon: Library },
];

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function TeacherSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col w-72 h-screen bg-gradient-to-b from-[#059669] to-[#047857] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-6 pb-4 relative z-10 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold tracking-tight">SuperBook</h1>
            <p className="text-emerald-100 text-xs">Teaching Platform</p>
          </div>
        </div>

        {/* Role Badge */}
        <div className="mt-6 px-6">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm border ${
            isAdmin 
              ? 'bg-rose-500/30 text-white border-rose-400/30' 
              : 'bg-white/20 text-white border-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${isAdmin ? 'bg-rose-400' : 'bg-emerald-400'}`} />
            {isAdmin ? 'Administrator' : 'Teacher'}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-8 flex-1 px-4 space-y-1 min-h-0 overflow-y-auto">
          {teacherNavigation.map((item, index) => {
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
                      : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className={`mr-3 p-1.5 rounded-lg transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="truncate">{item.name}</span>
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

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-4 text-xs font-semibold text-emerald-200/70 uppercase tracking-wider mb-2">
                Administration
              </p>
              <div className="space-y-1">
                {adminNavigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (teacherNavigation.length + index) * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-rose-500/30 text-white shadow-lg backdrop-blur-sm'
                            : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div className={`mr-3 p-1.5 rounded-lg transition-colors ${
                          isActive ? 'bg-white/20' : 'bg-transparent group-hover:bg-white/10'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="truncate">{item.name}</span>
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
      <div className="flex-shrink-0 p-4 relative z-10 bg-gradient-to-b from-transparent to-[#047857]/50">
        <div className="glass-dark rounded-2xl p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-400 flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0) || 'T'}
            </div>
            <div className="flex-1 min-w-0 ml-3">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-emerald-200 truncate">
                {user?.email}
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="ml-2 p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
