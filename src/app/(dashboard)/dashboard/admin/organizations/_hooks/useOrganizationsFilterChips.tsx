'use client';

import React from 'react';
import { CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrgSortOption, OrgStatusFilter } from '../_components/types';

interface UseOrganizationsFilterChipsProps {
  statusFilter: OrgStatusFilter;
  setStatusFilter: (s: OrgStatusFilter) => void;
  sortOption: OrgSortOption;
  setSortOption: (s: OrgSortOption) => void;
}

export function useOrganizationsFilterChips({
  statusFilter,
  setStatusFilter,
  sortOption,
  setSortOption,
}: UseOrganizationsFilterChipsProps) {
  const { t } = useTranslation();

  return [
    {
      label: t('organizations.status'),
      icon: React.createElement(CheckCircle2, { className: 'w-3.5 h-3.5', 'aria-hidden': true }),
      value: statusFilter,
      onChange: (val: string) => setStatusFilter(val as OrgStatusFilter),
      neutralValue: 'all',
      options: [
        { id: 'all', label: t('organizations.allStatus') || 'All Status' },
        { id: 'active', label: t('organizations.activeStatus') || 'Active' },
        { id: 'inactive', label: t('organizations.inactiveStatus') || 'Inactive' },
      ],
    },
    {
      label: t('organizations.sortBy'),
      icon: React.createElement(SlidersHorizontal, { className: 'w-3.5 h-3.5', 'aria-hidden': true }),
      value: sortOption,
      onChange: (val: string) => setSortOption(val as OrgSortOption),
      neutralValue: 'newest',
      options: [
        { id: 'newest', label: t('organizations.sortNewest') || 'Newest' },
        { id: 'name', label: t('organizations.sortName') || 'Name (A-Z)' },
        { id: 'users', label: t('organizations.sortUsers') || 'Most Users' },
        { id: 'courses', label: t('organizations.sortCourses') || 'Most Content' },
      ],
    },
  ];
}
