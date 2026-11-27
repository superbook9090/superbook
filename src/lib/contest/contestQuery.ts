import { Session } from 'next-auth';
import mongoose from 'mongoose';
import ContestAttempt from '@/models/ContestAttempt';
import Contest from '@/models/Contest';

export interface ContestFilterParams {
  tab?: string | null;
  scheduleType?: string | null;
  instructor?: string | null;
  search?: string | null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function combineAndFilters(filters: Record<string, unknown>[]): Record<string, unknown> {
  if (filters.length === 0) return {};
  if (filters.length === 1) return filters[0];
  return { $and: filters };
}

function buildBaseContestScopeFilters(
  session: Session | null,
  isTeacherSelf: boolean,
  isAdminAll: boolean
): Record<string, unknown>[] {
  const filters: Record<string, unknown>[] = [];

  if (isAdminAll) {
    if (session?.user?.role === 'superadmin') {
      // Superadmin sees all contests
      return filters;
    }
    // Org admin sees only contests belonging to their organization
    if (session?.user?.organizationId) {
      filters.push({ organizationId: session.user.organizationId });
    } else {
      // Admin without organizationId gets empty result
      filters.push({ _id: null });
    }
    return filters;
  }

  if (isTeacherSelf && session?.user?.id) {
    filters.push({ instructor: session.user.id });
    return filters;
  }

  filters.push({ status: { $in: ['published', 'completed'] } });

  if (session?.user?.organizationId) {
    filters.push({
      $or: [
        { organizationId: session.user.organizationId, visibility: { $ne: 'unlisted' } },
        { organizationId: null, visibility: 'public' },
        { organizationId: { $exists: false }, visibility: 'public' },
      ],
    });
  } else {
    filters.push({
      visibility: 'public',
      $or: [{ organizationId: null }, { organizationId: { $exists: false } }],
    });
  }

  return filters;
}

export function buildContestListQuery(
  session: Session | null,
  params: ContestFilterParams,
  now: Date = new Date()
) {
  const { tab, scheduleType, instructor, search } = params;
  const isTeacherSelf = Boolean(instructor === 'self' && session?.user?.id);
  const isAdminAll = Boolean(
    instructor === 'all' &&
      (session?.user?.role === 'superadmin' || session?.user?.role === 'admin')
  );

  const andFilters = buildBaseContestScopeFilters(session, isTeacherSelf, isAdminAll);

  if (scheduleType && ['one_time', 'daily', 'weekly'].includes(scheduleType)) {
    andFilters.push({ scheduleType });
  }

  if (search && search.trim()) {
    const escapedSearch = escapeRegex(search.trim());
    andFilters.push({
      $or: [
        { title: { $regex: escapedSearch, $options: 'i' } },
        { description: { $regex: escapedSearch, $options: 'i' } },
      ],
    });
  }

  if (tab === 'live') {
    andFilters.push({
      startTime: { $lte: now },
      endTime: { $gte: now },
      ...(!isTeacherSelf && !isAdminAll ? { status: 'published' } : {}),
    });
  } else if (tab === 'upcoming') {
    andFilters.push({
      startTime: { $gt: now },
      ...(!isTeacherSelf && !isAdminAll ? { status: 'published' } : {}),
    });
  } else if (tab === 'completed') {
    andFilters.push({
      $or: [{ endTime: { $lt: now } }, { status: 'completed' }],
    });
  }

  const query = combineAndFilters(andFilters);

  return { query, isTeacherSelf, isAdminAll };
}

export async function getStudentAttemptMap(
  studentId: string,
  contestIds: (string | mongoose.Types.ObjectId)[]
): Promise<Record<string, { status: string; score: number; percentage: number }>> {
  if (!contestIds.length) return {};

  const attempts = await ContestAttempt.find({
    student: studentId,
    contest: { $in: contestIds },
  })
    .select('contest status score percentage attemptNumber')
    .sort({ attemptNumber: -1 })
    .lean();

  const attemptMap: Record<string, { status: string; score: number; percentage: number }> = {};
  attempts.forEach((att) => {
    const cId = att.contest.toString();
    if (!attemptMap[cId]) {
      attemptMap[cId] = {
        status: att.status,
        score: att.score,
        percentage: att.percentage,
      };
    }
  });

  return attemptMap;
}

export async function getContestTabCounts(
  session: Session | null,
  isTeacherSelf: boolean,
  isAdminAll: boolean,
  now: Date = new Date()
) {
  const baseFilters = buildBaseContestScopeFilters(session, isTeacherSelf, isAdminAll);

  const [liveCount, upcomingCount, completedCount] = await Promise.all([
    Contest.countDocuments(
      combineAndFilters([
        ...baseFilters,
        {
          startTime: { $lte: now },
          endTime: { $gte: now },
          status: 'published',
        },
      ])
    ),
    Contest.countDocuments(
      combineAndFilters([
        ...baseFilters,
        {
          startTime: { $gt: now },
          status: 'published',
        },
      ])
    ),
    Contest.countDocuments(
      combineAndFilters([
        ...baseFilters,
        {
          $or: [{ endTime: { $lt: now } }, { status: 'completed' }],
        },
      ])
    ),
  ]);

  return { liveCount, upcomingCount, completedCount };
}
