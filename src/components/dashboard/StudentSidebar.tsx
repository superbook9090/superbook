// src/components/dashboard/StudentSidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

const studentNavigation = [
  { name: 'Dashboard', href: '/dashboard/student', icon: '📊' },
  { name: 'My Courses', href: '/dashboard/student/courses', icon: '📚' },
  { name: 'Browse', href: '/dashboard/student/browse', icon: '🔍' },
  { name: 'Quizzes', href: '/dashboard/student/quizzes', icon: '❓' },
  { name: 'Progress', href: '/dashboard/student/progress', icon: '📈' },
  { name: 'Profile', href: '/dashboard/student/profile', icon: '👤' },
];

export default function StudentSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 h-screen bg-indigo-700">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-white text-2xl font-bold">SuperBook</h1>
        </div>

        {/* Role Badge */}
        <div className="mt-2 px-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500 text-white">
            Student
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {studentNavigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-100 hover:bg-indigo-600'
              } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="truncate">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* User Profile Section */}
      <div className="flex-shrink-0 border-t border-indigo-800 p-4">
        <div className="flex items-center">
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs font-medium text-indigo-200 truncate">
              {user?.email}
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="ml-2 flex-shrink-0 bg-indigo-600 text-white p-2 rounded-lg text-sm font-medium hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
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
