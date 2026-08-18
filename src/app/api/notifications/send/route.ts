import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendNotificationSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import {
  resolveBroadcastRecipientIds,
  sendAdminBroadcast,
} from '@/lib/server/services/notifications-service';

type SessionUser = {
  id: string;
  role?: string;
  organizationId?: string | null;
};

/**
 * POST /api/notifications/send
 * Admin / superadmin broadcast to students and teachers (scoped by organization).
 */
export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/notifications/send' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const user = session.user as SessionUser;
    logContext.userId = user.id;

    const role = user.role;
    if (!isAdmin(role)) {
      return jsonApiError('FORBIDDEN', 'Insufficient permissions', 403);
    }

    const body = await req.json();
    const parsed = sendNotificationSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError('VALIDATION', 'Invalid input', 400);
    }

    const {
      title,
      body: messageBody,
      data,
      category,
      organizationId,
      targetAudience,
      targetCourseId,
    } = parsed.data;

    if (organizationId && !isSuperAdmin(role)) {
      return jsonApiError('FORBIDDEN', 'Only superadmin can target a specific organization', 403);
    }

    if (role === 'admin' && !user.organizationId) {
      return jsonApiError('VALIDATION', 'Admin account is missing organization scope', 400);
    }

    const userIds = await resolveBroadcastRecipientIds(
      isSuperAdmin(role) ? 'superadmin' : 'admin',
      user.organizationId ?? undefined,
      organizationId,
      targetAudience,
      targetCourseId
    );

    if (userIds.length === 0) {
      return jsonSuccess({ message: 'No recipients found', delivered: 0 });
    }

    const { delivered } = await sendAdminBroadcast(userIds, {
      title,
      body: messageBody,
      data,
      category,
      organizationId,
    });

    return jsonSuccess({
      message: 'Notification sent',
      delivered,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/notifications/send', logContext);
    return jsonApiError('INTERNAL', 'Failed to send notification', 500);
  }
}
