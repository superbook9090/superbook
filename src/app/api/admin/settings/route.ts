import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import AppSettings from '@/models/AppSettings';

// GET /api/admin/settings - Get app settings (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can access settings' },
        { status: 403 }
      );
    }

    await dbConnect();

    let settings = await AppSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await AppSettings.create({});
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

// PATCH /api/admin/settings - Update app settings (admin only)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only admins can update settings' },
        { status: 403 }
      );
    }

    const { teacherLimits, featureToggles, platformConfig } = await req.json();

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
      settings.featureToggles = featureToggles;
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
      if (platformConfig.defaultLanguage && !['en', 'hi'].includes(platformConfig.defaultLanguage)) {
        return NextResponse.json(
          { message: 'defaultLanguage must be either en or hi' },
          { status: 400 }
        );
      }
      settings.platformConfig = { ...settings.platformConfig, ...platformConfig };
    }

    await settings.save();

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { message: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
