import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';
import { updateSettingsSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
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

    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Only admins can access settings' },
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

    if (session.user.role !== 'admin' && session.user.role !== 'superadmin') {
      return NextResponse.json(
        { message: 'Only admins can update settings' },
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

    const { teacherLimits, featureToggles, platformConfig } = validationResult.data;

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
      settings.teacherLimits = teacherLimits;
    }

    // Update feature toggles if provided
    if (featureToggles) {
      if (typeof featureToggles.enableBlogs !== 'boolean') {
        return NextResponse.json(
          { message: 'enableBlogs must be a boolean' },
          { status: 400 }
        );
      }
      if (typeof featureToggles.enableQuizzes !== 'boolean') {
        return NextResponse.json(
          { message: 'enableQuizzes must be a boolean' },
          { status: 400 }
        );
      }
      if (typeof featureToggles.enableCourses !== 'boolean') {
        return NextResponse.json(
          { message: 'enableCourses must be a boolean' },
          { status: 400 }
        );
      }
      if (typeof featureToggles.enableAnalytics !== 'boolean') {
        return NextResponse.json(
          { message: 'enableAnalytics must be a boolean' },
          { status: 400 }
        );
      }
      if (
        featureToggles.enableQuizSolutionAnalysis !== undefined &&
        typeof featureToggles.enableQuizSolutionAnalysis !== 'boolean'
      ) {
        return NextResponse.json(
          { message: 'enableQuizSolutionAnalysis must be a boolean' },
          { status: 400 }
        );
      }

      const existingToggles = settings.featureToggles ?? {};
      const mergedToggles = {
        ...existingToggles,
        enableBlogs: featureToggles.enableBlogs,
        enableQuizzes: featureToggles.enableQuizzes,
        enableCourses: featureToggles.enableCourses,
        enableAnalytics: featureToggles.enableAnalytics,
        enableQuizSolutionAnalysis:
          isSuperAdmin(session.user.role) && featureToggles.enableQuizSolutionAnalysis !== undefined
            ? featureToggles.enableQuizSolutionAnalysis
            : (existingToggles.enableQuizSolutionAnalysis ?? false),
      };

      settings.featureToggles = mergedToggles;
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

    // Revalidate cache after updating settings
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
