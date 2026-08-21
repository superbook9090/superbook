// Cached AppSettings fetch for server routes and helpers

import { cache } from 'react';
import dbConnect from '@/lib/db';
import { AppSettings } from '@/models';
import type { IAppSettings } from '@/models/AppSettings';

const DEFAULT_SETTINGS = {
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
    enableGoogleAdsense: true,
  },
  platformConfig: {
    siteName: 'Quiz Do',
    siteDescription: 'A comprehensive learning platform',
    maintenanceMode: false,
    allowRegistration: true,
    allowTeacherRegistration: true,
    defaultLanguage: 'en',
  },
};

export const getSettingsWithDefaults = cache(async (): Promise<IAppSettings> => {
  await dbConnect();
  const settings = (await AppSettings.findOne().lean()) as IAppSettings | null;

  if (settings) {
    return {
      ...DEFAULT_SETTINGS,
      ...settings,
      teacherLimits: {
        ...DEFAULT_SETTINGS.teacherLimits,
        ...(settings.teacherLimits || {}),
      },
      notesLimits: {
        ...DEFAULT_SETTINGS.notesLimits,
        ...(settings.notesLimits || {}),
      },
      featureToggles: {
        ...DEFAULT_SETTINGS.featureToggles,
        ...(settings.featureToggles || {}),
      },
      platformConfig: {
        ...DEFAULT_SETTINGS.platformConfig,
        ...(settings.platformConfig || {}),
      },
    } as unknown as IAppSettings;
  }

  return DEFAULT_SETTINGS as unknown as IAppSettings;
});
