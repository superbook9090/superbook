import mongoose from 'mongoose';
import User from '@/models/User';
import { escapeRegex, sanitizeSearchQuery, validateObjectId } from '@/lib/sanitize';
import { AdminAuthResult } from './adminAuth';
import { attachUserActivityStats } from './userActivityCounts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFilter = Record<string, any>;

export interface AdminUserQueryParams {
  role?: string | null;
  search?: string | null;
  platform?: string | null;
  activity?: string | null;
  status?: string | null;
  organizationIdParam?: string | null;
}

export function buildAdminUsersQuery(
  authResult: AdminAuthResult,
  params: AdminUserQueryParams
): { query: QueryFilter; orgFilter: QueryFilter } {
  const { role, search, platform, activity, status, organizationIdParam } = params;

  let orgFilter: QueryFilter = {};
  if (!authResult.isSuperAdmin) {
    if (!authResult.organizationId || !validateObjectId(authResult.organizationId)) {
      orgFilter = { organizationId: null };
    } else {
      orgFilter = { organizationId: new mongoose.Types.ObjectId(authResult.organizationId) };
    }
  } else if (organizationIdParam && organizationIdParam !== 'all') {
    if (organizationIdParam === 'null' || organizationIdParam === 'none') {
      orgFilter = { organizationId: null };
    } else if (validateObjectId(organizationIdParam)) {
      orgFilter = { organizationId: new mongoose.Types.ObjectId(organizationIdParam) };
    }
  }

  const andClauses: QueryFilter[] = [];

  if (Object.keys(orgFilter).length > 0) {
    andClauses.push(orgFilter);
  }

  if (role && role !== 'all') {
    andClauses.push({ role });
  }

  if (status && status !== 'all') {
    if (status === 'suspended') {
      andClauses.push({ isSuspended: true });
    } else if (status === 'active') {
      andClauses.push({ isSuspended: { $ne: true } });
    }
  }

  if (platform && platform !== 'all') {
    if (platform === 'app') {
      andClauses.push({ lastPlatform: { $in: ['android', 'ios'] } });
    } else if (platform === 'web') {
      andClauses.push({
        $or: [
          { lastPlatform: 'web' },
          { lastPlatform: { $exists: false } },
          { lastPlatform: null },
        ],
      });
    } else if (['android', 'ios'].includes(platform)) {
      andClauses.push({ lastPlatform: platform });
    }
  }

  if (activity && activity !== 'all') {
    const now = Date.now();
    if (activity === 'today') {
      andClauses.push({ lastActiveAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } });
    } else if (activity === 'week') {
      andClauses.push({ lastActiveAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } });
    } else if (activity === 'month') {
      andClauses.push({ lastActiveAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } });
    } else if (activity === 'inactive') {
      const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      andClauses.push({
        $or: [
          { lastActiveAt: { $lt: thirtyDaysAgo } },
          { lastActiveAt: { $exists: false } },
          { lastActiveAt: null },
        ],
      });
    }
  }

  if (search) {
    const sanitizedSearch = sanitizeSearchQuery(search);
    const tokens = sanitizedSearch.split(/\s+/).filter(Boolean).slice(0, 6);
    if (tokens.length > 0) {
      for (const token of tokens) {
        const escaped = escapeRegex(token);
        andClauses.push({
          $or: [
            { name: { $regex: escaped, $options: 'i' } },
            { email: { $regex: escaped, $options: 'i' } },
            { phone: { $regex: escaped, $options: 'i' } },
          ],
        });
      }
    }
  }

  const query =
    andClauses.length > 0 ? (andClauses.length === 1 ? andClauses[0] : { $and: andClauses }) : {};

  return { query, orgFilter };
}

export async function fetchAdminUsersWithStats(
  query: QueryFilter,
  orgFilter: QueryFilter,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;
  const now = Date.now();
  const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

  const [users, total, statsRows] = await Promise.all([
    User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    User.countDocuments(query),
    User.aggregate([
      { $match: orgFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          students: { $sum: { $cond: [{ $eq: ['$role', 'student'] }, 1, 0] } },
          teachers: { $sum: { $cond: [{ $eq: ['$role', 'teacher'] }, 1, 0] } },
          admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
          superadmins: { $sum: { $cond: [{ $eq: ['$role', 'superadmin'] }, 1, 0] } },
          suspended: { $sum: { $cond: [{ $eq: ['$isSuspended', true] }, 1, 0] } },
          appUsers: {
            $sum: { $cond: [{ $in: ['$lastPlatform', ['android', 'ios']] }, 1, 0] },
          },
          webUsers: {
            $sum: {
              $cond: [
                { $in: ['$lastPlatform', ['android', 'ios']] },
                0,
                1,
              ],
            },
          },
          activeToday: {
            $sum: { $cond: [{ $gte: ['$lastActiveAt', oneDayAgo] }, 1, 0] },
          },
          activeMonthly: {
            $sum: { $cond: [{ $gte: ['$lastActiveAt', thirtyDaysAgo] }, 1, 0] },
          },
        },
      },
    ]),
  ]);

  const agg = statsRows[0] as
    | {
        total: number;
        students: number;
        teachers: number;
        admins: number;
        superadmins: number;
        suspended: number;
        appUsers: number;
        webUsers: number;
        activeToday: number;
        activeMonthly: number;
      }
    | undefined;

  const stats = {
    total: agg?.total ?? 0,
    students: agg?.students ?? 0,
    teachers: agg?.teachers ?? 0,
    admins: agg?.admins ?? 0,
    superadmins: agg?.superadmins ?? 0,
    suspended: agg?.suspended ?? 0,
    appUsers: agg?.appUsers ?? 0,
    webUsers: agg?.webUsers ?? 0,
    activeToday: agg?.activeToday ?? 0,
    activeMonthly: agg?.activeMonthly ?? 0,
  };

  const usersWithActivity = await attachUserActivityStats(
    users as Array<{ _id: mongoose.Types.ObjectId; role?: string } & Record<string, unknown>>
  );

  return {
    users: usersWithActivity,
    total,
    stats,
  };
}
