import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';
import { updateSettingsSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { deleteCachedData } from '@/lib/redis';
import { revalidatePath } from 'next/cache';
import { isSuperAdmin } from '@/lib/roles';

// GET /api/admin/settings - Get app settings (admin only)
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/admin/settings',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Only superadmins can access settings' },
        { status: 403 }
      );
    }

    await dbConnect();

    let settings = await AppSettings.findOne().lean();

    // Create default settings if none exist
    if (!settings) {
      settings = await AppSettings.create({}).then(s => s.toObject());
    }

    return NextResponse.json(settings);
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/admin/settings', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/settings - Update app settings (admin only)
export async function PATCH(req: NextRequest) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/admin/settings',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    if (session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Only superadmins can update settings' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = updateSettingsSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { teacherLimits, notesLimits, featureToggles, platformConfig } = validationResult.data;
    const isSuper = isSuperAdmin(session.user.role);

    await dbConnect();

    let settings = await AppSettings.findOne();

    if (!settings) {
      settings = await AppSettings.create({});
    }

    // Update teacher limits if provided
    if (teacherLimits) {
      if (typeof teacherLimits.courses !== 'number' || teacherLimits.courses < 1) {
        return NextResponse.json(
          { message: 'courses limit must be a positive number' },
          { status: 400 }
        );
      }
      if (typeof teacherLimits.quizzes !== 'number' || teacherLimits.quizzes < 1) {
        return NextResponse.json(
          { message: 'quizzes limit must be a positive number' },
          { status: 400 }
        );
      }
      if (typeof teacherLimits.blogs !== 'number' || teacherLimits.blogs < 1) {
        return NextResponse.json(
          { message: 'blogs limit must be a positive number' },
          { status: 400 }
        );
      }
      if (
        teacherLimits.aiQuizGenerations !== undefined &&
        (typeof teacherLimits.aiQuizGenerations !== 'number' || teacherLimits.aiQuizGenerations < 1)
      ) {
        return NextResponse.json(
          { message: 'aiQuizGenerations limit must be a positive number' },
          { status: 400 }
        );
      }
      if (
        teacherLimits.aiQuizMaxQuestions !== undefined &&
        (typeof teacherLimits.aiQuizMaxQuestions !== 'number' || teacherLimits.aiQuizMaxQuestions < 1)
      ) {
        return NextResponse.json(
          { message: 'aiQuizMaxQuestions limit must be a positive number' },
          { status: 400 }
        );
      }
      settings.teacherLimits = {
        courses: teacherLimits.courses,
        quizzes: teacherLimits.quizzes,
        blogs: teacherLimits.blogs,
        aiQuizGenerations: teacherLimits.aiQuizGenerations ?? settings.teacherLimits?.aiQuizGenerations ?? 5,
        aiQuizMaxQuestions: teacherLimits.aiQuizMaxQuestions ?? settings.teacherLimits?.aiQuizMaxQuestions ?? 10,
      };
    }

    // Update notes limits if provided
    if (notesLimits) {
      if (typeof notesLimits.maxPagesPerUser !== 'number' || notesLimits.maxPagesPerUser < 1) {
        return NextResponse.json(
          { message: 'maxPagesPerUser must be a positive number' },
          { status: 400 }
        );
      }
      if (typeof notesLimits.maxWordsPerPage !== 'number' || notesLimits.maxWordsPerPage < 50) {
        return NextResponse.json(
          { message: 'maxWordsPerPage must be at least 50' },
          { status: 400 }
        );
      }
      settings.notesLimits = notesLimits;
    }

    // Update feature toggles if provided
    if (featureToggles) {
      const existingToggles = settings.featureToggles ?? {};
      const isSuper = isSuperAdmin(session.user.role);

      const mergedToggles = {
        ...existingToggles,
        enableBlogs: featureToggles.enableBlogs ?? existingToggles.enableBlogs ?? true,
        enableQuizzes: featureToggles.enableQuizzes ?? existingToggles.enableQuizzes ?? true,
        enableCourses: featureToggles.enableCourses ?? existingToggles.enableCourses ?? true,
        enableAnalytics: featureToggles.enableAnalytics ?? existingToggles.enableAnalytics ?? true,
        enableClarity: featureToggles.enableClarity ?? existingToggles.enableClarity ?? true,
        enablePhoneAuth: featureToggles.enablePhoneAuth ?? existingToggles.enablePhoneAuth ?? true,
        enableNotes: featureToggles.enableNotes ?? existingToggles.enableNotes ?? true,
        enableAiQuizGen:
          isSuper && featureToggles.enableAiQuizGen !== undefined
            ? featureToggles.enableAiQuizGen
            : (existingToggles.enableAiQuizGen ?? true),
        enableGoogleAdsense: featureToggles.enableGoogleAdsense ?? existingToggles.enableGoogleAdsense ?? true,
        enableCourseDoubts: featureToggles.enableCourseDoubts ?? existingToggles.enableCourseDoubts ?? true,
        enableContests:
          isSuper && featureToggles.enableContests !== undefined
            ? featureToggles.enableContests
            : (existingToggles.enableContests ?? false),
        enableContestMarketingPopup:
          isSuper && featureToggles.enableContestMarketingPopup !== undefined
            ? featureToggles.enableContestMarketingPopup
            : (existingToggles.enableContestMarketingPopup ?? false),
        enableDownloadAppPopup:
          featureToggles.enableDownloadAppPopup !== undefined
            ? featureToggles.enableDownloadAppPopup
            : (existingToggles.enableDownloadAppPopup ?? true),
        enableQuizSolutionAnalysis:
          isSuper && featureToggles.enableQuizSolutionAnalysis !== undefined
            ? featureToggles.enableQuizSolutionAnalysis
            : (existingToggles.enableQuizSolutionAnalysis ?? false),
        restrictPublicCourseCreation:
          isSuper && featureToggles.restrictPublicCourseCreation !== undefined
            ? featureToggles.restrictPublicCourseCreation
            : (existingToggles.restrictPublicCourseCreation ?? false),
        enableEnrollmentManagement:
          isSuper && featureToggles.enableEnrollmentManagement !== undefined
            ? featureToggles.enableEnrollmentManagement
            : (existingToggles.enableEnrollmentManagement ?? true),
        enablePullToRefresh:
          isSuper && featureToggles.enablePullToRefresh !== undefined
            ? featureToggles.enablePullToRefresh
            : (existingToggles.enablePullToRefresh ?? true),
        enableGoogleAuthApp:
          isSuper && featureToggles.enableGoogleAuthApp !== undefined
            ? featureToggles.enableGoogleAuthApp
            : (existingToggles.enableGoogleAuthApp ?? true),
        enableGoogleAuthWeb:
          isSuper && featureToggles.enableGoogleAuthWeb !== undefined
            ? featureToggles.enableGoogleAuthWeb
            : (existingToggles.enableGoogleAuthWeb ?? true),
        enableQuizChallenges:
          isSuper && featureToggles.enableQuizChallenges !== undefined
            ? featureToggles.enableQuizChallenges
            : (existingToggles.enableQuizChallenges ?? true),
        enableAutoDailyAiContestCreation:
          isSuper && featureToggles.enableAutoDailyAiContestCreation !== undefined
            ? featureToggles.enableAutoDailyAiContestCreation
            : (existingToggles.enableAutoDailyAiContestCreation ?? true),
        enableAutoDeclareResults:
          isSuper && featureToggles.enableAutoDeclareResults !== undefined
            ? featureToggles.enableAutoDeclareResults
            : (existingToggles.enableAutoDeclareResults ?? true),
      };

      settings.featureToggles = mergedToggles;
    }

    // Update challenge config if provided (superadmin only)
    if (body.challengeConfig && isSuper) {
      const existingConfig = settings.challengeConfig || {
        allowGuestChallenges: true,
        challengeExpiryDays: 7,
      };
      settings.challengeConfig = {
        allowGuestChallenges: body.challengeConfig.allowGuestChallenges ?? existingConfig.allowGuestChallenges ?? true,
        challengeExpiryDays: body.challengeConfig.challengeExpiryDays ?? existingConfig.challengeExpiryDays ?? 7,
      };
    }

    // Update platform config if provided
    if (platformConfig) {
      if (platformConfig.siteName && typeof platformConfig.siteName !== 'string') {
        return NextResponse.json(
          { message: 'siteName must be a string' },
          { status: 400 }
        );
      }
      if (platformConfig.siteDescription && typeof platformConfig.siteDescription !== 'string') {
        return NextResponse.json(
          { message: 'siteDescription must be a string' },
          { status: 400 }
        );
      }
      if (platformConfig.maintenanceMode !== undefined && typeof platformConfig.maintenanceMode !== 'boolean') {
        return NextResponse.json(
          { message: 'maintenanceMode must be a boolean' },
          { status: 400 }
        );
      }
      if (platformConfig.allowRegistration !== undefined && typeof platformConfig.allowRegistration !== 'boolean') {
        return NextResponse.json(
          { message: 'allowRegistration must be a boolean' },
          { status: 400 }
        );
      }
      if (
        platformConfig.allowTeacherRegistration !== undefined &&
        typeof platformConfig.allowTeacherRegistration !== 'boolean'
      ) {
        return NextResponse.json(
          { message: 'allowTeacherRegistration must be a boolean' },
          { status: 400 }
        );
      }
      if (platformConfig.defaultLanguage && !['en', 'hi'].includes(platformConfig.defaultLanguage)) {
        return NextResponse.json(
          { message: 'defaultLanguage must be either en or hi' },
          { status: 400 }
        );
      }
      settings.platformConfig = { ...settings.platformConfig, ...platformConfig };
    }

    await settings.save();

    // Invalidate Redis cache and Next.js path cache after updating settings
    await deleteCachedData('app:settings');
    revalidatePath('/api/settings');
    revalidatePath('/api/admin/settings');

    return NextResponse.json(settings);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/admin/settings', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
