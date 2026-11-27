import dbConnect from '@/lib/db';
import '@/models';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import NotificationToken from '@/models/NotificationToken';
import NotificationPreference from '@/models/NotificationPreference';
import UserNotification from '@/models/UserNotification';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
import type { NotificationCategory, PushNotificationPayload } from '@/lib/notifications/push/notificationPayload';
import { updateNotificationPreferencesSchema } from '@/lib/validation';
import mongoose from 'mongoose';

export type BroadcastTargetAudience = 'all' | 'students' | 'teachers' | 'course_enrolled';

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
  if (
    !mongoose.Types.ObjectId.isValid(userId) ||
    !mongoose.Types.ObjectId.isValid(notificationId)
  ) {
    return false;
  }

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

  await Promise.all([
    NotificationToken.findOneAndUpdate(
      { deviceToken },
      { userId, platform, isActive: true, updatedAt: new Date() },
      { upsert: true, new: true }
    ),
    User.findByIdAndUpdate(userId, {
      $set: { lastActiveAt: new Date(), lastPlatform: platform },
    }),
  ]);
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
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('Invalid userId');
  }

  const parsed = updateNotificationPreferencesSchema.parse(updates);
  const safeSet: Record<string, unknown> = {};

  if (parsed.muteAll !== undefined) {
    safeSet.muteAll = parsed.muteAll;
  }
  if (parsed.disablePush !== undefined) {
    safeSet.disablePush = parsed.disablePush;
  }
  if (parsed.mutedCourses !== undefined) {
    safeSet.mutedCourses = parsed.mutedCourses.map((id) => new mongoose.Types.ObjectId(id));
  }
  if (parsed.categories !== undefined) {
    for (const [key, val] of Object.entries(parsed.categories)) {
      if (val !== undefined) {
        safeSet[`categories.${key}`] = val;
      }
    }
  }

  await dbConnect();

  if (Object.keys(safeSet).length === 0) {
    return getOrCreateNotificationPreferences(userId);
  }

  return NotificationPreference.findOneAndUpdate(
    { userId: new mongoose.Types.ObjectId(userId) },
    { $set: safeSet },
    { new: true, upsert: true }
  ).lean();
}

/** Resolve user ids for admin broadcast (students, teachers, course enrolled, or all). */
export async function resolveBroadcastRecipientIds(
  senderRole: 'admin' | 'superadmin',
  senderOrgId: string | null | undefined,
  targetOrgId?: string,
  targetAudience: BroadcastTargetAudience = 'all',
  targetCourseId?: string
): Promise<string[]> {
  await dbConnect();

  let scopedOrgObjectId: mongoose.Types.ObjectId | null = null;
  if (senderRole === 'admin') {
    if (!senderOrgId || !mongoose.Types.ObjectId.isValid(senderOrgId)) return [];
    scopedOrgObjectId = new mongoose.Types.ObjectId(senderOrgId);
  } else if (targetOrgId) {
    if (!mongoose.Types.ObjectId.isValid(targetOrgId)) return [];
    scopedOrgObjectId = new mongoose.Types.ObjectId(targetOrgId);
  }

  // 1. If targeting students enrolled in a specific course
  if (targetAudience === 'course_enrolled') {
    if (!targetCourseId || !mongoose.Types.ObjectId.isValid(targetCourseId)) return [];
    const courseObjectId = new mongoose.Types.ObjectId(targetCourseId);

    // For org admins, verify the target course belongs to their organization
    if (senderRole === 'admin') {
      const courseInOrg = await Course.exists({
        _id: courseObjectId,
        organizationId: scopedOrgObjectId,
      });
      if (!courseInOrg) return [];
    }

    const enrollments = await Enrollment.find({
      course: courseObjectId,
      status: { $in: ['active', 'completed'] },
    })
      .select('student')
      .lean();

    const studentIds = enrollments.map((e) => e.student);
    if (studentIds.length === 0) return [];

    const userQuery: Record<string, unknown> = {
      _id: { $in: studentIds },
    };

    if (scopedOrgObjectId) {
      userQuery.organizationId = scopedOrgObjectId;
    }

    const users = await User.find(userQuery).select('_id').lean();
    return users.map((u) => String(u._id));
  }

  // 2. Audience role filter
  let roleFilter: string[] = ['student', 'teacher'];
  if (targetAudience === 'students') {
    roleFilter = ['student'];
  } else if (targetAudience === 'teachers') {
    roleFilter = ['teacher'];
  }

  const query: Record<string, unknown> = {
    role: { $in: roleFilter },
  };

  if (scopedOrgObjectId) {
    query.organizationId = scopedOrgObjectId;
  }

  const users = await User.find(query).select('_id').lean();
  return users.map((u) => String(u._id));
}

export async function sendAdminBroadcast(
  userIds: string[],
  payload: SendBroadcastInput
): Promise<{ delivered: number; pushSent: number; pushFailed: number; activeTokens: number }> {
  if (userIds.length === 0) {
    return { delivered: 0, pushSent: 0, pushFailed: 0, activeTokens: 0 };
  }

  const pushPayload: PushNotificationPayload = {
    title: payload.title,
    body: payload.body,
    data: payload.data,
    category: payload.category,
  };

  const [inboxResult, pushResult] = await Promise.allSettled([
    createUserNotifications(userIds, payload),
    sendPushNotification(userIds, pushPayload),
  ]);

  if (inboxResult.status === 'rejected') {
    console.error('[sendAdminBroadcast] Failed to insert in-app notifications:', inboxResult.reason);
  }
  if (pushResult.status === 'rejected') {
    console.error('[sendAdminBroadcast] Failed to send push notifications:', pushResult.reason);
  }

  const summary =
    pushResult.status === 'fulfilled'
      ? pushResult.value
      : { sent: 0, failed: 0, tokenCount: 0 };

  return {
    delivered: userIds.length,
    pushSent: summary.sent,
    pushFailed: summary.failed,
    activeTokens: summary.tokenCount,
  };
}
