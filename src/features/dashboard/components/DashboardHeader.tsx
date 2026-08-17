// src/features/dashboard/components/DashboardHeader.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Tooltip from '@/components/ui/Tooltip';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  isTeacherOrAdmin: boolean;
  showNotifications?: boolean;
}

export default function DashboardHeader({ isTeacherOrAdmin, showNotifications = false }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="dashboard-topbar hidden md:block flex-shrink-0">
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--gutter-x)] h-14 flex justify-between items-center">
        <h1 className="text-sm sm:text-base font-bold font-[family-name:var(--font-display)] tracking-tight text-[var(--foreground)] truncate">
          {isTeacherOrAdmin ? t('dashboard.teacherDashboard') : t('dashboard.studentDashboard')}
        </h1>
        <div className="flex items-center gap-2 flex-shrink-0">
          {showNotifications && (
            <Tooltip label={t('common.notifications')} position="bottom">
              <Link
                href={ROUTES.student.notifications}
                className="inline-flex h-8.5 w-8.5 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--card-solid)] text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors shadow-sm"
                aria-label={t('common.notifications')}
              >
                <Bell className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </Link>
            </Tooltip>
          )}
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
