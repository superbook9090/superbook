import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import ContestAttempt from '@/models/ContestAttempt';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
import { createUserNotifications } from '@/lib/server/services/notifications-service';
import { logError } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';

export interface CheckAndDeclareResultsOptions {
  /** If provided, restrict notifications to only these user IDs (used for safe testing) */
  targetUserIds?: string[];
  /** 
   * Maximum hours elapsed since contest ended to qualify for push notifications.
   * Contests ended longer ago will still be marked as declared, but won't send outdated notifications.
   * Default: 48 hours.
   */
  maxNotificationAgeHours?: number;
  /** If true, ignore max age check (used when manually declared by admin) */
  ignoreAge?: boolean;
}

/**
 * Declares results for a single contest and notifies all students who participated.
 */
export async function declareContestResults(
  contestId: string,
  options: CheckAndDeclareResultsOptions = {}
): Promise<{ success: boolean; notificationsSent: number; message?: string }> {
  await dbConnect();
  const now = new Date();
  const maxAgeHours = options.maxNotificationAgeHours ?? 48;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  const logContext = { method: 'INTERNAL', path: '/lib/contests/declareResults', contestId };

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return { success: false, notificationsSent: 0, message: 'Contest not found' };
  }

  const contestObjectId = mongoose.Types.ObjectId.isValid(contestId)
    ? new mongoose.Types.ObjectId(contestId)
    : null;

  // Find all students who attempted this contest.
  // Note: In ContestAttempt schema the reference to contest is 'contest' and student is 'student'.
  const attempts = await ContestAttempt.find({
    $or: [
      { contest: contest._id },
      ...(contestObjectId ? [{ contest: contestObjectId }] : []),
      { contestId: contestId },
    ],
  })
    .select('student userId')
    .lean();

  const participantIds = attempts
    .map((a) => {
      const student = a.student ?? (a as { userId?: unknown }).userId;
      return student ? String(student) : null;
    })
    .filter((id): id is string => Boolean(id));

  let uniqueUserIds = Array.from(new Set(participantIds));

  // If targeted testing filter is active, restrict recipient IDs
  if (options.targetUserIds && options.targetUserIds.length > 0) {
    uniqueUserIds = uniqueUserIds.filter((id) => options.targetUserIds!.includes(id));
  }

  const contestEndMs = new Date(contest.endTime).getTime();
  const isRecent = options.ignoreAge || now.getTime() - contestEndMs <= maxAgeMs;

  let notificationsSent = 0;

  if (isRecent && uniqueUserIds.length > 0) {
    const notificationPayload = {
      title: {
        en: `🏆 Results Declared: ${contest.title}`,
        hi: `🏆 परिणाम घोषित: ${contest.title}`,
      },
      body: {
        en: 'The leaderboard is now live! Tap to see your rank and score.',
        hi: 'लीडरबोर्ड अब लाइव है! अपनी रैंक और स्कोर देखने के लिए टैप करें।',
      },
      data: {
        url: `/dashboard/student/contests/${contestId}/result`,
        webUrl: `/dashboard/student/contests/${contestId}/result`,
        contestId: String(contest._id),
      },
      category: 'quizzes' as const,
    };

    // 1. Create In-App Notifications for all students who attempted
    await createUserNotifications(uniqueUserIds, notificationPayload).catch((err) => {
      logError(
        (err as Error).message || 'Failed to create in-app notifications',
        logContext,
        { action: 'createUserNotifications', contestId, error: err }
      );
    });

    // 2. Send Web / Mobile Push Notifications via FCM
    await sendPushNotification(uniqueUserIds, notificationPayload).catch((err) => {
      logError(
        (err as Error).message || 'Failed to send push notification',
        logContext,
        { action: 'sendPushNotification', contestId, error: err }
      );
    });

    notificationsSent = uniqueUserIds.length;
  }

  // Mark contest as declared and completed
  await Contest.updateOne(
    { _id: contest._id },
    { $set: { resultsDeclared: true, status: 'completed' } }
  );

  await invalidatePattern('contests:*');

  return { success: true, notificationsSent };
}

export async function checkAndDeclareResults(options: CheckAndDeclareResultsOptions = {}) {
  await dbConnect();
  const now = new Date();

  // Find contests that have ended, are published/completed, but results haven't been declared yet
  const contestsToDeclare = await Contest.find({
    endTime: { $lte: now },
    status: { $in: ['published', 'completed'] },
    $or: [{ resultsDeclared: false }, { resultsDeclared: { $exists: false } }],
  }).lean();

  if (contestsToDeclare.length === 0) {
    return { processed: 0, notificationsSent: 0 };
  }

  let totalNotificationsSent = 0;

  for (const contest of contestsToDeclare) {
    try {
      const res = await declareContestResults(String(contest._id), options);
      totalNotificationsSent += res.notificationsSent;
    } catch (err) {
      logError(
        (err as Error).message || 'Failed to process contest',
        { method: 'INTERNAL', path: '/lib/contests/declareResults' },
        { action: 'processContest', contestId: String(contest._id), error: err }
      );
    }
  }

  return { processed: contestsToDeclare.length, notificationsSent: totalNotificationsSent };
}
