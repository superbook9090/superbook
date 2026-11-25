import mongoose from 'mongoose';
import { Course, Enrollment, QuizAttempt } from '@/models';

export interface ScoreBandItem {
  band: string;
  label: string;
  count: number;
  percentage: number;
}

export interface ScoreTierCounts {
  high: number;
  average: number;
  low: number;
  passRate: number;
}

export interface DailyQuizScorePoint {
  date: string;
  attempts: number;
  avgScore: number;
}

export interface CategoryBreakdownItem {
  category: string;
  courses: number;
  published: number;
  enrollments: number;
}

export interface LearnerFunnelData {
  registered: number;
  active30d: number;
  enrolledLearners: number;
  quizParticipants: number;
  completedEnrollments: number;
}

interface BreakdownParams {
  orgFilter: Record<string, unknown>;
  userIds: mongoose.Types.ObjectId[];
  quizIds: mongoose.Types.ObjectId[];
  trendStart: Date;
  rangeEnd: Date;
  totalUsers: number;
  mauCount: number;
  completedEnrollments: number;
}

const SCORE_BAND_ORDER = [
  { band: '0-39', label: '0–39%' },
  { band: '40-59', label: '40–59%' },
  { band: '60-79', label: '60–79%' },
  { band: '80-89', label: '80–89%' },
  { band: '90-100', label: '90–100%' },
] as const;

export async function getAdminBreakdowns({
  orgFilter,
  userIds,
  quizIds,
  trendStart,
  rangeEnd,
  totalUsers,
  mauCount,
  completedEnrollments,
}: BreakdownParams) {
  const [
    scoreBandsRaw,
    tierRaw,
    dailyQuizRaw,
    categoryRaw,
    enrolledStudentsRaw,
    quizParticipantsRaw,
  ] = await Promise.all([
    quizIds.length
      ? QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds }, status: 'completed' } },
          {
            $project: {
              band: {
                $switch: {
                  branches: [
                    { case: { $lt: ['$score', 40] }, then: '0-39' },
                    { case: { $lt: ['$score', 60] }, then: '40-59' },
                    { case: { $lt: ['$score', 80] }, then: '60-79' },
                    { case: { $lt: ['$score', 90] }, then: '80-89' },
                  ],
                  default: '90-100',
                },
              },
            },
          },
          { $group: { _id: '$band', count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),

    quizIds.length
      ? QuizAttempt.aggregate([
          { $match: { quiz: { $in: quizIds }, status: 'completed' } },
          {
            $group: {
              _id: null,
              high: { $sum: { $cond: [{ $gte: ['$score', 80] }, 1, 0] } },
              average: { $sum: { $cond: [{ $and: [{ $gte: ['$score', 50] }, { $lt: ['$score', 80] }] }, 1, 0] } },
              low: { $sum: { $cond: [{ $lt: ['$score', 50] }, 1, 0] } },
              total: { $sum: 1 },
            },
          },
        ])
      : Promise.resolve([]),

    quizIds.length
      ? QuizAttempt.aggregate([
          {
            $match: {
              quiz: { $in: quizIds },
              status: 'completed',
              createdAt: { $gte: trendStart, $lte: rangeEnd },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              attempts: { $sum: 1 },
              avgScore: { $avg: '$score' },
            },
          },
        ])
      : Promise.resolve([]),

    Course.aggregate([
      { $match: orgFilter },
      {
        $lookup: {
          from: 'enrollments',
          localField: '_id',
          foreignField: 'course',
          as: 'enrollments',
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ['$category', null] }, { $eq: ['$category', ''] }] },
              'General',
              '$category',
            ],
          },
          courses: { $sum: 1 },
          published: { $sum: { $cond: ['$isPublished', 1, 0] } },
          enrollments: { $sum: { $size: '$enrollments' } },
        },
      },
      { $sort: { enrollments: -1, courses: -1 } },
      { $limit: 8 },
    ]),

    userIds.length
      ? Enrollment.distinct('student', { student: { $in: userIds } })
      : Promise.resolve([]),

    quizIds.length
      ? QuizAttempt.distinct('student', { quiz: { $in: quizIds }, status: 'completed' })
      : Promise.resolve([]),
  ]);

  const bandMap = new Map(
    (scoreBandsRaw as { _id: string; count: number }[]).map((b) => [b._id, b.count])
  );
  const totalGraded = Array.from(bandMap.values()).reduce((sum, n) => sum + n, 0);

  const scoreDistribution: ScoreBandItem[] = SCORE_BAND_ORDER.map(({ band, label }) => {
    const count = bandMap.get(band) ?? 0;
    return {
      band,
      label,
      count,
      percentage: totalGraded > 0 ? Math.round((count / totalGraded) * 100) : 0,
    };
  });

  const tierRow = (tierRaw as { high: number; average: number; low: number; total: number }[])[0];
  const scoreTiers: ScoreTierCounts = tierRow
    ? {
        high: tierRow.high,
        average: tierRow.average,
        low: tierRow.low,
        passRate:
          tierRow.total > 0
            ? Math.round(((tierRow.high + tierRow.average) / tierRow.total) * 100)
            : 0,
      }
    : { high: 0, average: 0, low: 0, passRate: 0 };

  const dailyMap = new Map(
    (dailyQuizRaw as { _id: string; attempts: number; avgScore: number }[]).map((d) => [
      d._id,
      { attempts: d.attempts, avgScore: Math.round(d.avgScore || 0) },
    ])
  );
  const daysSpan = Math.min(
    90,
    Math.max(1, Math.ceil((rangeEnd.getTime() - trendStart.getTime()) / (1000 * 60 * 60 * 24)))
  );
  const dailyQuizScores: DailyQuizScorePoint[] = [];
  for (let i = 0; i < daysSpan; i++) {
    const d = new Date(trendStart);
    d.setDate(d.getDate() + i);
    if (d.getTime() > rangeEnd.getTime()) break;
    const key = d.toISOString().split('T')[0];
    const row = dailyMap.get(key);
    dailyQuizScores.push({
      date: key,
      attempts: row?.attempts ?? 0,
      avgScore: row?.avgScore ?? 0,
    });
  }

  const categoryBreakdown: CategoryBreakdownItem[] = (
    categoryRaw as { _id: string; courses: number; published: number; enrollments: number }[]
  ).map((c) => ({
    category: c._id || 'General',
    courses: c.courses,
    published: c.published,
    enrollments: c.enrollments,
  }));

  const funnel: LearnerFunnelData = {
    registered: totalUsers,
    active30d: mauCount,
    enrolledLearners: enrolledStudentsRaw.length,
    quizParticipants: quizParticipantsRaw.length,
    completedEnrollments,
  };

  return {
    scoreDistribution,
    scoreTiers,
    dailyQuizScores,
    categoryBreakdown,
    funnel,
  };
}
