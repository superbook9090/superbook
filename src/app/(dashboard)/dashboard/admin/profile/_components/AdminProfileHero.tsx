'use client';

import React from 'react';
import Link from 'next/link';
import type { Session } from '@/types';
import {
  ShieldCheck,
  Shield,
  Copy,
  Check,
  Building2,
  KeyRound,
  LayoutDashboard,
  UserCheck,
} from 'lucide-react';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import type { AccountInfo } from '@/lib/api/auth';
import type { AdminProfileTabKey } from '../_types';
import LogoutButton from '@/components/ui/LogoutButton';

interface AdminProfileHeroProps {
  session: Session;
  accountInfo: AccountInfo | null;
  copiedId: boolean;
  onCopyId: () => void;
  onSelectTab: (tab: AdminProfileTabKey) => void;
  onOpenPassword: () => void;
}

export function AdminProfileHero({
  session,
  accountInfo,
  copiedId,
  onCopyId,
  onSelectTab,
  onOpenPassword,
}: AdminProfileHeroProps) {
  const { t } = useTranslation();
  const superAdmin = isSuperAdmin(session.user?.role);
  const displayName = session.user?.name || 'Administrator';
  const displayEmail = session.user?.email || '';
  const orgName = accountInfo?.organizationName || (superAdmin ? null : 'Unassigned Organization');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('') || 'AD';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-sm">
      {/* Ambient background decoration */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[var(--primary)]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />

      <div className="p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Avatar & Identity details */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-indigo-600 text-white flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md border-2 border-white/20">
                {initials}
              </div>
              {/* Online status indicator */}
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-[var(--card-solid)] flex items-center justify-center shadow-xs"
                title={t('adminProfile.statusActive') || 'Active Session'}
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
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
                    superAdmin
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20'
                  }`}
                >
                  {superAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  ) : (
                    <Shield className="w-3.5 h-3.5" />
                  )}
                  {superAdmin
                    ? t('adminProfile.superAdminBadge') || 'Super Admin'
                    : t('adminProfile.adminBadge') || 'Admin'}
                </span>
              </div>

              <p className="text-sm text-[var(--color-muted-foreground)] break-all truncate">
                {displayEmail}
              </p>

              {/* Organization & Admin ID Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                {orgName ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-foreground)] border border-[var(--border)]">
                    <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
                    <span className="truncate max-w-[200px]">{orgName}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-xs font-medium text-[var(--color-muted-foreground)] border border-[var(--border)]">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('adminProfile.unassignedOrg') || 'Global Platform'}</span>
                  </span>
                )}

                {session.user?.id && (
                  <Tooltip label={t('adminProfile.copyId') || 'Copy Admin ID'}>
                    <button
                      onClick={onCopyId}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] text-xs font-mono text-[var(--color-muted-foreground)] border border-[var(--border)] transition-colors cursor-pointer"
                      aria-label="Copy User ID"
                    >
                      {copiedId ? (
                        <Check className="w-3 h-3 text-emerald-500" />
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
              <span>{t('adminProfile.editProfile') || 'Edit Details'}</span>
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
              <span>{t('adminProfile.changePassword') || 'Security'}</span>
            </Button>

            <Link href={ROUTES.admin.root}>
              <Button variant="primary" size="sm" className="flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {t('adminProfile.adminDashboard') || 'Admin Hub'}
                </span>
              </Button>
            </Link>

            <LogoutButton variant="profile" />
          </div>
        </div>
      </div>
    </div>
  );
}
