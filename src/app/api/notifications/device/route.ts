import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { registerDeviceSchema, unregisterDeviceSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { upsertDeviceToken, deactivateDeviceToken } from '@/lib/server/services/notifications-service';

export async function POST(req: NextRequest) {
  const logContext: LogContext = { method: 'POST', path: '/api/notifications/device' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const parsed = registerDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError('VALIDATION', 'Invalid input', 400);
    }

    const { deviceToken, platform } = parsed.data;
    await upsertDeviceToken(session.user.id, deviceToken, platform);

    return jsonSuccess({ success: true }, { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/notifications/device', logContext);
    return jsonApiError('INTERNAL', 'Failed to register device', 500);
  }
}

export async function DELETE(req: NextRequest) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/notifications/device' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const body = await req.json();
    const parsed = unregisterDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return jsonApiError('VALIDATION', 'Invalid input', 400);
    }

    await deactivateDeviceToken(session.user.id, parsed.data.deviceToken);
    return jsonSuccess({ success: true });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/notifications/device', logContext);
    return jsonApiError('INTERNAL', 'Failed to unregister device', 500);
  }
}
