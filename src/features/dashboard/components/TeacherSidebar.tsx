// src/features/dashboard/components/TeacherSidebar.tsx
'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { Crown, Shield, GraduationCap } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { ADMIN_NAV, TEACHER_NAV } from '@/constants/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useQuiz } from '@/contexts/QuizContext';
import { useDashboardNav } from '@/hooks/useDashboardNav';
import { getDashboardHomePath, isAdmin, isSuperAdmin } from '@/lib/roles';
import { useSessionStore } from '@/store/useSessionStore';
import Tooltip from '@/components/ui/Tooltip';
import SidebarShell, { type SidebarUser } from './sidebar/SidebarShell';
import SidebarNavSection from './sidebar/SidebarNavSection';
import {
  groupAdminNav,
  groupTeacherNav,
  useSidebarCollapsed,
} from './sidebar/sidebarGroups';

export default function TeacherSidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isQuizActive } = useQuiz();
  const { collapsed, toggleCollapsed } = useSidebarCollapsed();

  const isAdminUser = isAdmin(user?.role);
  const isSuperAdminUser = isSuperAdmin(user?.role);
  const homePath = getDashboardHomePath(user?.role);
  const profileHref = isAdminUser ? ROUTES.admin.profile : ROUTES.teacher.profile;

  const filteredTeacherNavigation = useDashboardNav(TEACHER_NAV);
  const filteredAdminNavigation = useDashboardNav(ADMIN_NAV, { isSuperAdmin: isSuperAdminUser });

  const adminGroups = useMemo(
    () => groupAdminNav(filteredAdminNavigation),
    [filteredAdminNavigation]
  );
  const teacherGroups = useMemo(
    () => groupTeacherNav(filteredTeacherNavigation),
    [filteredTeacherNavigation]
  );
  const teacherWorkspaceItems = useMemo(
    () => filteredTeacherNavigation.slice(0, 5),
    [filteredTeacherNavigation]
  );

  const sessionUser = useSessionStore((s) => s.session?.user);
  const org = sessionUser?.organizationName
    ? {
        name: sessionUser.organizationName,
        logo: sessionUser.organizationLogo,
        color: sessionUser.organizationColor,
      }
    : undefined;

  if (isQuizActive) return null;

  const roleBadgeExpanded = isSuperAdminUser ? (
    <span className="rail-chip w-full justify-center bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
      <span className="truncate">{t('admin.superadminTier')}</span>
    </span>
  ) : isAdminUser ? (
    <span className="rail-chip w-full justify-center bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]">
      <Shield className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{t('common.administrator')}</span>
    </span>
  ) : (
    <span className="rail-chip w-full justify-center">
      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{t('common.teacher')}</span>
    </span>
  );

  const roleBadgeCollapsed = isSuperAdminUser ? (
    <Tooltip label={t('admin.superadminTier')} position="right">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/12 text-amber-500 border border-amber-500/30">
        <Crown className="w-4 h-4" />
      </span>
    </Tooltip>
  ) : isAdminUser ? (
    <Tooltip label={t('common.administrator')} position="right">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)]">
        <Shield className="w-4 h-4" />
      </span>
    </Tooltip>
  ) : (
    <Tooltip label={t('common.teacher')} position="right">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--primary-border)]">
        <GraduationCap className="w-4 h-4" />
      </span>
    </Tooltip>
  );

  return (
    <SidebarShell
      user={user}
      homePath={homePath}
      profileHref={profileHref}
      collapsed={collapsed}
      onToggleCollapsed={toggleCollapsed}
      avatarFallback={isAdminUser ? 'A' : 'T'}
      org={org}
      roleBadgeExpanded={roleBadgeExpanded}
      roleBadgeCollapsed={roleBadgeCollapsed}
    >
      {isAdminUser ? (
        <>
          {adminGroups.map((group) => (
            <SidebarNavSection
              key={group.id}
              labelKey={group.labelKey}
              items={group.items}
              pathname={pathname}
              collapsed={collapsed}
              layoutId="adminSidebarActiveBar"
            />
          ))}

          <SidebarNavSection
            labelKey="admin.teacherWorkspace"
            items={teacherWorkspaceItems}
            pathname={pathname}
            collapsed={collapsed}
            layoutId="adminSidebarActiveBar"
            collapsible
            defaultOpen={false}
            showTopDivider
            headerIcon={<GraduationCap className="w-3.5 h-3.5 shrink-0" />}
          />
        </>
      ) : (
        teacherGroups.map((group) => (
          <SidebarNavSection
            key={group.id}
            labelKey={group.labelKey}
            items={group.items}
            pathname={pathname}
            collapsed={collapsed}
            layoutId="teacherSidebarActiveBar"
          />
        ))
      )}
    </SidebarShell>
  );
}
