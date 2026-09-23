import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import ContestAttempt from '@/models/ContestAttempt';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
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
}

export async function checkAndDeclareResults(options: CheckAndDeclareResultsOptions = {}) {
  await dbConnect();
  const now = new Date();
  const maxAgeHours = options.maxNotificationAgeHours ?? 48;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  
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
    const contestId = String(contest._id);
    const logContext = { method: 'INTERNAL', path: '/lib/contests/declareResults' };

    try {
      const contestEndMs = new Date(contest.endTime).getTime();
      const isRecent = (now.getTime() - contestEndMs) <= maxAgeMs;

      // Find all students who attempted this contest
      const attempts = await ContestAttempt.find({ contestId }).select('userId').lean();
      let uniqueUserIds = Array.from(new Set(attempts.map((a) => a.userId.toString())));

      // If targeted testing filter is active, restrict recipient IDs
      if (options.targetUserIds && options.targetUserIds.length > 0) {
        uniqueUserIds = uniqueUserIds.filter((id) => options.targetUserIds!.includes(id));
      }

      if (isRecent && uniqueUserIds.length > 0) {
        // Send batch push notification to all participants
        await sendPushNotification(uniqueUserIds, {
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
            contestId,
          },
          category: 'quizzes',
        }).catch((err) => {
          logError(
            (err as Error).message || 'Failed to send push notification',
            logContext,
            { action: 'sendPushNotification', contestId, error: err }
          );
        });
        totalNotificationsSent += uniqueUserIds.length;
      }

      // Mark as declared
      await Contest.updateOne({ _id: contest._id }, { $set: { resultsDeclared: true, status: 'completed' } });
    } catch (err) {
      logError(
        (err as Error).message || 'Failed to process contest',
        logContext,
        { action: 'processContest', contestId, error: err }
      );
    }
  }

  // Invalidate contest list cache across all tabs
  await invalidatePattern('contests:*');

  return { processed: contestsToDeclare.length, notificationsSent: totalNotificationsSent };
}
