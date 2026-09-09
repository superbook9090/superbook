// src/features/dashboard/components/StudentSidebar.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LogoutButton from '@/components/ui/LogoutButton';
import { useQuiz } from '@/contexts/QuizContext';
import { STUDENT_NAV } from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function StudentSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isQuizActive } = useQuiz();

  const filteredNavigation = useDashboardNav(STUDENT_NAV);

  if (isQuizActive) return null;

  return (
    <div className="sidebar-rail hidden md:flex">
      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-4 sm:pt-6 pb-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4">
          <Link href={ROUTES.student.root} className="flex items-center gap-2 sm:gap-3 group">
            <PremiumLogo size="xl" />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="mt-4 sm:mt-6 px-4 sm:px-6">
          <span className="rail-chip inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-primary)]/20 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--student-primary)] mr-2 shadow-[0_0_8px_var(--student-primary)] animate-pulse" />
            {t('common.student')}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-6 sm:mt-8 flex-1 px-3 sm:px-4 space-y-1 min-h-0 overflow-y-auto">
          {filteredNavigation.map((item, index) => {
            const isActive = pathname === item.href;
            const Icon = getNavIcon(item.icon);

            return (
              <motion.div
                key={item.nameKey}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  className={`rail-link group transition-all duration-200 ${
                    isActive 
                      ? 'rail-link--active bg-[var(--student-soft)] text-[var(--student-primary)] font-semibold shadow-xs' 
                      : 'hover:translate-x-1'
                  }`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-[var(--student-primary)]' : ''}`} />
                  <span className="truncate">{t(item.nameKey)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="studentSidebarActiveIndicator"
                      className="w-1.5 h-1.5 rounded-full bg-[var(--student-primary)] ml-auto shrink-0 shadow-[0_0_10px_var(--student-primary)]"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Download App Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 space-y-2">
        <DownloadAppSidebarCard />
        <div className="antigravity-glass rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-all border border-[var(--border)]/80">
          <div className="flex items-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[var(--student-primary)] to-[var(--student-accent)] flex items-center justify-center text-white font-bold shadow-xs">
              {user?.name?.charAt(0)?.toUpperCase() || 'S'}
            </div>
            <div className="flex-1 min-w-0 ml-2.5 sm:ml-3">
              <div className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate">{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : user?.name}</div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] truncate">
                {user?.email?.toUpperCase()}
              </div>
            </div>
            <LogoutButton variant="sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
}
