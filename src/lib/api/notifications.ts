import { apiJsonData } from '@/lib/api/http';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

const INBOX = '/api/notifications';
const DEVICE = '/api/notifications/device';
const PREFERENCES = '/api/notifications/preferences';
const SEND = '/api/notifications/send';

export type UserNotificationItem = {
  _id: string;
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  category: NotificationCategory;
  data?: Record<string, string>;
  read: boolean;
  createdAt: string;
};

export type UserNotificationsResult = {
  notifications: UserNotificationItem[];
};

export async function fetchUserNotifications(page = 1, limit = 50): Promise<{
  notifications: UserNotificationItem[];
  meta?: { page?: number; limit?: number; total?: number; hasMore?: boolean };
}> {
  const { data, meta } = await apiJsonData<UserNotificationsResult>(
    `${INBOX}?page=${page}&limit=${limit}`,
    { method: 'GET' }
  );
  return { notifications: data.notifications, meta };
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await apiJsonData<{ read: boolean }>(`${INBOX}/${notificationId}`, { method: 'PATCH' });
}

export type RegisterDeviceInput = {
  deviceToken: string;
  platform: 'android' | 'ios' | 'web';
};

export type BroadcastTargetAudience = 'all' | 'students' | 'teachers' | 'course_enrolled';

export type SendNotificationInput = {
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  data?: Record<string, string>;
  category: NotificationCategory;
  organizationId?: string;
  targetAudience?: BroadcastTargetAudience;
  targetCourseId?: string;
};

export type SendNotificationResult = {
  message: string;
  delivered: number;
};

export type NotificationCategoryPreferences = {
  lessons: boolean;
  quizzes: boolean;
  assignments: boolean;
  liveClasses: boolean;
  announcements: boolean;
  system: boolean;
};

export type NotificationPreferences = {
  muteAll: boolean;
  disablePush: boolean;
  mutedCourses: string[];
  categories: NotificationCategoryPreferences;
};

export async function registerDeviceToken(input: RegisterDeviceInput): Promise<{ success: boolean }> {
  const { data } = await apiJsonData<{ success: boolean }>(DEVICE, { method: 'POST', body: input });
  return data;
}

export async function unregisterDeviceToken(deviceToken: string): Promise<{ success: boolean }> {
  const { data } = await apiJsonData<{ success: boolean }>(DEVICE, {
    method: 'DELETE',
    body: { deviceToken },
  });
  return data;
}

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const { data } = await apiJsonData<NotificationPreferences>(PREFERENCES, { method: 'GET' });
  return data;
}

export async function updateNotificationPreferences(
  updates: Partial<Pick<NotificationPreferences, 'muteAll' | 'disablePush' | 'categories'>>
): Promise<NotificationPreferences> {
  const { data } = await apiJsonData<NotificationPreferences>(PREFERENCES, { method: 'PUT', body: updates });
  return data;
}

export async function sendAdminNotification(input: SendNotificationInput): Promise<SendNotificationResult> {
  const { data } = await apiJsonData<SendNotificationResult>(SEND, { method: 'POST', body: input });
  return data;
}

export interface AdminBroadcastLogItem {
  id: string;
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  category: NotificationCategory;
  data?: Record<string, string>;
  createdAt: string;
  recipientsCount: number;
}

export interface AdminNotificationStatsData {
  activeDevicesCount: number;
  platformBreakdown: { android: number; ios: number; web: number };
  totalBroadcastsDelivered: number;
  categoryBreakdown: Record<string, number>;
  recentBroadcasts: AdminBroadcastLogItem[];
  organizations: Array<{ id: string; name: string; inviteCode?: string }>;
  courses: Array<{ id: string; title: string; enrolledCount?: number; organizationId?: string }>;
}

export async function fetchAdminNotificationCenterData(): Promise<AdminNotificationStatsData> {
  const { data } = await apiJsonData<AdminNotificationStatsData>('/api/admin/notifications', {
    method: 'GET',
  });
  return data;
}

