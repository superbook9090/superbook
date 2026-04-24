import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';
import { logApiError, type LogContext } from '@/lib/logger';
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
      console.log(`✅ Redis Cache HIT: ${cacheKey}`);
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    console.log(`❌ Redis Cache MISS: ${cacheKey}`);

    await dbConnect();

    const settings = await AppSettings.findOne().lean();

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
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
      };

      // Cache default settings
      await setCachedData(cacheKey, defaultSettings, 300); // 5 minutes
      console.log(`✅ Redis Cache SET: ${cacheKey}`);

      return NextResponse.json(defaultSettings, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }

    // Cache the settings
    await setCachedData(cacheKey, settings, 300); // 5 minutes
    console.log(`✅ Redis Cache SET: ${cacheKey}`);

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
