import User from '@/models/User';
import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { getSettingsWithDefaults } from './dataService';

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
  enableQuizSolutionAnalysis: boolean;
}

interface TeacherLimits {
  courses: number;
  quizzes: number;
  blogs: number;
}

export async function isFeatureEnabled(feature: keyof FeatureToggles): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
  return Boolean(settings?.featureToggles?.[feature]);
}

/** Server component helper — redirects to home when a feature is disabled. */
export async function ensureFeatureEnabled(feature: keyof FeatureToggles): Promise<void> {
  if (!(await isFeatureEnabled(feature))) {
    redirect(ROUTES.home);
  }
}

/**
 * Check if a feature is enabled and return 403 if disabled
 */
export async function requireFeature(feature: keyof FeatureToggles): Promise<NextResponse | null> {
  const settings = await getSettingsWithDefaults();
  if (!settings?.featureToggles?.[feature]) {
    return NextResponse.json(
      { message: `${feature} feature is disabled by admin` },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if registration is allowed
 */
export async function isRegistrationAllowed(): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
  return settings?.platformConfig?.allowRegistration ?? true;
}

export async function isTeacherRegistrationAllowed(): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
  return settings?.platformConfig?.allowTeacherRegistration ?? true;
}

/**
 * Teacher content limit (per-user override from User.limits, else global settings)
 */
export async function getTeacherLimit(type: keyof TeacherLimits, userId?: string): Promise<number> {
  if (userId) {
    const user = await User.findById(userId);
    if (user?.limits?.[type]) {
      return user.limits[type];
    }
  }
  const settings = await getSettingsWithDefaults();
  return settings?.teacherLimits?.[type] ?? 10;
}

/**
 * Returns 403 if teacher is at or over the limit for the given content type
 */
export async function checkTeacherLimit(
  type: keyof TeacherLimits,
  currentCount: number,
  userId?: string
): Promise<NextResponse | null> {
  const limit = await getTeacherLimit(type, userId);
  if (currentCount >= limit) {
    return NextResponse.json(
      { message: `You have reached your ${type} limit (${limit}). Please delete some ${type} or contact admin.` },
      { status: 403 }
    );
  }
  return null;
}
