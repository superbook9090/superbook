import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';
import { logApiError, type LogContext } from '@/lib/logger';

// GET /api/settings - Get app settings
export async function GET() {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/settings',
  };

  try {
    await dbConnect();

    const settings = await AppSettings.findOne().lean();

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
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
          siteName: 'Super Book',
          siteDescription: 'Learning Management System',
          maintenanceMode: false,
          allowRegistration: true,
          defaultLanguage: 'en',
        },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    return NextResponse.json(settings, {
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
