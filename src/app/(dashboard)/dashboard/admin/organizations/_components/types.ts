import type {
  OrganizationItem,
  OrganizationPermissions,
} from '@/lib/api/organizations';

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

export interface OrganizationTeacherLimitsForm {
  courses: string;
  quizzes: string;
  blogs: string;
  aiQuizGenerations: string;
  aiQuizMaxQuestions: string;
}

export interface OrganizationFormData {
  name: string;
  description: string;
  logo?: string;
  primaryColor?: string;
  website?: string;
  tagline?: string;
  isActive: boolean;
  permissions: Required<OrganizationPermissions>;
  teacherLimits: OrganizationTeacherLimitsForm;
}
