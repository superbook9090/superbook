export interface TrendDay {
  date: string;
  signups: number;
  enrollments: number;
  attempts: number;
}

export interface RecentActivityItem {
  type: 'enrollment' | 'quiz_attempt';
  user: string;
  item: string;
  score?: number;
  date: Date | string;
}

interface DailyTrendItem {
  _id: string;
  count: number;
}

export function buildAdminTrendTimeline(
  trendStart: Date,
  rangeEnd: Date,
  userDailyTrends: DailyTrendItem[] = [],
  enrollmentDailyTrends: DailyTrendItem[] = [],
  quizAttemptDailyTrends: DailyTrendItem[] = []
): TrendDay[] {
  const trendDaysCount = Math.max(
    1,
    Math.ceil((rangeEnd.getTime() - trendStart.getTime()) / (1000 * 60 * 60 * 24))
  );
  const trendDaysMax = Math.min(trendDaysCount, 90);

  const trendDays: TrendDay[] = [];
  const userTrendMap = new Map(userDailyTrends.map((u) => [u._id, u.count]));
  const enrollmentTrendMap = new Map(enrollmentDailyTrends.map((e) => [e._id, e.count]));
  const attemptTrendMap = new Map(quizAttemptDailyTrends.map((a) => [a._id, a.count]));

  for (let i = 0; i < trendDaysMax; i++) {
    const d = new Date(trendStart);
    d.setDate(d.getDate() + i);
    if (d.getTime() > rangeEnd.getTime()) break;
    const dateStr = d.toISOString().split('T')[0];
    trendDays.push({
      date: dateStr,
      signups: userTrendMap.get(dateStr) || 0,
      enrollments: enrollmentTrendMap.get(dateStr) || 0,
      attempts: attemptTrendMap.get(dateStr) || 0,
    });
  }

  return trendDays;
}

interface PopulatedEnrollment {
  student?: { name?: string; email?: string } | null;
  course?: { title?: string } | null;
  createdAt: Date | string;
}

interface PopulatedQuizAttempt {
  student?: { name?: string; email?: string } | null;
  quiz?: { title?: string } | null;
  score?: number;
  createdAt: Date | string;
}

export function formatRecentActivity(
  recentEnrollments: PopulatedEnrollment[] = [],
  recentQuizAttempts: PopulatedQuizAttempt[] = []
): RecentActivityItem[] {
  const activities: RecentActivityItem[] = [
    ...recentEnrollments.map((e) => ({
      type: 'enrollment' as const,
      user: e.student?.name || e.student?.email || 'Student',
      item: e.course?.title || 'Course',
      date: e.createdAt,
    })),
    ...recentQuizAttempts.map((q) => ({
      type: 'quiz_attempt' as const,
      user: q.student?.name || q.student?.email || 'Student',
      item: q.quiz?.title || 'Quiz',
      score: q.score,
      date: q.createdAt,
    })),
  ];

  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);
}
