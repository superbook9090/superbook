'use client';

import React from 'react';
import type { Session } from '@/types';
import {
  Globe,
  Building,
  ShieldCheck,
  Zap,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';
import { isSuperAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import type { AccountInfo } from '@/lib/api/auth';

interface AdminProfileStatsProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function AdminProfileStats({ session, accountInfo }: AdminProfileStatsProps) {
  const { t } = useTranslation();
  const superAdmin = isSuperAdmin(session.user?.role);
  const hasPassword = accountInfo?.hasPassword ?? true;
  const provider = accountInfo?.provider || 'credentials';

  const stats = [
    {
      label: t('adminProfile.statAuthority') || 'Authority Scope',
      value: superAdmin
        ? t('adminProfile.statAuthorityGlobal') || 'Full Platform'
        : t('adminProfile.statAuthorityOrg') || 'Organization',
      description: superAdmin ? 'Cross-tenant oversight' : 'Tenant restricted',
      icon: Globe,
      iconColor: 'text-indigo-500',
      bgLight: 'bg-indigo-500/10',
      borderLight: 'border-indigo-500/20',
    },
    {
      label: t('adminProfile.organizationLabel') || 'Organization Scope',
      value: accountInfo?.organizationName || (superAdmin ? 'Global Instance' : 'Unassigned'),
      description: superAdmin ? 'System-wide authority' : 'Local administrator',
      icon: Building,
      iconColor: 'text-blue-500',
      bgLight: 'bg-blue-500/10',
      borderLight: 'border-blue-500/20',
    },
    {
      label: t('adminProfile.statSecurity') || 'Security Health',
      value: hasPassword
        ? t('adminProfile.statSecurityGood') || 'Protected'
        : t('adminProfile.statSecurityWarn') || 'Setup Needed',
      description: `Provider: ${provider.toUpperCase()}`,
      icon: hasPassword ? ShieldCheck : KeyRound,
      iconColor: hasPassword ? 'text-emerald-500' : 'text-amber-500',
      bgLight: hasPassword ? 'bg-emerald-500/10' : 'bg-amber-500/10',
      borderLight: hasPassword ? 'border-emerald-500/20' : 'border-amber-500/20',
    },
    {
      label: t('adminProfile.statAccess') || 'Admin Level',
      value: superAdmin
        ? t('adminProfile.statAccessFull') || 'Super Admin'
        : t('adminProfile.statAccessStandard') || 'Standard Admin',
      description: superAdmin ? 'Full control & overrides' : 'Standard controls',
      icon: superAdmin ? Zap : CheckCircle2,
      iconColor: 'text-purple-500',
      bgLight: 'bg-purple-500/10',
      borderLight: 'border-purple-500/20',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="p-3.5 sm:p-4 rounded-xl border border-[var(--border)] bg-[var(--card-solid)] shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wider truncate">
                {stat.label}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bgLight} ${stat.iconColor} shrink-0`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div>
              <p className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate">
                {stat.value}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5 truncate">
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
