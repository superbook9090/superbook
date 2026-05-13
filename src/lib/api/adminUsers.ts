import { apiJson } from '@/lib/api/http';

export type AdminUsersListResult = {
  users: unknown[];
  pagination?: { total: number; totalPages: number };
};

export function listAdminUsers(params: {
  search?: string;
  role?: string;
  page: number;
}): Promise<AdminUsersListResult> {
  const sp = new URLSearchParams();
  if (params.search) sp.set('search', params.search);
  if (params.role) sp.set('role', params.role);
  sp.set('page', String(params.page));
  return apiJson(`/api/admin/users?${sp}`, { method: 'GET' });
}

export function patchAdminUser(body: { userId: string | null; updates: unknown }): Promise<unknown> {
  return apiJson('/api/admin/users', { method: 'PATCH', body });
}

export function deleteAdminUser(userId: string): Promise<unknown> {
  return apiJson(`/api/admin/users?id=${encodeURIComponent(userId)}`, { method: 'DELETE' });
}

export function patchAdminUserOrganization(
  userId: string,
  body: { organizationId: string | null }
): Promise<unknown> {
  return apiJson(`/api/admin/users/${encodeURIComponent(userId)}/organization`, { method: 'PATCH', body });
}
