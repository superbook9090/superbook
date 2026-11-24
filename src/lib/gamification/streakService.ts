import dbConnect from '@/lib/db';
import User from '@/models/User';

function getTodayString(): string {
  // Format YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export interface ActivityStreakResult {
  currentStreak: number;
  longestStreak: number;
  xpEarned: number;
  totalXp: number;
  isNewDay: boolean;
}

export async function recordUserActivity(
  userId: string,
  activityType: 'quiz' | 'contest' | 'lesson' = 'quiz'
): Promise<ActivityStreakResult> {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return { currentStreak: 0, longestStreak: 0, xpEarned: 0, totalXp: 0, isNewDay: false };
  }

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const currentStreakObj = user.streak || { current: 0, longest: 0, lastActiveDate: '' };

  let currentStreak = currentStreakObj.current || 0;
  let longestStreak = currentStreakObj.longest || 0;
  let isNewDay = false;
  let xpEarned = activityType === 'contest' ? 50 : 25;

  if (currentStreakObj.lastActiveDate === today) {
    isNewDay = false;
  } else if (currentStreakObj.lastActiveDate === yesterday) {
    currentStreak += 1;
    longestStreak = Math.max(longestStreak, currentStreak);
    isNewDay = true;
    xpEarned += 50; // Daily streak continuation bonus
  } else {
    currentStreak = 1;
    longestStreak = Math.max(longestStreak, 1);
    isNewDay = true;
    xpEarned += 25;
  }

  const newTotalXp = (user.xp || 0) + xpEarned;

  await User.findByIdAndUpdate(userId, {
    $set: {
      'streak.current': currentStreak,
      'streak.longest': longestStreak,
      'streak.lastActiveDate': today,
      xp: newTotalXp,
      lastActiveAt: new Date(),
    },
  });

  return {
    currentStreak,
    longestStreak,
    xpEarned,
    totalXp: newTotalXp,
    isNewDay,
  };
}

export async function getUserStreak(userId: string) {
  await dbConnect();
  const user = await User.findById(userId).select('streak xp').lean();
  if (!user) {
    return { currentStreak: 0, longestStreak: 0, totalXp: 0, lastActiveDate: '' };
  }

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const streak = user.streak || { current: 0, longest: 0, lastActiveDate: '' };

  // If user hasn't been active today and was not active yesterday, display streak as 0
  const isAlive = streak.lastActiveDate === today || streak.lastActiveDate === yesterday;
  const displayCurrent = isAlive ? streak.current : 0;

  return {
    currentStreak: displayCurrent,
    longestStreak: streak.longest || 0,
    totalXp: user.xp || 0,
    lastActiveDate: streak.lastActiveDate || '',
  };
}
