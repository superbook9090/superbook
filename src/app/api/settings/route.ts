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
        aiQuizMaxQuestions: 10,
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
        enableGoogleAdsense: true,
        enableCourseDoubts: true,
        enableContests: false,
        enableContestMarketingPopup: false,
        enableDownloadAppPopup: true,
        enableQuizChallenges: true,
        enableChatWidget: true,
      },
      challengeConfig: {
        allowGuestChallenges: true,
        challengeExpiryDays: 7,
      },
      appVersionConfig: {
        latestVersion: '1.10.10',
        minRequiredVersion: '1.0.0',
        forceUpdate: false,
        updateUrl: 'https://play.google.com/store/apps/details?id=com.quizdo',
        releaseNotes: 'Bug fixes and performance improvements.',
        enabled: true,
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

    const ft = settings.featureToggles;
    const tl = settings.teacherLimits;
    const nl = settings.notesLimits;
    const cc = settings.challengeConfig;
    const av = settings.appVersionConfig;
    const pc = settings.platformConfig as IAppSettings['platformConfig'] & {
      siteName?: string;
      siteDescription?: string;
    };

    const mergedSettings = {
      teacherLimits: {
        courses: tl?.courses ?? defaultSettings.teacherLimits.courses,
        quizzes: tl?.quizzes ?? defaultSettings.teacherLimits.quizzes,
        blogs: tl?.blogs ?? defaultSettings.teacherLimits.blogs,
        aiQuizGenerations: tl?.aiQuizGenerations ?? defaultSettings.teacherLimits.aiQuizGenerations,
        aiQuizMaxQuestions: tl?.aiQuizMaxQuestions ?? defaultSettings.teacherLimits.aiQuizMaxQuestions,
      },
      notesLimits: {
        maxPagesPerUser: nl?.maxPagesPerUser ?? defaultSettings.notesLimits.maxPagesPerUser,
        maxWordsPerPage: nl?.maxWordsPerPage ?? defaultSettings.notesLimits.maxWordsPerPage,
      },
      featureToggles: {
        enableBlogs: ft?.enableBlogs ?? defaultSettings.featureToggles.enableBlogs,
        enableQuizzes: ft?.enableQuizzes ?? defaultSettings.featureToggles.enableQuizzes,
        enableCourses: ft?.enableCourses ?? defaultSettings.featureToggles.enableCourses,
        enableAnalytics: ft?.enableAnalytics ?? defaultSettings.featureToggles.enableAnalytics,
        enableClarity: ft?.enableClarity ?? defaultSettings.featureToggles.enableClarity,
        enableQuizSolutionAnalysis:
          ft?.enableQuizSolutionAnalysis ?? defaultSettings.featureToggles.enableQuizSolutionAnalysis,
        restrictPublicCourseCreation:
          ft?.restrictPublicCourseCreation ?? defaultSettings.featureToggles.restrictPublicCourseCreation,
        enableEnrollmentManagement:
          ft?.enableEnrollmentManagement ?? defaultSettings.featureToggles.enableEnrollmentManagement,
        enablePhoneAuth: ft?.enablePhoneAuth ?? defaultSettings.featureToggles.enablePhoneAuth,
        enablePullToRefresh: ft?.enablePullToRefresh ?? defaultSettings.featureToggles.enablePullToRefresh,
        enableGoogleAuthApp: ft?.enableGoogleAuthApp ?? defaultSettings.featureToggles.enableGoogleAuthApp,
        enableGoogleAuthWeb: ft?.enableGoogleAuthWeb ?? defaultSettings.featureToggles.enableGoogleAuthWeb,
        enableNotes: ft?.enableNotes ?? defaultSettings.featureToggles.enableNotes,
        enableAiQuizGen: ft?.enableAiQuizGen ?? defaultSettings.featureToggles.enableAiQuizGen,
        enableGoogleAdsense: ft?.enableGoogleAdsense ?? defaultSettings.featureToggles.enableGoogleAdsense,
        enableCourseDoubts: ft?.enableCourseDoubts ?? defaultSettings.featureToggles.enableCourseDoubts,
        enableContests: ft?.enableContests ?? defaultSettings.featureToggles.enableContests,
        enableContestMarketingPopup:
          ft?.enableContestMarketingPopup ?? defaultSettings.featureToggles.enableContestMarketingPopup,
        enableDownloadAppPopup:
          ft?.enableDownloadAppPopup ?? defaultSettings.featureToggles.enableDownloadAppPopup,
        enableQuizChallenges: ft?.enableQuizChallenges ?? defaultSettings.featureToggles.enableQuizChallenges,
        enableChatWidget: ft?.enableChatWidget ?? defaultSettings.featureToggles.enableChatWidget,
      },
      challengeConfig: {
        allowGuestChallenges: cc?.allowGuestChallenges ?? defaultSettings.challengeConfig.allowGuestChallenges,
        ...(cc?.guestQuestionLimit !== undefined ? { guestQuestionLimit: cc.guestQuestionLimit } : {}),
        challengeExpiryDays: cc?.challengeExpiryDays ?? defaultSettings.challengeConfig.challengeExpiryDays,
      },
      appVersionConfig: {
        latestVersion: av?.latestVersion ?? defaultSettings.appVersionConfig.latestVersion,
        minRequiredVersion: av?.minRequiredVersion ?? defaultSettings.appVersionConfig.minRequiredVersion,
        forceUpdate: av?.forceUpdate ?? defaultSettings.appVersionConfig.forceUpdate,
        updateUrl: av?.updateUrl ?? defaultSettings.appVersionConfig.updateUrl,
        releaseNotes: av?.releaseNotes ?? defaultSettings.appVersionConfig.releaseNotes,
        enabled: av?.enabled ?? defaultSettings.appVersionConfig.enabled,
      },
      platformConfig: {
        siteName: pc?.siteName ?? defaultSettings.platformConfig.siteName,
        siteDescription: pc?.siteDescription ?? defaultSettings.platformConfig.siteDescription,
        maintenanceMode: pc?.maintenanceMode ?? defaultSettings.platformConfig.maintenanceMode,
        allowRegistration: pc?.allowRegistration ?? defaultSettings.platformConfig.allowRegistration,
        allowTeacherRegistration:
          pc?.allowTeacherRegistration ?? defaultSettings.platformConfig.allowTeacherRegistration,
        defaultLanguage: pc?.defaultLanguage ?? defaultSettings.platformConfig.defaultLanguage,
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
