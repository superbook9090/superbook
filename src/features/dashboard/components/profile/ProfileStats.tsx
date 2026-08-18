'use client';

import React from 'react';
import type { Session } from '@/types';
import {
  GraduationCap,
  BookOpen,
  Building,
  ShieldCheck,
  KeyRound,
  Globe,
  Zap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { normalizeRole, isSuperAdmin, isAdmin } from '@/lib/roles';
import { useTranslation } from '@/hooks/useTranslation';
import type { AccountInfo } from '@/lib/api/auth';

interface ProfileStatsProps {
  session: Session;
  accountInfo: AccountInfo | null;
}

export function ProfileStats({ session, accountInfo }: ProfileStatsProps) {
  const { t } = useTranslation();
  const rawRole = session.user?.role;
  const role = normalizeRole(rawRole);
  const superAdmin = isSuperAdmin(rawRole);
  const adminUser = isAdmin(rawRole);
  const hasPassword = accountInfo?.hasPassword ?? true;
  const provider = accountInfo?.provider || 'credentials';

  const stats = (() => {
    if (adminUser) {
      return [
        {
          label: t('profile.statRole') || 'Authority Scope',
          value: superAdmin
            ? t('adminProfile.statAuthorityGlobal') || 'Full Platform'
            : t('adminProfile.statAuthorityOrg') || 'Organization',
          description: superAdmin ? 'Cross-tenant oversight' : 'Tenant restricted',
          icon: Globe,
          iconColor: 'text-[var(--primary)]',
          bgLight: 'bg-[var(--primary-soft)]',
        },
        {
          label: t('profile.statOrganization') || 'Organization',
          value: accountInfo?.organizationName || (superAdmin ? 'Global Instance' : 'Unassigned'),
          description: superAdmin ? 'System-wide authority' : 'Local administrator',
          icon: Building,
          iconColor: 'text-[var(--info)]',
          bgLight: 'bg-[var(--info-light)]',
        },
        {
          label: t('profile.statSecurity') || 'Security Health',
          value: hasPassword ? 'Protected' : 'Setup Needed',
          description: `Provider: ${provider.toUpperCase()}`,
          icon: hasPassword ? ShieldCheck : KeyRound,
          iconColor: hasPassword ? 'text-[var(--success)]' : 'text-[var(--warning)]',
          bgLight: hasPassword ? 'bg-[var(--success-light)]' : 'bg-[var(--warning-light)]',
        },
        {
          label: t('adminProfile.statAccess') || 'Admin Level',
          value: superAdmin ? 'Super Administrator' : 'Standard Admin',
          description: superAdmin ? 'Full control & overrides' : 'Standard controls',
          icon: superAdmin ? Zap : CheckCircle2,
          iconColor: 'text-[var(--teacher-primary)]',
          bgLight: 'bg-[var(--teacher-soft)]',
        },
      ];
    }

    if (role === 'teacher') {
      const canCreatePublic = accountInfo?.canCreatePublicCourses ?? false;
      return [
        {
          label: t('profile.statRole') || 'Role & Status',
          value: 'Educator / Instructor',
          description: 'Author & mentor',
          icon: BookOpen,
          iconColor: 'text-[var(--teacher-primary)]',
          bgLight: 'bg-[var(--teacher-soft)]',
        },
        {
          label: t('profile.statOrganization') || 'Institution / Org',
          value: accountInfo?.organizationName || 'Independent',
          description: accountInfo?.organizationName ? 'Institutional faculty' : 'Self-hosted instructor',
          icon: Building,
          iconColor: 'text-[var(--info)]',
          bgLight: 'bg-[var(--info-light)]',
        },
        {
          label: t('profile.statSecurity') || 'Security Health',
          value: hasPassword ? 'Protected' : 'Action Needed',
          description: `Provider: ${provider.toUpperCase()}`,
          icon: hasPassword ? ShieldCheck : KeyRound,
          iconColor: hasPassword ? 'text-[var(--success)]' : 'text-[var(--warning)]',
          bgLight: hasPassword ? 'bg-[var(--success-light)]' : 'bg-[var(--warning-light)]',
        },
        {
          label: 'Public Courses',
          value: canCreatePublic ? 'Unrestricted' : 'Course Code Required',
          description: canCreatePublic ? 'Public catalog visibility' : 'Private course delivery',
          icon: Sparkles,
          iconColor: 'text-[var(--primary)]',
          bgLight: 'bg-[var(--primary-soft)]',
        },
      ];
    }

    // Default: Student
    return [
      {
        label: t('profile.statRole') || 'Role & Status',
        value: 'Enrolled Student',
        description: 'Active learner',
        icon: GraduationCap,
        iconColor: 'text-[var(--student-primary)]',
        bgLight: 'bg-[var(--student-soft)]',
      },
      {
        label: t('profile.statOrganization') || 'Institution / Org',
        value: accountInfo?.organizationName || 'Independent Learner',
        description: accountInfo?.organizationName ? 'Enrolled via Institution' : 'Open platform student',
        icon: Building,
        iconColor: 'text-[var(--info)]',
        bgLight: 'bg-[var(--info-light)]',
      },
      {
        label: t('profile.statSecurity') || 'Security Health',
        value: hasPassword ? 'Protected' : 'Setup Needed',
        description: `Provider: ${provider.toUpperCase()}`,
        icon: hasPassword ? ShieldCheck : KeyRound,
        iconColor: hasPassword ? 'text-[var(--success)]' : 'text-[var(--warning)]',
        bgLight: hasPassword ? 'bg-[var(--success-light)]' : 'bg-[var(--warning-light)]',
      },
      {
        label: 'Learning Path',
        value: 'Interactive Study',
        description: 'Quizzes, Courses & Notes',
        icon: BookOpen,
        iconColor: 'text-[var(--primary)]',
        bgLight: 'bg-[var(--primary-soft)]',
      },
    ];
  })();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div
            key={i}
            className="card-surface p-3.5 sm:p-4 hover:shadow-xs transition-shadow flex flex-col justify-between"
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
