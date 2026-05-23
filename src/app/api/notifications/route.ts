import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { listMeta, parseOffsetPagination } from '@/lib/server/pagination';
import { listUserNotifications } from '@/lib/server/services/notifications-service';

const privateCache = {
  'Cache-Control': 'private, no-store',
} as const;

/** GET /api/notifications — paginated inbox for the current user */
export async function GET(req: NextRequest) {
  const logContext: LogContext = { method: 'GET', path: '/api/notifications' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401, { headers: privateCache });
    }

    logContext.userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const { page, limit, skip } = parseOffsetPagination(searchParams);

    const { items, total } = await listUserNotifications(session.user.id, { page, limit, skip });

    return jsonSuccess(
      { notifications: items },
      {
        meta: listMeta(page, limit, total, items.length),
        headers: privateCache,
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/notifications', logContext);
    return jsonApiError('INTERNAL', 'Failed to fetch notifications', 500);
  }
}
