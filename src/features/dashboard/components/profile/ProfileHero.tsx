'use client';

import React from 'react';
import Link from 'next/link';
import type { Session } from '@/types';
import {
  GraduationCap,
  BookOpen,
  Shield,
  ShieldCheck,
  Building2,
  KeyRound,
  LayoutDashboard,
  UserCheck,
  Copy,
  Check,
} from 'lucide-react';
import { normalizeRole, isSuperAdmin, getDashboardHomePath } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import LogoutButton from '@/components/ui/LogoutButton';
import type { AccountInfo } from '@/lib/api/auth';
import type { ProfileTabKey } from './types';

interface ProfileHeroProps {
  session: Session;
  accountInfo: AccountInfo | null;
  copiedId: boolean;
  onCopyId: () => void;
  onSelectTab: (tab: ProfileTabKey) => void;
  onOpenPassword: () => void;
}

export function ProfileHero({
  session,
  accountInfo,
  copiedId,
  onCopyId,
  onSelectTab,
  onOpenPassword,
}: ProfileHeroProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);
  const homePath = getDashboardHomePath(rawRole);

  const displayName = session.user?.name || 'User';
  const displayEmail = session.user?.email || '';
  const orgName = accountInfo?.organizationName;

  const initials = displayName
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Avatar & Identity details */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <div
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${roleMeta.avatarBg} text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md border-2 border-white/20`}
            >
              {initials}
            </div>
            {/* Online status indicator */}
            <span
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--success)] border-2 border-[var(--card-solid)] flex items-center justify-center shadow-xs"
              title={t('profile.statusOnline') || 'Online / Active'}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] tracking-tight truncate">
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

            <p className="text-sm text-[var(--color-muted-foreground)] break-all truncate">
              {displayEmail}
            </p>

            {/* Organization & User ID Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {orgName ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-foreground)] border border-[var(--border)]">
                  <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                  <span className="truncate max-w-[200px]">{orgName}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-muted-foreground)] border border-[var(--border)]">
                  <UserCheck className="w-3.5 h-3.5 text-[var(--success)]" />
                  <span>{t('profile.unassignedOrg') || 'Independent'}</span>
                </span>
              )}

              {session.user?.id && (
                <Tooltip label={t('profile.copyId') || 'Copy User ID'}>
                  <button
                    onClick={onCopyId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--primary-soft)] hover:text-[var(--primary)] text-xs font-mono text-[var(--color-muted-foreground)] border border-[var(--border)] transition-colors cursor-pointer"
                    aria-label="Copy User ID"
                  >
                    {copiedId ? (
                      <Check className="w-3 h-3 text-[var(--success)]" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>ID: {session.user.id.slice(-6)}</span>
                  </button>
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {/* Quick Header Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onSelectTab('account')}
            className="flex items-center gap-1.5"
          >
            <span>{t('profile.editProfile') || 'Edit Details'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              onSelectTab('security');
              onOpenPassword();
            }}
            className="flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{t('profile.changePassword') || 'Security'}</span>
          </Button>

          <Link href={homePath}>
            <Button variant="primary" size="sm" className="flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {t('profile.dashboardHome') || 'Dashboard'}
              </span>
            </Button>
          </Link>

          <LogoutButton variant="profile" />
        </div>
      </div>
    </div>
  );
}
