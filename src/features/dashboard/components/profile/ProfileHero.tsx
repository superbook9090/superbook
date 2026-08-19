'use client';

import React from 'react';
import type { Session } from '@/types';
import {
  GraduationCap,
  BookOpen,
  Shield,
  ShieldCheck,
  Building2,
  UserCheck,
} from 'lucide-react';
import { normalizeRole, isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import LogoutButton from '@/components/ui/LogoutButton';
import type { AccountInfo } from '@/lib/api/auth';

interface ProfileHeroProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function ProfileHero({ session, accountInfo }: ProfileHeroProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);

  const displayName = session.user?.name || 'User';
  const displayEmail = session.user?.email || '';
  const orgName = accountInfo?.organizationName;

  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('') || 'U';

  const roleMeta = (() => {
    if (superAdmin) {
      return {
        label: t('profile.superAdminBadge') || 'Super Admin',
        icon: ShieldCheck,
        badgeClass: 'bg-[var(--warning-light)] text-[var(--warning)] border-[var(--warning)]/30',
        avatarBg: 'bg-[var(--warning)]',
      };
    }
    if (role === 'admin') {
      return {
        label: t('profile.adminBadge') || 'Admin',
        icon: Shield,
        badgeClass: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]',
        avatarBg: 'bg-[var(--teacher-primary)]',
      };
    }
    if (role === 'teacher') {
      return {
        label: t('profile.teacherBadge') || 'Educator',
        icon: BookOpen,
        badgeClass: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]',
        avatarBg: 'bg-[var(--teacher-primary)]',
      };
    }
    return {
      label: t('profile.studentBadge') || 'Student',
      icon: GraduationCap,
      badgeClass: 'bg-[var(--student-soft)] text-[var(--student-primary)] border-[var(--student-border)]',
      avatarBg: 'bg-[var(--student-primary)]',
    };
  })();

  const RoleIcon = roleMeta.icon;

  return (
    <div className="hero-banner">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Avatar & Identity details */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div
              className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${roleMeta.avatarBg} text-white flex items-center justify-center font-bold text-lg sm:text-xl shadow-sm border border-white/20`}
            >
              {initials}
            </div>
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)] tracking-tight truncate">
                {displayName}
              </h1>
              {/* Role badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border ${roleMeta.badgeClass}`}
              >
                <RoleIcon className="w-3.5 h-3.5" />
                <span>{roleMeta.label}</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] break-all truncate">
              {displayEmail}
            </p>

            {/* Organization Status */}
            <div className="flex items-center gap-2 pt-0.5">
              {orgName ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-foreground)] border border-[var(--border)]">
                  <Building2 className="w-3 h-3 text-[var(--primary)]" />
                  <span className="truncate max-w-[200px]">{orgName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-muted-foreground)] border border-[var(--border)]">
                  <UserCheck className="w-3 h-3 text-[var(--success)]" />
                  <span>{t('profile.unassignedOrg') || 'Independent'}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Sign Out Action */}
        <div className="flex items-center self-end sm:self-center shrink-0">
          <LogoutButton variant="profile" />
        </div>
      </div>
    </div>
  );
}
