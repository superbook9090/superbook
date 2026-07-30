// src/features/dashboard/components/DashboardHeader.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import Tooltip from '@/components/ui/Tooltip';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  isTeacherOrAdmin: boolean;
  showNotifications?: boolean;
}

export default function DashboardHeader({ isTeacherOrAdmin, showNotifications = false }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="hidden md:block flex-shrink-0 bg-[var(--card-solid)] shadow-[var(--shadow-sm)] border-b border-[var(--border)]">
      <div className="max-w-[var(--page-max-width)] mx-auto px-[var(--gutter-x)] py-[var(--space-3)] sm:py-[var(--space-4)] flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={isTeacherOrAdmin ? ROUTES.teacher.root : ROUTES.student.root}
            className="group flex-shrink-0"
          >
            <PremiumLogo
              variant="default"
              size="md"
              theme="white"
            />
          </Link>
          <h1 className="text-base sm:text-lg lg:text-xl font-semibold text-[var(--foreground)] truncate">
            {isTeacherOrAdmin ? t('dashboard.teacherDashboard') : t('dashboard.studentDashboard')}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {showNotifications && (
            <Tooltip label={t('common.notifications')} position="bottom">
              <Link
                href={ROUTES.student.notifications}
                className="touch-target focus-ring p-2 rounded-lg text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors"
                aria-label={t('common.notifications')}
              >
                <Bell className="w-5 h-5" />
              </Link>
            </Tooltip>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
