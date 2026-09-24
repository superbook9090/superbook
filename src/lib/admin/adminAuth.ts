import { Session } from 'next-auth';
import { isAdmin, isSuperAdmin } from '@/lib/roles';

export interface AdminAuthResult {
  authorized: boolean;
  reason?: string;
  role?: string;
  userId?: string;
  organizationId?: string | null;
  isSuperAdmin?: boolean;
}

export function checkAdmin(session: Session | null): AdminAuthResult {
  if (!session?.user) {
    return { authorized: false, reason: 'No session' };
  }

  const userRole = session.user.role;
  const userId = session.user.id;
  const organizationId = session.user.organizationId;

  if (!isAdmin(userRole)) {
    return { authorized: false, reason: 'Insufficient role', userId };
  }

  return {
    authorized: true,
    role: userRole,
    userId,
    organizationId,
    isSuperAdmin: isSuperAdmin(userRole),
  };
}
