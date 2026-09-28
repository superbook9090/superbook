import { getAdminMessaging } from './firebase-admin';
import NotificationToken from '@/models/NotificationToken';
import NotificationPreference from '@/models/NotificationPreference';
import dbConnect from '@/lib/db';
import { PushNotificationPayload } from './notificationPayload';
import mongoose from 'mongoose';

export const sendPushNotification = async (
  userIds: string[], 
  payload: PushNotificationPayload,
  language: 'en' | 'hi' = 'en'
) => {
  const adminMessaging = getAdminMessaging();
  if (!adminMessaging) {
    console.warn('[sendPushNotification] FCM Admin not initialized. Skipping push notification.');
    return;
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
    return;
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
    return;
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

  const clickUrl = safeData.webUrl || safeData.url || '/dashboard/student/notifications';

  const messageBase = {
    notification: {
      title,
      body,
    },
    webpush: {
      notification: {
        icon: '/notification-icon.svg',
        badge: '/notification-icon.svg',
      },
      fcmOptions: {
        link: clickUrl,
      },
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
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const errCode = resp.error?.code;
            if (
              errCode === 'messaging/invalid-registration-token' ||
              errCode === 'messaging/registration-token-not-registered'
            ) {
              invalidTokens.push(chunkTokens[idx]);
            }
          }
        });

        if (invalidTokens.length > 0) {
          await NotificationToken.updateMany(
            { deviceToken: { $in: invalidTokens } },
            { $set: { isActive: false } }
          ).catch((e) => console.error('[sendPushNotification] Error deactivating invalid tokens:', e));
        }
      }
    } catch (batchError) {
      console.error('[sendPushNotification] Batch send error:', batchError);
    }
  }

  console.log(`[sendPushNotification] Multicast complete: ${totalSuccess} successful, ${totalFailure} failed.`);
};
