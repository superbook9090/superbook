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
        { id: 'all', label: t('admin.allRoles') || 'All Roles' },
        { id: 'student', label: t('roles.student') || 'Students' },
        { id: 'teacher', label: t('roles.teacher') || 'Teachers' },
        { id: 'admin', label: t('roles.admin') || 'Admins' },
      ],
    },
    {
      label: t('adminAnalytics.platform') || 'Platform',
      icon: <Smartphone className="w-3.5 h-3.5" aria-hidden />,
      value: platformFilter,
      onChange: (val: string) => { setPlatformFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allPlatforms') || 'All Platforms' },
        { id: 'app', label: t('adminAnalytics.platformApp') || 'Mobile App' },
        { id: 'web', label: t('adminAnalytics.platformWeb') || 'Website' },
        { id: 'android', label: 'Android' },
        { id: 'ios', label: 'iOS' },
      ],
    },
    {
      label: t('adminAnalytics.activity') || 'Activity',
      icon: <Activity className="w-3.5 h-3.5" aria-hidden />,
      value: activityFilter,
      onChange: (val: string) => { setActivityFilter(val); setPage(1); },
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('adminAnalytics.allActivity') || 'All Activity' },
        { id: 'today', label: t('adminAnalytics.activeToday') || 'Active Today' },
        { id: 'week', label: t('adminAnalytics.activeThisWeek') || 'Active 7 Days' },
        { id: 'month', label: t('adminAnalytics.activeThisMonth') || 'Active 30 Days' },
        { id: 'inactive', label: t('adminAnalytics.inactiveUsers') || 'Inactive (>30d)' },
      ],
    },
    ...(isSuper && organizations.length > 0
      ? [{
          label: t('adminUsers.organization') || 'Organization',
          icon: <Building2 className="w-3.5 h-3.5" aria-hidden />,
          value: orgFilter,
          onChange: (val: string) => { setOrgFilter(val); setPage(1); },
          neutralValue: 'all',
          options: [
            { id: 'all', label: t('adminUsers.allOrganizations') || 'All Organizations' },
            { id: 'none', label: t('adminUsers.noOrganization') || 'Public (No Org)' },
            ...organizations.map((org) => ({ id: org._id, label: org.name })),
          ],
        }]
      : []),
  ];
}
