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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link
            href={isTeacherOrAdmin ? '/dashboard/teacher' : '/dashboard/student'}
            className="group"
          >
            <PremiumLogo 
              variant="default"
              size="md"
              theme="white"
            />
          </Link>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
            {isTeacherOrAdmin ? t('dashboard.teacherDashboard') : t('dashboard.studentDashboard')}
          </h1>
        </div>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
