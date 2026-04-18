import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';

// GET /api/settings - Get app settings
export async function GET() {
  try {
    await dbConnect();

    const settings = await AppSettings.findOne();

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
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { message: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}
