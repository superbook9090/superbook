import type { Session } from 'next-auth';
import { jsonError } from '@/lib/http';

/** Any signed-in user can browse/list/view files they are allowed to see (org + public). */
export function requireAuthenticatedSession(session: Session | null) {
  if (!session?.user) {
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' });
  }
  return null;
}

/** Create folder, upload, rename, delete — superadmin only. */
export function requireFilesSuperadmin(session: Session | null) {
  if (!session?.user) {
    return jsonError('Unauthorized', 401, { code: 'UNAUTHORIZED' });
  }
  if (session.user.role !== 'superadmin') {
    return jsonError('Forbidden', 403, { code: 'FORBIDDEN' });
  }
  return null;
}
