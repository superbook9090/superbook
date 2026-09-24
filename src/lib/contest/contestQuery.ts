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

export function buildContestListQuery(
  session: Session | null,
  params: ContestFilterParams,
  now: Date = new Date()
) {
  const { tab, scheduleType, instructor, search } = params;
  const isTeacherSelf = instructor === 'self' && session?.user?.id;
  const isAdminAll =
    instructor === 'all' &&
    (session?.user?.role === 'superadmin' || session?.user?.role === 'admin');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (isAdminAll) {
    // Admin sees all
  } else if (isTeacherSelf) {
    query.instructor = session.user.id;
  } else {
    query.status = { $in: ['published', 'completed'] };

    if (session?.user?.organizationId) {
      query.$or = [
        { organizationId: null },
        { organizationId: session.user.organizationId },
      ];
    } else {
      query.visibility = { $in: ['public', 'unlisted'] };
      query.organizationId = null;
    }
  }

  if (scheduleType && ['one_time', 'daily', 'weekly'].includes(scheduleType)) {
    query.scheduleType = scheduleType;
  }

  if (search && search.trim()) {
    query.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (tab === 'live') {
    query.startTime = { $lte: now };
    query.endTime = { $gte: now };
    if (!isTeacherSelf && !isAdminAll) query.status = 'published';
  } else if (tab === 'upcoming') {
    query.startTime = { $gt: now };
    if (!isTeacherSelf && !isAdminAll) query.status = 'published';
  } else if (tab === 'completed') {
    query.$or = [{ endTime: { $lt: now } }, { status: 'completed' }];
  }

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
  const baseCountQuery = isAdminAll
    ? {}
    : isTeacherSelf && session?.user?.id
    ? { instructor: session.user.id }
    : {
        status: { $in: ['published', 'completed'] },
        ...(session?.user?.organizationId
          ? {
              $or: [
                { organizationId: null },
                { organizationId: session.user.organizationId },
              ],
            }
          : { visibility: { $in: ['public', 'unlisted'] }, organizationId: null }),
      };

  const [liveCount, upcomingCount, completedCount] = await Promise.all([
    Contest.countDocuments({
      ...baseCountQuery,
      startTime: { $lte: now },
      endTime: { $gte: now },
      status: 'published',
    }),
    Contest.countDocuments({
      ...baseCountQuery,
      startTime: { $gt: now },
      status: 'published',
    }),
    Contest.countDocuments({
      ...baseCountQuery,
      $or: [{ endTime: { $lt: now } }, { status: 'completed' }],
    }),
  ]);

  return { liveCount, upcomingCount, completedCount };
}
