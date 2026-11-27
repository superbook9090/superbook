import { getAdminMessaging } from './firebase-admin';
import NotificationToken from '@/models/NotificationToken';
import NotificationPreference from '@/models/NotificationPreference';
import dbConnect from '@/lib/db';
import { PushNotificationPayload } from './notificationPayload';
import mongoose from 'mongoose';

export interface PushDeliverySummary {
  sent: number;
  failed: number;
  tokenCount: number;
}

const DEFAULT_NOTIFICATION_PATH = '/dashboard/student/notifications';
const SAFE_SEGMENT_RE = /^[a-zA-Z0-9_-]+$/;

function getConfiguredSiteOrigin(): string | null {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || '').trim();
  if (!raw) return null;
  try {
    return new URL(raw).origin;
  } catch {
    return null;
  }
}

function isSafeRelativePath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//') && !value.includes('\\') && !/[\r\n]/.test(value);
}

function resolveWebPathFromRawUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return DEFAULT_NOTIFICATION_PATH;
  const trimmed = rawUrl.trim();
  if (!trimmed) return DEFAULT_NOTIFICATION_PATH;

  if (isSafeRelativePath(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const allowedOrigin = getConfiguredSiteOrigin();
    if (!allowedOrigin) return DEFAULT_NOTIFICATION_PATH;
    try {
      const parsed = new URL(trimmed);
      if (parsed.origin !== allowedOrigin) {
        return DEFAULT_NOTIFICATION_PATH;
      }
      const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return isSafeRelativePath(relative) ? relative : DEFAULT_NOTIFICATION_PATH;
    } catch {
      return DEFAULT_NOTIFICATION_PATH;
    }
  }

  if (trimmed.startsWith('quizdo://')) {
    const segments = trimmed.replace('quizdo://', '').split('/').filter(Boolean);
    const [head, id, sub, subId] = segments;
    const safeId = id && SAFE_SEGMENT_RE.test(id) ? id : undefined;
    const safeSubId = subId && SAFE_SEGMENT_RE.test(subId) ? subId : undefined;
    switch (head) {
      case 'course':
        if (!safeId) return '/dashboard/student/courses';
        if (sub === 'lesson' && safeSubId) return `/dashboard/student/courses/${safeId}/lessons/${safeSubId}`;
        return `/dashboard/student/courses/${safeId}`;
      case 'quiz':
        return safeId ? `/dashboard/student/quizzes/${safeId}` : '/dashboard/student/quizzes';
      case 'contest':
        if (!safeId) return '/dashboard/student/contests';
        if (sub === 'result') return `/dashboard/student/contests/${safeId}/result`;
        return `/dashboard/student/contests/${safeId}/take`;
      case 'certificate':
        return safeId ? `/dashboard/student/certificates/${safeId}` : '/dashboard/student/certificates';
      default:
        return DEFAULT_NOTIFICATION_PATH;
    }
  }

  return DEFAULT_NOTIFICATION_PATH;
}

function resolveHttpsClickLink(webPath: string): string | undefined {
  if (!isSafeRelativePath(webPath)) return undefined;
  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    ''
  ).replace(/\/+$/, '');
  if (!siteOrigin.startsWith('https://')) return undefined;
  return `${siteOrigin}${webPath}`;
}

export const sendPushNotification = async (
  userIds: string[], 
  payload: PushNotificationPayload,
  language: 'en' | 'hi' = 'en'
): Promise<PushDeliverySummary> => {
  const adminMessaging = getAdminMessaging();
  if (!adminMessaging) {
    console.warn('[sendPushNotification] FCM Admin not initialized. Skipping push notification.');
    return { sent: 0, failed: 0, tokenCount: 0 };
  }

  await dbConnect();

  const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

  // 1. Get preferences for these users to filter out those who muted this category or disabled push
  const preferences = await NotificationPreference.find({ userId: { $in: objectIds } }).lean();
  
  const disabledUserIds = new Set<string>();
  
  for (const pref of preferences) {
    const isCategoryDisabled = Boolean(pref.categories && pref.categories[payload.category] === false);
    if (pref.muteAll || pref.disablePush || isCategoryDisabled) {
      disabledUserIds.add(pref.userId.toString());
    }
    // Check if specific course is muted
    if (payload.data?.courseId && pref.mutedCourses?.some((id: mongoose.Types.ObjectId) => id.toString() === payload.data!.courseId)) {
      disabledUserIds.add(pref.userId.toString());
    }
  }

  const eligibleUserIds = userIds.filter(id => !disabledUserIds.has(id));

  if (eligibleUserIds.length === 0) {
    console.log('[sendPushNotification] All target users disabled push or muted this category.');
    return { sent: 0, failed: 0, tokenCount: 0 };
  }

  // 2. Get active tokens for eligible users
  const activeTokens = await NotificationToken.find({ 
    userId: { $in: eligibleUserIds.map(id => new mongoose.Types.ObjectId(id)) },
    isActive: true 
  }).lean();

  const rawTokens = activeTokens.map(t => t.deviceToken).filter(Boolean);
  const tokens = Array.from(new Set(rawTokens));

  console.log(
    `[sendPushNotification] Targeting ${userIds.length} users: ${eligibleUserIds.length} eligible, ${tokens.length} active tokens.`
  );

  if (tokens.length === 0) {
    console.log('[sendPushNotification] No active device tokens found. Skipping FCM send.');
    return { sent: 0, failed: 0, tokenCount: 0 };
  }

  // 3. Prepare the FCM Message
  const title = payload.title[language] || payload.title.en;
  const body = payload.body[language] || payload.body.en;

  // FCM requires all data values to be strings
  const safeData: Record<string, string> = {};
  if (payload.data) {
    for (const [key, val] of Object.entries(payload.data)) {
      safeData[key] = String(val);
    }
  }

  const webPath = resolveWebPathFromRawUrl(safeData.webUrl || safeData.actionUrl || safeData.url);
  safeData.webUrl = webPath;
  if (safeData.url && !safeData.url.startsWith('quizdo://')) {
    safeData.url = resolveWebPathFromRawUrl(safeData.url);
  }
  if (safeData.actionUrl) {
    safeData.actionUrl = resolveWebPathFromRawUrl(safeData.actionUrl);
  }
  safeData.title = title;
  safeData.body = body;

  const httpsLink = resolveHttpsClickLink(webPath);
  const siteOrigin = (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    ''
  ).replace(/\/+$/, '');
  const webIcon = siteOrigin.startsWith('https://') ? `${siteOrigin}/favicon.png` : '/favicon.png';

  const messageBase = {
    notification: {
      title,
      body,
    },
    webpush: {
      headers: {
        Urgency: 'high',
        TTL: '86400',
      },
      notification: {
        title,
        body,
        icon: webIcon,
        badge: webIcon,
      },
      ...(httpsLink ? { fcmOptions: { link: httpsLink } } : {}),
    },
    android: {
      priority: 'high' as const,
      notification: {
        icon: 'ic_notification',
        color: '#2563EB',
        channelId: 'quizdo_general',
        defaultSound: true,
      },
    },
    data: safeData,
  };

  const CHUNK_SIZE = 500; // FCM multicast maximum limit
  let totalSuccess = 0;
  let totalFailure = 0;

  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunkTokens = tokens.slice(i, i + CHUNK_SIZE);
    try {
      const response = await adminMessaging.sendEachForMulticast({
        ...messageBase,
        tokens: chunkTokens,
      });

      totalSuccess += response.successCount;
      totalFailure += response.failureCount;

      if (response.failureCount > 0) {
        const invalidTokens: string[] = [];
        const errorCounts: Record<string, number> = {};
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code || 'unknown';
            errorCounts[errCode] = (errorCounts[errCode] || 0) + 1;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(chunkTokens[idx]);
            }
          }
        });
        console.warn('[sendPushNotification] Token delivery failures:', errorCounts);

        if (invalidTokens.length > 0) {
          await NotificationToken.updateMany(
            { deviceToken: { $in: invalidTokens } },
            { $set: { isActive: false } }
          ).catch((e) => console.error('[sendPushNotification] Error deactivating invalid tokens:', e));
        }
      }
    } catch (batchError) {
      totalFailure += chunkTokens.length;
      console.error('[sendPushNotification] Batch send error:', batchError);
    }
  }

  console.log(`[sendPushNotification] Multicast complete: ${totalSuccess} successful, ${totalFailure} failed.`);
  return { sent: totalSuccess, failed: totalFailure, tokenCount: tokens.length };
};
