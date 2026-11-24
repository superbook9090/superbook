import { apiJson } from '@/lib/api/http';

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
  }
): Promise<OrganizationItem> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export function deleteOrganization(id: string): Promise<{ message: string }> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

