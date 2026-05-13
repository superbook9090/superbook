import { apiJson } from '@/lib/api/http';

export type OrganizationsListPayload = { organizations: unknown[] };

export function listOrganizations(): Promise<OrganizationsListPayload> {
  return apiJson('/api/organizations', { method: 'GET' });
}

export function createOrganization(body: {
  name: string;
  description: string;
  isActive: boolean;
}): Promise<unknown> {
  return apiJson('/api/organizations', { method: 'POST', body });
}

export function updateOrganization(
  id: string,
  body: { name: string; description: string; isActive: boolean }
): Promise<unknown> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'PATCH', body });
}

export function deleteOrganization(id: string): Promise<unknown> {
  return apiJson(`/api/organizations/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
