'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { useSessionStore } from '@/store/useSessionStore';

export default function NotFound() {
  const { session } = useSessionStore();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();

  // Determine dashboard link based on role
  let dashboardLink = '/';
  let dashboardText = t('notFound.goHome');

  if (session?.user?.role === 'student') {
    dashboardLink = '/dashboard/student';
    dashboardText = t('notFound.goToDashboard');
  } else if (session?.user?.role === 'teacher' || session?.user?.role === 'admin') {
    dashboardLink = '/dashboard/teacher';
    dashboardText = t('notFound.goToDashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${theme.activeBg}`}>
            <svg
              className={`w-12 h-12 ${theme.text}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-6xl font-extrabold text-[var(--color-foreground)] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-2">{t('notFound.pageNotFound')}</h2>

        {/* Description */}
        <p className="text-[var(--color-muted-foreground)] mb-8">
          {t('notFound.description')}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={dashboardLink}
            className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors`}
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {dashboardText}
          </Link>

          {!session && (
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-[var(--color-border)] text-base font-medium rounded-md text-[var(--color-foreground)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] transition-colors"
            >
              <svg
                className="w-5 h-5 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              {t('notFound.signIn')}
            </Link>
          )}
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-[var(--color-muted)]">
          {t('notFound.helpText')}
        </p>
      </div>
    </div>
  );
}
