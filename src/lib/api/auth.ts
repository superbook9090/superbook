import { apiJson } from '@/lib/api/http';

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  inviteCode?: string;
};

export function registerAccount(body: RegisterInput): Promise<unknown> {
  return apiJson('/api/auth/register', { method: 'POST', body });
}

export function requestForgotPassword(email: string): Promise<{ message: string }> {
  return apiJson('/api/auth/forgot-password', { method: 'POST', body: { email } });
}

export function resetPasswordWithToken(body: {
  token: string;
  password: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return apiJson('/api/auth/reset-password', { method: 'POST', body });
}

export function changePassword(body: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<{ message: string }> {
  return apiJson('/api/auth/change-password', { method: 'POST', body });
}

export type AccountInfo = {
  provider: string;
  hasPassword: boolean;
  canChangePassword: boolean;
};

export function fetchAccountInfo(): Promise<AccountInfo> {
  return apiJson('/api/auth/account', { method: 'GET' });
}

/** NextAuth session JSON; does not throw on HTTP errors (matches prior store behavior). */
export async function fetchAuthSessionJson(): Promise<Record<string, unknown>> {
  const res = await fetch('/api/auth/session', {
    cache: 'no-store',
    headers: { 'Cache-Control': 'no-cache' },
  });
  try {
    const data = await res.json();
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** NextAuth CSRF sign-out POST; response is not consumed as JSON. */
export async function authSignOut(): Promise<void> {
  await fetch('/api/auth/signout', { method: 'POST', cache: 'no-store' });
}
