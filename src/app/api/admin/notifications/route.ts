import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { isAdmin, isSuperAdmin } from '@/lib/roles';
import { logApiError, type LogContext } from '@/lib/logger';
import { jsonSuccess, jsonApiError } from '@/lib/server/api-response';
import UserNotification from '@/models/UserNotification';
import NotificationToken from '@/models/NotificationToken';
import Organization from '@/models/Organization';
import Course from '@/models/Course';

export interface AdminBroadcastLogItem {
  id: string;
  title: { en: string; hi?: string };
  body: { en: string; hi?: string };
  category: string;
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

export async function GET() {
  const logContext: LogContext = { method: 'GET', path: '/api/admin/notifications' };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return jsonApiError('UNAUTHORIZED', 'Unauthorized', 401);
    }

    const role = session.user.role;
    if (!isAdmin(role)) {
      return jsonApiError('FORBIDDEN', 'Forbidden: Admin access required', 403);
    }

    logContext.userId = session.user.id;
    await dbConnect();

    const isSuper = isSuperAdmin(role);

    // 1. Devices, platforms, and content
    const courseQuery: Record<string, unknown> = { isPublished: true };
    if (!isSuper && session.user.organizationId) {
      courseQuery.organizationId = session.user.organizationId;
    }

    const [
      activeTokensCount,
      platformAgg,
      totalNotificationsCount,
      categoryAgg,
      recentGrouped,
      orgDocs,
      courseDocs,
    ] = await Promise.all([
      NotificationToken.countDocuments({ isActive: true }),
      NotificationToken.aggregate<{ _id: string; count: number }>([
        { $match: { isActive: true } },
        { $group: { _id: '$platform', count: { $sum: 1 } } },
      ]),
      UserNotification.countDocuments(),
      UserNotification.aggregate<{ _id: string; count: number }>([
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      UserNotification.aggregate<{
        _id: { titleEn: string; category: string; dateBucket: string };
        title: { en: string; hi?: string };
        body: { en: string; hi?: string };
        category: string;
        data?: Record<string, string>;
        createdAt: Date;
        recipientsCount: number;
      }>([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: {
              titleEn: '$title.en',
              category: '$category',
              dateBucket: {
                $dateToString: { format: '%Y-%m-%d %H:%M', date: '$createdAt' },
              },
            },
            title: { $first: '$title' },
            body: { $first: '$body' },
            category: { $first: '$category' },
            data: { $first: '$data' },
            createdAt: { $first: '$createdAt' },
            recipientsCount: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
      ]),
      isSuper
        ? Organization.find({ isActive: true }).select('_id name inviteCode').sort({ name: 1 }).lean()
        : Promise.resolve([]),
      Course.find(courseQuery).select('_id title enrolledCount organizationId').sort({ title: 1 }).lean(),
    ]);

    const platformBreakdown = {
      android: 0,
      ios: 0,
      web: 0,
    };
    platformAgg.forEach((item) => {
      if (item._id === 'android' || item._id === 'ios' || item._id === 'web') {
        platformBreakdown[item._id] = item.count;
      }
    });

    const categoryBreakdown: Record<string, number> = {};
    categoryAgg.forEach((item) => {
      if (item._id) {
        categoryBreakdown[item._id] = item.count;
      }
    });

    const recentBroadcasts: AdminBroadcastLogItem[] = recentGrouped.map((item, idx) => ({
      id: `${item._id.dateBucket}-${idx}`,
      title: item.title,
      body: item.body,
      category: item.category,
      data: item.data,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
      recipientsCount: item.recipientsCount || 1,
    }));

    const organizations = (orgDocs as Array<{ _id: unknown; name: string; inviteCode?: string }>).map((org) => ({
      id: String(org._id),
      name: org.name,
      inviteCode: org.inviteCode,
    }));

    const courses = (
      courseDocs as Array<{ _id: unknown; title: string; enrolledCount?: number; organizationId?: unknown }>
    ).map((c) => ({
      id: String(c._id),
      title: c.title,
      enrolledCount: c.enrolledCount,
      organizationId: c.organizationId ? String(c.organizationId) : undefined,
    }));

    const responseData: AdminNotificationStatsData = {
      activeDevicesCount: activeTokensCount,
      platformBreakdown,
      totalBroadcastsDelivered: totalNotificationsCount,
      categoryBreakdown,
      recentBroadcasts,
      organizations,
      courses,
    };

    return jsonSuccess(responseData, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/notifications', logContext);
    return jsonApiError('INTERNAL', 'Failed to load admin notifications data', 500);
  }
}
