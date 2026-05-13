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
