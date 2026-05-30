import dbConnect from '@/lib/db';
import '@/models';
import User from '@/models/User';
import NotificationToken from '@/models/NotificationToken';
import NotificationPreference from '@/models/NotificationPreference';
import UserNotification from '@/models/UserNotification';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
import type { NotificationCategory, PushNotificationPayload } from '@/lib/notifications/push/notificationPayload';
import mongoose from 'mongoose';

export type SendBroadcastInput = {
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  data?: Record<string, string>;
  category: NotificationCategory;
  /** Superadmin only: limit broadcast to one org. */
  organizationId?: string;
};

export type UserNotificationRow = {
  _id: string;
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  category: NotificationCategory;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
};

export async function createUserNotifications(userIds: string[], payload: SendBroadcastInput) {
  if (userIds.length === 0) return;

  await dbConnect();

  await UserNotification.insertMany(
    userIds.map((userId) => ({
      userId: new mongoose.Types.ObjectId(userId),
      title: payload.title,
      body: payload.body,
      category: payload.category,
      data: payload.data,
      read: false,
    }))
  );
}

export async function listUserNotifications(
  userId: string,
  options: { page: number; limit: number; skip: number }
): Promise<{ items: UserNotificationRow[]; total: number }> {
  await dbConnect();

  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  const [docs, total] = await Promise.all([
    UserNotification.find(filter)
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .lean(),
    UserNotification.countDocuments(filter),
  ]);

  const items: UserNotificationRow[] = docs.map((doc) => ({
    _id: String(doc._id),
    title: doc.title,
    body: doc.body,
    category: doc.category,
    data: doc.data as Record<string, string> | undefined,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  }));

  return { items, total };
}

export async function markUserNotificationRead(userId: string, notificationId: string): Promise<boolean> {
  await dbConnect();

  const result = await UserNotification.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(notificationId),
      userId: new mongoose.Types.ObjectId(userId),
    },
    { $set: { read: true } }
  );

  return Boolean(result);
}

export async function upsertDeviceToken(userId: string, deviceToken: string, platform: 'android' | 'ios' | 'web') {
  await dbConnect();

  type DeviceTokenExisting = {
    userId: mongoose.Types.ObjectId;
    platform: 'android' | 'ios' | 'web';
    isActive: boolean;
    updatedAt: Date;
  };

  const existing = await NotificationToken.findOne({ deviceToken })
    .select('userId platform isActive updatedAt')
    .lean<DeviceTokenExisting>();

  if (existing) {
    const unchanged =
      existing.userId.toString() === userId &&
      existing.platform === platform &&
      existing.isActive;

    if (unchanged) {
      const touchIntervalMs = 24 * 60 * 60 * 1000;
      const stale = Date.now() - new Date(existing.updatedAt).getTime() > touchIntervalMs;
      if (stale) {
        await NotificationToken.updateOne({ deviceToken }, { $set: { updatedAt: new Date() } });
      }
      return;
    }
  }

  await NotificationToken.findOneAndUpdate(
    { deviceToken },
    { userId, platform, isActive: true, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

export async function deactivateDeviceToken(userId: string, deviceToken: string) {
  await dbConnect();
  await NotificationToken.findOneAndUpdate({ deviceToken, userId }, { isActive: false });
}

export async function getOrCreateNotificationPreferences(userId: string) {
  await dbConnect();
  let preferences = await NotificationPreference.findOne({ userId });
  if (!preferences) {
    preferences = await NotificationPreference.create({ userId });
  }
  return preferences;
}

export async function updateNotificationPreferences(userId: string, updates: Record<string, unknown>) {
  await dbConnect();
  return NotificationPreference.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  ).lean();
}

/** Resolve user ids for admin broadcast (students + teachers in scope). */
export async function resolveBroadcastRecipientIds(
  senderRole: 'admin' | 'superadmin',
  senderOrgId: string | null | undefined,
  targetOrgId?: string
): Promise<string[]> {
  await dbConnect();

  const query: Record<string, unknown> = {
    role: { $in: ['student', 'teacher'] },
  };

  if (senderRole === 'admin') {
    if (!senderOrgId) return [];
    query.organizationId = new mongoose.Types.ObjectId(senderOrgId);
  } else if (targetOrgId) {
    query.organizationId = new mongoose.Types.ObjectId(targetOrgId);
  }

  const users = await User.find(query).select('_id').lean();
  return users.map((u) => String(u._id));
}

export async function sendAdminBroadcast(
  userIds: string[],
  payload: SendBroadcastInput
): Promise<{ delivered: number }> {
  if (userIds.length === 0) {
    return { delivered: 0 };
  }

  const pushPayload: PushNotificationPayload = {
    title: payload.title,
    body: payload.body,
    data: payload.data,
    category: payload.category,
  };

  await createUserNotifications(userIds, payload);
  await sendPushNotification(userIds, pushPayload);
  return { delivered: userIds.length };
}
