import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AppSettings, { type IAppSettings } from '@/models/AppSettings';
import { logInfo, logApiError, type LogContext } from '@/lib/logger';
import { getCachedData, setCachedData } from '@/lib/redis';

// GET /api/settings - Get app settings
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/settings',
  };

  try {
    const cacheKey = 'app:settings';

    // Try cache first
    const cached = await getCachedData(cacheKey);
    if (cached) {
      logInfo(`Redis Cache HIT: ${cacheKey}`, logContext);
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    logInfo(`Redis Cache MISS: ${cacheKey}`, logContext);

    await dbConnect();

    const settings = (await AppSettings.findOne().lean()) as unknown as IAppSettings | null;

    const defaultSettings = {
      teacherLimits: {
        courses: 5,
        quizzes: 10,
        blogs: 2,
        aiQuizGenerations: 5,
      },
      notesLimits: {
        maxPagesPerUser: 5,
        maxWordsPerPage: 1000,
      },
      featureToggles: {
        enableBlogs: true,
        enableQuizzes: true,
        enableCourses: true,
        enableAnalytics: true,
        enableClarity: true,
        enableQuizSolutionAnalysis: false,
        restrictPublicCourseCreation: false,
        enableEnrollmentManagement: true,
        enablePhoneAuth: true,
        enablePullToRefresh: true,
        enableGoogleAuthApp: true,
        enableGoogleAuthWeb: true,
        enableNotes: true,
        enableAiQuizGen: true,
      },
      platformConfig: {
        siteName: 'Quiz Do',
        siteDescription: 'Learning Management System',
        maintenanceMode: false,
        allowRegistration: true,
        allowTeacherRegistration: true,
        defaultLanguage: 'en',
      },
    };

    if (!settings) {
      // Cache default settings
      await setCachedData(cacheKey, defaultSettings, 300); // 5 minutes
      logInfo(`Redis Cache SET: ${cacheKey}`, logContext);

      return NextResponse.json(defaultSettings, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    const mergedSettings = {
      ...defaultSettings,
      ...settings,
      teacherLimits: {
        ...defaultSettings.teacherLimits,
        ...(settings.teacherLimits || {}),
      },
      notesLimits: {
        ...defaultSettings.notesLimits,
        ...(settings.notesLimits || {}),
      },
      featureToggles: {
        ...defaultSettings.featureToggles,
        ...(settings.featureToggles || {}),
      },
      platformConfig: {
        ...defaultSettings.platformConfig,
        ...(settings.platformConfig || {}),
      },
    };

    // Cache the settings
    await setCachedData(cacheKey, mergedSettings, 300); // 5 minutes
    logInfo(`Redis Cache SET: ${cacheKey}`, logContext);

    return NextResponse.json(mergedSettings, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/settings', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
