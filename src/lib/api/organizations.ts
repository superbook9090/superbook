import { apiJson } from '@/lib/api/http';
import type {
  OrganizationPermissions,
  OrganizationTeacherLimits,
} from '@/lib/admin/orgPolicy';

export type { OrganizationPermissions, OrganizationTeacherLimits };

export interface OrganizationItem {
  _id: string;
  name: string;
  code: string;
  inviteCode: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  website?: string;
  tagline?: string;
  isActive: boolean;
  permissions?: OrganizationPermissions;
  teacherLimits?: OrganizationTeacherLimits;
  userCount: number;
  courseCount: number;
  blogCount: number;
  quizCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface OrganizationLookupResult {
  found: boolean;
  organization?: {
    id: string;
    name: string;
    logo?: string;
    primaryColor?: string;
    website?: string;
    tagline?: string;
    inviteCode: string;
    description?: string;
  };
}

export type OrganizationsListPayload = { organizations: OrganizationItem[] };

export function listOrganizations(options?: { includeInactive?: boolean }): Promise<OrganizationsListPayload> {
  const includeInactive = options?.includeInactive ?? true;
  const query = includeInactive ? '?includeInactive=true' : '';
  return apiJson(`/api/organizations${query}`, { method: 'GET' });
}

export function lookupOrganization(code: string): Promise<OrganizationLookupResult> {
  return apiJson(`/api/organizations/lookup?code=${encodeURIComponent(code)}`, { method: 'GET' });
}

export function createOrganization(body: {
  name: string;
  description?: string;
  logo?: string;
  primaryColor?: string;
  website?: string;
  tagline?: string;
  isActive?: boolean;
  permissions?: OrganizationPermissions;
  teacherLimits?: OrganizationTeacherLimits;
}): Promise<OrganizationItem> {
  return apiJson('/api/organizations', { method: 'POST', body });
}

export function updateOrganization(
  id: string,
  body: {
    name?: string;
    description?: string;
    logo?: string;
    primaryColor?: string;
    website?: string;
    tagline?: string;
    isActive?: boolean;
    permissions?: OrganizationPermissions;
    teacherLimits?: OrganizationTeacherLimits;
  }
): Promise<OrganizationItem> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export interface OrganizationDetailUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isSuspended: boolean;
  lastPlatform?: string;
  lastActiveAt?: string;
  createdAt: string;
}

export interface OrganizationDetailCourse {
  _id: string;
  title: string;
  category: string;
  isPublished: boolean;
  enrolledCount: number;
  lessonCount: number;
  instructorName: string;
  createdAt: string;
}

export interface OrganizationDetailQuiz {
  _id: string;
  title: string;
  isPublished: boolean;
  questionCount: number;
  timeLimit: number;
  courseTitle: string;
  instructorName: string;
  createdAt: string;
}

export interface OrganizationDetailBlog {
  _id: string;
  title: string;
  slug: string;
  category: string;
  isPublished: boolean;
  views: number;
  authorName: string;
  createdAt: string;
}

export interface OrganizationFullDetails extends OrganizationItem {
  details: {
    roleBreakdown: {
      students: number;
      teachers: number;
      admins: number;
    };
    users: OrganizationDetailUser[];
    courses: OrganizationDetailCourse[];
    quizzes: OrganizationDetailQuiz[];
    blogs: OrganizationDetailBlog[];
  };
}

export function getOrganizationDetails(id: string): Promise<OrganizationFullDetails> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}?includeDetails=true`, {
    method: 'GET',
  });
}

export function deleteOrganization(id: string): Promise<{ message: string }> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

