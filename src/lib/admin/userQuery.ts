import User from '@/models/User';
import { sanitizeSearchQuery, validateObjectId } from '@/lib/sanitize';
import { AdminAuthResult } from './adminAuth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type QueryFilter = Record<string, any>;

export interface AdminUserQueryParams {
  role?: string | null;
  search?: string | null;
  platform?: string | null;
  activity?: string | null;
  organizationIdParam?: string | null;
}

export function buildAdminUsersQuery(
  authResult: AdminAuthResult,
  params: AdminUserQueryParams
): { query: QueryFilter; orgFilter: QueryFilter } {
  const { role, search, platform, activity, organizationIdParam } = params;

  let orgFilter: QueryFilter = {};
  if (!authResult.isSuperAdmin) {
    if (!authResult.organizationId) {
      orgFilter = { organizationId: null };
    } else {
      orgFilter = { organizationId: authResult.organizationId };
    }
  } else if (organizationIdParam) {
    if (organizationIdParam === 'null' || organizationIdParam === 'none') {
      orgFilter = { organizationId: null };
    } else if (validateObjectId(organizationIdParam)) {
      orgFilter = { organizationId: organizationIdParam };
    }
  }

  const andClauses: QueryFilter[] = [];

  if (Object.keys(orgFilter).length > 0) {
    andClauses.push(orgFilter);
  }

  if (role && role !== 'all') {
    andClauses.push({ role });
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
    andClauses.push({
      $or: [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } },
      ],
    });
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

  const [
    users,
    total,
    statsAgg,
    suspendedCount,
    appUsersCount,
    webUsersCount,
    dauCount,
    mauCount,
  ] = await Promise.all([
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
          _id: '$role',
          count: { $sum: 1 },
        },
      },
    ]),
    User.countDocuments({ ...orgFilter, isSuspended: true }),
    User.countDocuments({ ...orgFilter, lastPlatform: { $in: ['android', 'ios'] } }),
    User.countDocuments({
      ...orgFilter,
      $or: [{ lastPlatform: 'web' }, { lastPlatform: { $exists: false } }, { lastPlatform: null }],
    }),
    User.countDocuments({ ...orgFilter, lastActiveAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } }),
    User.countDocuments({ ...orgFilter, lastActiveAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } }),
  ]);

  const stats = {
    total: 0,
    students: 0,
    teachers: 0,
    admins: 0,
    superadmins: 0,
    suspended: suspendedCount,
    appUsers: appUsersCount,
    webUsers: webUsersCount,
    activeToday: dauCount,
    activeMonthly: mauCount,
  };

  statsAgg.forEach((item: { _id: string; count: number }) => {
    stats.total += item.count;
    if (item._id === 'student') stats.students = item.count;
    else if (item._id === 'teacher') stats.teachers = item.count;
    else if (item._id === 'admin') stats.admins = item.count;
    else if (item._id === 'superadmin') stats.superadmins = item.count;
  });

  return {
    users,
    total,
    stats,
  };
}
