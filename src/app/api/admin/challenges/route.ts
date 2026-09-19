import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, type LogContext } from '@/lib/logger';
import { isAdmin } from '@/lib/roles';
import { Challenge, User, Quiz } from '@/models';

interface ChallengePopulatedDoc {
  _id: { toString(): string };
  slug: string;
  creator?: { _id?: { toString(): string }; name?: string; email?: string } | null;
  quiz?: { _id?: { toString(): string }; title?: string } | null;
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  status: 'active' | 'disabled' | 'expired';
  viewsCount?: number;
  attemptsCount?: number;
  conversionsCount?: number;
  expiresAt: Date;
  createdAt: Date;
}

export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/challenges',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    await dbConnect();

    const userRole = session.user.role;
    const organizationId = session.user.organizationId;
    const isSuper = userRole === 'superadmin';

    // Build course filter if organizational admin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let matchStage: any = {};
    if (!isSuper && organizationId) {
      const courses = await dbConnect().then(() => mongoose.model('Course').find({ organizationId }).select('_id').lean());
      const courseIds = courses.map((c) => c._id);
      matchStage = { course: { $in: courseIds } };
    }

    // Aggregate overall metrics
    const [totals] = await Challenge.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: null,
          totalChallenges: { $sum: 1 },
          totalViews: { $sum: '$viewsCount' },
          totalAttempts: { $sum: '$attemptsCount' },
          totalConversions: { $sum: '$conversionsCount' },
        },
      },
    ]);

    const totalChallenges = totals?.totalChallenges || 0;
    const totalViews = totals?.totalViews || 0;
    const totalAttempts = totals?.totalAttempts || 0;
    const totalConversions = totals?.totalConversions || 0;

    const kFactor = totalChallenges > 0 ? (totalConversions / totalChallenges).toFixed(2) : '0.00';
    const conversionRate =
      totalAttempts > 0 ? ((totalConversions / totalAttempts) * 100).toFixed(1) + '%' : '0.0%';

    // Fetch recent 50 challenges
    const challenges = await Challenge.find(matchStage)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate({ path: 'creator', model: User, select: 'name email' })
      .populate({ path: 'quiz', model: Quiz, select: 'title' })
      .lean();

    return NextResponse.json({
      success: true,
      metrics: {
        totalChallenges,
        totalViews,
        totalAttempts,
        totalConversions,
        kFactor,
        conversionRate,
      },
      challenges: (challenges as unknown as ChallengePopulatedDoc[]).map((c) => ({
        id: c._id.toString(),
        slug: c.slug,
        creator: {
          id: c.creator?._id?.toString(),
          name: c.creator?.name || 'Unknown',
          email: c.creator?.email || 'N/A',
        },
        quiz: {
          id: c.quiz?._id?.toString(),
          title: c.quiz?.title || 'Unknown Quiz',
        },
        targetScore: c.targetScore,
        correctCount: c.correctCount,
        totalQuestions: c.totalQuestions,
        status: c.status,
        viewsCount: c.viewsCount || 0,
        attemptsCount: c.attemptsCount || 0,
        conversionsCount: c.conversionsCount || 0,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
      })),
    });
  } catch (error) {
    logApiError(error as Error, 'GET', logContext.path || '/api/admin/challenges', logContext);
    return NextResponse.json(
      { message: 'Failed to fetch challenge admin data' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/admin/challenges',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    if (!isAdmin(session.user.role)) {
      return NextResponse.json(
        { message: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { challengeId, status } = body;

    if (!challengeId || !['active', 'disabled'].includes(status)) {
      return NextResponse.json(
        { message: 'Invalid challengeId or status' },
        { status: 400 }
      );
    }

    await dbConnect();

    const targetChallenge = await Challenge.findById(challengeId).lean();
    if (!targetChallenge) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    const userRole = session.user.role;
    const organizationId = session.user.organizationId;
    const isSuper = userRole === 'superadmin';

    // Verify organization ownership
    if (!isSuper && organizationId) {
      if (!targetChallenge.course) {
        // If a challenge somehow has no course, a normal admin shouldn't mutate it
        return NextResponse.json({ message: 'Forbidden: Cannot modify global challenges' }, { status: 403 });
      }
      const course = await mongoose.model('Course').findById(targetChallenge.course).select('organizationId').lean();
      if (!course || String(course.organizationId) !== String(organizationId)) {
        return NextResponse.json({ message: 'Forbidden: Challenge belongs to another organization' }, { status: 403 });
      }
    }

    const updated = await Challenge.findByIdAndUpdate(
      challengeId,
      { status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ message: 'Challenge not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      challenge: {
        id: updated._id.toString(),
        status: updated.status,
      },
    });
  } catch (error) {
    logApiError(error as Error, 'PATCH', logContext.path || '/api/admin/challenges', logContext);
    return NextResponse.json(
      { message: 'Failed to update challenge status' },
      { status: 500 }
    );
  }
}
