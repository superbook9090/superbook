// src/features/dashboard/components/DashboardHeader.tsx
'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

interface DashboardHeaderProps {
  isTeacherOrAdmin: boolean;
}

export default function DashboardHeader({ isTeacherOrAdmin }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="hidden md:block flex-shrink-0 bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href={isTeacherOrAdmin ? '/dashboard/teacher' : '/dashboard/student'}
            className="group flex-shrink-0"
          >
            <PremiumLogo 
              variant="default"
              size="md"
              theme="white"
            />
          </Link>
          <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-semibold text-gray-900 truncate">
            {isTeacherOrAdmin ? t('dashboard.teacherDashboard') : t('dashboard.studentDashboard')}
          </h1>
        </div>
        <div className="flex-shrink-0">
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
