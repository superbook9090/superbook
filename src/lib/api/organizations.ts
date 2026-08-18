import { apiJson } from '@/lib/api/http';

export interface OrganizationItem {
  _id: string;
  name: string;
  code: string;
  inviteCode: string;
  description?: string;
  isActive: boolean;
  userCount: number;
  courseCount: number;
  blogCount: number;
  quizCount: number;
  createdAt: string;
  updatedAt?: string;
}

export type OrganizationsListPayload = { organizations: OrganizationItem[] };

export function listOrganizations(options?: { includeInactive?: boolean }): Promise<OrganizationsListPayload> {
  const includeInactive = options?.includeInactive ?? true;
  const query = includeInactive ? '?includeInactive=true' : '';
  return apiJson(`/api/organizations${query}`, { method: 'GET' });
}

export function createOrganization(body: {
  name: string;
  description?: string;
  isActive?: boolean;
}): Promise<OrganizationItem> {
  return apiJson('/api/organizations', { method: 'POST', body });
}

export function updateOrganization(
  id: string,
  body: { name?: string; description?: string; isActive?: boolean }
): Promise<OrganizationItem> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export function deleteOrganization(id: string): Promise<{ message: string }> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

