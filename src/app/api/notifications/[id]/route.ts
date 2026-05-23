import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { markUserNotificationRead } from '@/lib/server/services/notifications-service';

type RouteContext = { params: Promise<{ id: string }> };

/** PATCH /api/notifications/[id] — mark a notification as read */
export async function PATCH(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const logContext: LogContext = { method: 'PATCH', path: `/api/notifications/${id}` };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }

    logContext.userId = session.user.id;

    const updated = await markUserNotificationRead(session.user.id, id);
    if (!updated) {
      return jsonApiError('NOT_FOUND', 'Notification not found', 404);
    }

    return jsonSuccess({ read: true });
  } catch (error) {
    logApiError(error as Error, 'PATCH', `/api/notifications/${id}`, logContext);
    return jsonApiError('INTERNAL', 'Failed to update notification', 500);
  }
}
