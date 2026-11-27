import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import {
  getOrCreateNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/server/services/notifications-service';
import { updateNotificationPreferencesSchema } from '@/lib/validation';
import { serialize } from '@/lib/serialize';

export async function GET() {
  const logContext: LogContext = { method: 'GET', path: '/api/notifications/preferences' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const preferences = await getOrCreateNotificationPreferences(session.user.id);
    return jsonSuccess(serialize(preferences));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/notifications/preferences', logContext);
    return jsonApiError('INTERNAL', 'Failed to fetch preferences', 500);
  }
}

export async function PUT(req: NextRequest) {
  const logContext: LogContext = { method: 'PUT', path: '/api/notifications/preferences' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const rawBody = await req.json();
    const parsed = updateNotificationPreferencesSchema.safeParse(rawBody);
    if (!parsed.success) {
      return jsonApiError('VALIDATION', 'Invalid notification preferences payload', 400);
    }

    const preferences = await updateNotificationPreferences(session.user.id, parsed.data);
    return jsonSuccess(serialize(preferences));
  } catch (error) {
    logApiError(error as Error, 'PUT', '/api/notifications/preferences', logContext);
    return jsonApiError('INTERNAL', 'Failed to update preferences', 500);
  }
}
