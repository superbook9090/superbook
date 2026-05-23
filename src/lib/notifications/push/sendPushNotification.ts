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
    console.warn('FCM Admin not initialized. Skipping push notification.');
    return;
  }

  await dbConnect();

  const objectIds = userIds.map(id => new mongoose.Types.ObjectId(id));

  // 1. Get preferences for these users to filter out those who muted this category or disabled push
  const preferences = await NotificationPreference.find({ userId: { $in: objectIds } });
  
  const disabledUserIds = new Set<string>();
  
  for (const pref of preferences) {
    if (pref.muteAll || pref.disablePush || !pref.categories[payload.category]) {
      disabledUserIds.add(pref.userId.toString());
    }
    // Check if specific course is muted
    if (payload.data?.courseId && pref.mutedCourses.some((id: mongoose.Types.ObjectId) => id.toString() === payload.data!.courseId)) {
      disabledUserIds.add(pref.userId.toString());
    }
  }

  const eligibleUserIds = userIds.filter(id => !disabledUserIds.has(id));

  if (eligibleUserIds.length === 0) return;

  // 2. Get active tokens for eligible users
  const activeTokens = await NotificationToken.find({ 
    userId: { $in: eligibleUserIds.map(id => new mongoose.Types.ObjectId(id)) },
    isActive: true 
  });

  if (activeTokens.length === 0) return;

  const tokens = activeTokens.map(t => t.deviceToken);

  // 3. Prepare the FCM Message
  const title = payload.title[language] || payload.title.en;
  const body = payload.body[language] || payload.body.en;

  const message = {
    notification: {
      title,
      body,
    },
    data: payload.data || {},
    tokens: tokens, // Multicast message
  };

  try {
    const response = await adminMessaging.sendEachForMulticast(message);
    console.log(response.successCount + ' messages were sent successfully');
    
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(tokens[idx]);
          // If token is unregistered, we should mark it as inactive
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
             // In a real app, queue a job to update the DB here
             NotificationToken.updateOne({ deviceToken: tokens[idx] }, { isActive: false }).exec();
          }
        }
      });
      console.log('List of tokens that caused failures: ' + failedTokens);
    }
  } catch (error) {
    console.error('Error sending multicast message:', error);
    throw error;
  }
};
