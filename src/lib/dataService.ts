// Cached AppSettings fetch for server routes and helpers

import { cache } from 'react';
import dbConnect from '@/lib/db';
import { AppSettings } from '@/models';
import type { IAppSettings } from '@/models/AppSettings';

export const getSettingsWithDefaults = cache(async (): Promise<IAppSettings> => {
  await dbConnect();
  const settings = (await AppSettings.findOne().lean()) as IAppSettings | null;

  if (settings) return settings;

  return {
    teacherLimits: {
      courses: 5,
      quizzes: 10,
      blogs: 2,
    },
    featureToggles: {
      enableBlogs: true,
      enableQuizzes: true,
      enableCourses: true,
      enableAnalytics: true,
    },
    platformConfig: {
      siteName: 'Quiz-Do',
      siteDescription: 'A comprehensive learning platform',
      maintenanceMode: false,
      allowRegistration: true,
      defaultLanguage: 'en',
    },
  } as unknown as IAppSettings;
});
