import AppSettings from '@/models/AppSettings';
import { NextResponse } from 'next/server';

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
}

interface TeacherLimits {
  courses: number;
  quizzes: number;
  blogs: number;
}

interface PlatformConfig {
  siteName: string;
  siteDescription: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultLanguage: 'en' | 'hi';
}

/**
 * Check if a feature is enabled
 * @param feature - The feature to check
 * @returns true if enabled, false if disabled
 * @throws Error if feature is disabled (returns 403 response)
 */
export async function checkFeature(feature: keyof FeatureToggles): Promise<boolean> {
  const settings = await AppSettings.findOne();
  if (!settings?.featureToggles?.[feature]) {
    return false;
  }
  return true;
}

/**
 * Check if a feature is enabled and return 403 if disabled
 * @param feature - The feature to check
 * @returns NextResponse with 403 if disabled, or null if enabled
 */
export async function requireFeature(feature: keyof FeatureToggles): Promise<NextResponse | null> {
  const settings = await AppSettings.findOne();
  if (!settings?.featureToggles?.[feature]) {
    return NextResponse.json(
      { message: `${feature} feature is disabled by admin` },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Check if maintenance mode is enabled
 * @returns true if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await AppSettings.findOne();
  return settings?.platformConfig?.maintenanceMode ?? false;
}

/**
 * Check if registration is allowed
 * @returns true if registration is allowed
 */
export async function isRegistrationAllowed(): Promise<boolean> {
  const settings = await AppSettings.findOne();
  return settings?.platformConfig?.allowRegistration ?? true;
}

/**
 * Get teacher limit for a specific content type
 * @param type - The content type (courses, quizzes, blogs)
 * @returns The limit for the content type
 */
export async function getTeacherLimit(type: keyof TeacherLimits): Promise<number> {
  const settings = await AppSettings.findOne();
  return settings?.teacherLimits?.[type] ?? 10;
}

/**
 * Check if teacher has reached the limit for a content type
 * @param type - The content type (courses, quizzes, blogs)
 * @param currentCount - The current count of items
 * @returns NextResponse with 403 if limit reached, or null if under limit
 */
export async function checkTeacherLimit(
  type: keyof TeacherLimits,
  currentCount: number
): Promise<NextResponse | null> {
  const limit = await getTeacherLimit(type);
  if (currentCount >= limit) {
    return NextResponse.json(
      { message: `You have reached your ${type} limit (${limit}). Please delete some ${type} or contact admin.` },
      { status: 403 }
    );
  }
  return null;
}

/**
 * Get platform configuration
 * @returns The platform configuration
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  const settings = await AppSettings.findOne();
  return settings?.platformConfig ?? {
    maintenanceMode: false,
    allowRegistration: true,
    defaultLanguage: 'en',
  };
}
