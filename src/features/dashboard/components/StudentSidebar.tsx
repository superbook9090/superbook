// src/features/dashboard/components/StudentSidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { STUDENT_NAV } from '@/constants/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuiz } from '@/contexts/QuizContext';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { useSessionStore } from '@/store/useSessionStore';
import StreakBadge from '@/components/gamification/StreakBadge';
import Tooltip from '@/components/ui/Tooltip';
import SidebarShell, { type SidebarUser } from './sidebar/SidebarShell';
import SidebarNavSection from './sidebar/SidebarNavSection';
import { groupStudentNav, useSidebarCollapsed } from './sidebar/sidebarGroups';

export default function StudentSidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isQuizActive } = useQuiz();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  const filteredNavigation = useDashboardNav(STUDENT_NAV);
  const groups = useMemo(() => groupStudentNav(filteredNavigation), [filteredNavigation]);

  const sessionUser = useSessionStore((s) => s.session?.user);
  const org = sessionUser?.organizationName
    ? {
        name: sessionUser.organizationName,
        logo: sessionUser.organizationLogo,
        color: sessionUser.organizationColor,
      }
    : undefined;

  if (isQuizActive) return null;

  return (
    <SidebarShell
      user={user}
      homePath={ROUTES.student.root}
      profileHref={ROUTES.student.profile}
      collapsed={collapsed}
      onToggleCollapsed={toggleCollapsed}
      avatarFallback="S"
      org={org}
      roleBadgeExpanded={
        <span className="rail-chip w-full justify-center bg-[var(--student-soft)] text-[var(--student-primary)] border-[var(--student-primary)]/25">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--student-primary)] shadow-[0_0_8px_var(--student-primary)] animate-pulse" />
          <span>{t('common.student')}</span>
        </span>
      }
      roleBadgeCollapsed={
        <Tooltip label={t('common.student')} position="right">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-primary)]/25">
            <Sparkles className="w-4 h-4" />
          </span>
        </Tooltip>
      }
      topWidgetExpanded={<StreakBadge />}
      topWidgetCollapsed={<StreakBadge compact />}
    >
      {groups.map((group) => (
        <SidebarNavSection
          key={group.id}
          labelKey={group.labelKey}
          items={group.items}
          pathname={pathname}
          collapsed={collapsed}
          layoutId="studentSidebarActiveBar"
        />
      ))}
    </SidebarShell>
  );
}
