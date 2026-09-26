'use client';

import React from 'react';
import { Shield, Smartphone, Activity, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface UseUsersFilterChipsProps {
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  platformFilter: string;
  setPlatformFilter: (p: string) => void;
  activityFilter: string;
  setActivityFilter: (a: string) => void;
  orgFilter: string;
  setOrgFilter: (org: string) => void;
  setPage: (p: number) => void;
  isSuper: boolean;
  organizations: Array<{ _id: string; name: string }>;
}

export function useUsersFilterChips({
  roleFilter,
  setRoleFilter,
  platformFilter,
  setPlatformFilter,
  activityFilter,
  setActivityFilter,
  orgFilter,
  setOrgFilter,
  setPage,
  isSuper,
  organizations,
}: UseUsersFilterChipsProps) {
  const { t } = useTranslation();

  return [
    {
      label: t('admin.role'),
      icon: <Shield className="w-3.5 h-3.5" aria-hidden />,
      value: roleFilter,
      onChange: (val: string) => { setRoleFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('admin.allRoles') },
        { id: 'student', label: t('roles.student') },
        { id: 'teacher', label: t('roles.teacher') },
        { id: 'admin', label: t('roles.admin') },
      ],
    },
    {
      label: t('adminAnalytics.platform'),
      icon: <Smartphone className="w-3.5 h-3.5" aria-hidden />,
      value: platformFilter,
      onChange: (val: string) => { setPlatformFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allPlatforms') },
        { id: 'app', label: t('adminAnalytics.platformApp') },
        { id: 'web', label: t('adminAnalytics.platformWeb') },
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' },
      ],
    },
    {
      label: t('adminAnalytics.activity'),
      icon: <Activity className="w-3.5 h-3.5" aria-hidden />,
      value: activityFilter,
      onChange: (val: string) => { setActivityFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allActivity') },
        { id: 'today', label: t('adminAnalytics.activeToday') },
        { id: 'week', label: t('adminAnalytics.activeThisWeek') },
        { id: 'month', label: t('adminAnalytics.activeThisMonth') },
        { id: 'inactive', label: t('adminAnalytics.inactiveUsers') },
      ],
    },
    ...(isSuper && organizations.length > 0
      ? [{
          label: t('adminUsers.organization'),
          icon: <Building2 className="w-3.5 h-3.5" aria-hidden />,
          value: orgFilter,
          onChange: (val: string) => { setOrgFilter(val); setPage(1); },
          neutralValue: 'all',
          options: [
            { id: 'all', label: t('adminUsers.allOrganizations') },
            { id: 'none', label: t('adminUsers.noOrganization') },
            ...organizations.map((org) => ({ id: org._id, label: org.name })),
          ],
        }]
      : []),
  ];
}
