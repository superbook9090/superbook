import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';

/**
 * POST /api/notifications/test
 * Sends a test browser/device push notification to the currently signed-in user only.
 */
export async function POST() {
  const logContext: LogContext = { method: 'POST', path: '/api/notifications/test' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }
    logContext.userId = session.user.id;

    const result = await sendPushNotification([session.user.id], {
      title: {
        en: 'Browser Notifications Working',
        hi: 'ब्राउज़र नोटिफिकेशन काम कर रहा है',
      },
      body: {
        en: 'Push notifications are properly configured and active on this device.',
        hi: 'इस डिवाइस पर पुश नोटिफिकेशन सही ढंग से सक्रिय हैं।',
      },
      category: 'system',
      data: {
        webUrl: '/dashboard',
      },
    });

    if (result.tokenCount === 0) {
      return jsonApiError(
        'VALIDATION',
        'No active browser/device push token found for your account. Please enable notifications first.',
        400
      );
    }

    if (result.sent === 0) {
      return jsonApiError(
        'INTERNAL',
        'Push token found, but Firebase delivery failed. Please re-enable notifications or check Firebase config.',
        500
      );
    }

    return jsonSuccess({
      message: `Test push sent to ${result.sent} active device(s).`,
      ...result,
    });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/notifications/test', logContext);
    return jsonApiError('INTERNAL', 'Failed to send test notification', 500);
  }
}
