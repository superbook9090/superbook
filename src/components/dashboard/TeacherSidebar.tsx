// src/components/dashboard/TeacherSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const teacherNavigation = [
  { name: 'Dashboard', href: '/dashboard/teacher', icon: '📊' },
  { name: 'My Courses', href: '/dashboard/teacher/courses', icon: '📚' },
  { name: 'Quizzes', href: '/dashboard/teacher/quizzes', icon: '❓' },
  { name: 'Analytics', href: '/dashboard/teacher/analytics', icon: '📈' },
  { name: 'Profile', href: '/dashboard/teacher/profile', icon: '👤' },
];

const adminNavigation = [
  { name: 'Users', href: '/dashboard/admin/users', icon: '👥' },
  { name: 'All Courses', href: '/dashboard/admin/courses', icon: '📚' },
];

export default function TeacherSidebar({ user }: { user: any }) {
  const pathname = usePathname();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="flex flex-col w-64 h-screen bg-green-700">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-white text-2xl font-bold">SuperBook</h1>
        </div>

        {/* Role Badge */}
        <div className="mt-2 px-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`}>
            {isAdmin ? 'Admin' : 'Teacher'}
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {teacherNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-green-800 text-white'
                  : 'text-green-100 hover:bg-green-600'
              } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-green-800">
              <p className="px-3 text-xs font-semibold text-green-200 uppercase tracking-wider">
                Admin
              </p>
              <div className="mt-2 space-y-1">
                {adminNavigation.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${
                      pathname === item.href
                        ? 'bg-green-800 text-white'
                        : 'text-green-100 hover:bg-green-600'
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="truncate">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 border-t border-green-800 p-4">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs font-medium text-green-200 truncate">
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="ml-2 flex-shrink-0 bg-green-600 text-white p-2 rounded-lg text-sm font-medium hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            aria-label="Sign out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
