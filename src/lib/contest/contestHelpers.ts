import User from '@/models/User';
import mongoose from 'mongoose';

export type ContestComputedState = 'upcoming' | 'live' | 'completed' | 'cancelled' | 'draft';

export interface ContestTimeInput {
  status?: string;
  startTime: string | Date;
  endTime: string | Date;
  solutionsReleaseAt?: string | Date;
}

/**
 * Automatically computes the live contest state based on current server time.
 */
export function getContestComputedState(
  contest: ContestTimeInput,
  now: Date = new Date()
): ContestComputedState {
  if (contest.status === 'cancelled') return 'cancelled';
  if (contest.status === 'draft') return 'draft';
  if (contest.status === 'completed') return 'completed';

  const startMs = new Date(contest.startTime).getTime();
  const endMs = new Date(contest.endTime).getTime();
  const nowMs = now.getTime();

  if (nowMs < startMs) {
    return 'upcoming';
  }
  if (nowMs >= startMs && nowMs <= endMs) {
    return 'live';
  }
  return 'completed';
}

/**
 * Checks whether the solution and answer review feature is released for students.
 */
export function areContestSolutionsReleased(
  contest: {
    endTime: string | Date;
    solutionsReleaseAt?: string | Date;
  },
  now: Date = new Date()
): boolean {
  const releaseDate = contest.solutionsReleaseAt
    ? new Date(contest.solutionsReleaseAt)
    : new Date(contest.endTime);
  return now.getTime() >= releaseDate.getTime();
}

/**
 * Computes remaining time in seconds for an in-progress contest attempt.
 * Enforces the minimum of the student's individual duration and the contest end time.
 */
export function computeContestTimeRemainingSeconds(
  startedAt: string | Date,
  durationMinutes: number,
  contestEndTime: string | Date,
  now: Date = new Date()
): number {
  const startedMs = new Date(startedAt).getTime();
  const endMs = new Date(contestEndTime).getTime();
  const nowMs = now.getTime();

  if (Number.isNaN(startedMs) || Number.isNaN(endMs)) return 0;

  const attemptDeadlineMs = startedMs + durationMinutes * 60 * 1000;
  const effectiveDeadlineMs = Math.min(attemptDeadlineMs, endMs);

  const remainingSeconds = Math.floor((effectiveDeadlineMs - nowMs) / 1000);
  return Math.max(0, remainingSeconds);
}

/**
 * Checks if teacher/staff is permitted to create, edit, or manage contests.
 * Superadmin always has access; teachers require `canCreateContests: true`.
 */
export async function canTeacherManageContests(
  userId: string | mongoose.Types.ObjectId,
  role?: string
): Promise<boolean> {
  if (role === 'superadmin') {
    return true;
  }
  if (role !== 'teacher' && role !== 'admin') {
    return false;
  }

  const user = await User.findById(userId).select('canCreateContests role').lean();
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  return Boolean(user.canCreateContests);
}
