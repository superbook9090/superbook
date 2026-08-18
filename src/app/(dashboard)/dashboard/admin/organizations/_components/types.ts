import type { OrganizationItem } from '@/lib/api/organizations';

export type { OrganizationItem };

export interface OrganizationsStatsData {
  total: number;
  active: number;
  inactive: number;
  totalUsers: number;
  totalContent: number;
}

export type OrgStatusFilter = 'all' | 'active' | 'inactive';
export type OrgSortOption = 'newest' | 'name' | 'users' | 'courses';
export type ViewMode = 'grid' | 'table';

export interface OrganizationFormData {
  name: string;
  description: string;
  isActive: boolean;
}
