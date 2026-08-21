// src/features/dashboard/components/TeacherSidebar.tsx
'use client';

import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import PremiumLogo from '@/components/ui/PremiumLogo';
import LogoutButton from '@/components/ui/LogoutButton';
import { useQuiz } from '@/contexts/QuizContext';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { ADMIN_NAV, TEACHER_NAV } from '@/constants/navigation';
import { getNavIcon } from '@/lib/navigation/icons';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import DownloadAppSidebarCard from '@/components/ui/DownloadAppSidebarCard';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
}

export default function TeacherSidebar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isQuizActive } = useQuiz();
  const isAdminUser = isAdmin(user?.role);
  const isSuperAdminUser = isSuperAdmin(user?.role);

  const filteredTeacherNavigation = useDashboardNav(TEACHER_NAV);
  const filteredAdminNavigation = useDashboardNav(ADMIN_NAV, { isSuperAdmin: isSuperAdminUser });

  if (isQuizActive) return null;

  return (
    <div className="sidebar-rail hidden md:flex">
      {/* Scrollable Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pt-4 sm:pt-6 pb-4">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4">
          <Link href={ROUTES.teacher.root} className="flex items-center gap-2 sm:gap-3 group">
            <PremiumLogo size="xl" />
          </Link>
        </div>

        {/* Role Badge */}
        <div className="mt-4 sm:mt-6 px-4 sm:px-6">
          <span className={`rail-chip ${isAdminUser
            ? 'bg-[var(--color-error-light)] text-[var(--color-error)] border-[var(--color-error)]/25'
            : ''
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 animate-pulse ${isAdminUser ? 'bg-[var(--color-error)]' : 'bg-[var(--primary)]'}`} />
            {isAdminUser ? t('common.administrator') : t('common.teacher')}
          </span>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="mt-6 sm:mt-8 flex-1 px-3 sm:px-4 space-y-1 min-h-0 overflow-y-auto">
          {filteredTeacherNavigation.map((item, index) => {
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
                  className={`rail-link ${isActive ? 'rail-link--active' : ''}`}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{t(item.nameKey)}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="rail-link__dot"
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}

          {isAdminUser && (
            <div className="pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-[var(--border)]">
              <p className="rail-section-label">
                {t('common.administration')}
              </p>
              <div className="space-y-1">
                {filteredAdminNavigation.map((item, index) => {
                  const isActive = pathname === item.href;
                  const Icon = getNavIcon(item.icon);

                  return (
                    <motion.div
                      key={item.nameKey}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (filteredTeacherNavigation.length + index) * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        className={`rail-link ${isActive ? 'rail-link--active' : ''}`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="truncate">{t(item.nameKey)}</span>
                        {isActive && (
                          <motion.div
                            layoutId="activeIndicatorAdmin"
                            className="rail-link__dot"
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

      {/* User Profile & Download App Section - Fixed at Bottom */}
      <div className="flex-shrink-0 p-3 sm:p-4 space-y-2">
        <DownloadAppSidebarCard />
        <div className="card-surface rounded-2xl p-3 sm:p-4">
          <div className="flex items-center">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-bg flex items-center justify-center text-white font-semibold">
              {user?.name?.charAt(0)?.toUpperCase() || 'T'}
            </div>
            <div className="flex-1 min-w-0 ml-2 sm:ml-3">
              <div className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">{user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : user?.name}</div>
              <div className="text-xs text-[var(--color-muted-foreground)] truncate">
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
