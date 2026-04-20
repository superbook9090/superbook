import User from '@/models/User';
import { NextResponse } from 'next/server';
import { getSettingsWithDefaults as getDataServiceSettings } from './dataService';
import type { IAppSettings } from '@/models/AppSettings';

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
 * Get settings with defaults using centralized data service
 * @returns AppSettings document with defaults
 */
async function getSettingsWithDefaults(): Promise<IAppSettings> {
  return getDataServiceSettings();
}

/**
 * Invalidate settings cache (call after updating settings)
 * Note: This is a no-op now since we use React cache() in dataService
 * Cache is automatically invalidated per request
 */
export function invalidateSettingsCache(): void {
  // No-op - React cache() handles this automatically per request
}

/**
 * Check if a feature is enabled
 * @param feature - The feature to check
 * @returns true if enabled, false if disabled
 * @throws Error if feature is disabled (returns 403 response)
 */
export async function checkFeature(feature: keyof FeatureToggles): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
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
 * Check if maintenance mode is enabled
 * @returns true if maintenance mode is enabled
 */
export async function isMaintenanceMode(): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
  return settings?.platformConfig?.maintenanceMode ?? false;
}

/**
 * Check if registration is allowed
 * @returns true if registration is allowed
 */
export async function isRegistrationAllowed(): Promise<boolean> {
  const settings = await getSettingsWithDefaults();
  return settings?.platformConfig?.allowRegistration ?? true;
}

/**
 * Get teacher limit for a specific content type
 * @param type - The content type (courses, quizzes, blogs)
 * @param userId - The user ID to check for custom limits (optional)
 * @returns The limit for the content type
 */
export async function getTeacherLimit(type: keyof TeacherLimits, userId?: string): Promise<number> {
  // If userId is provided, check for user-specific limits first
  if (userId) {
    const user = await User.findById(userId);
    if (user?.limits?.[type]) {
      return user.limits[type];
    }
  }
  // Fallback to global limits
  const settings = await getSettingsWithDefaults();
  return settings?.teacherLimits?.[type] ?? 10;
}

/**
 * Check if teacher has reached the limit for a content type
 * @param type - The content type (courses, quizzes, blogs)
 * @param currentCount - The current count of items
 * @param userId - The user ID to check for custom limits (optional)
 * @returns NextResponse with 403 if limit reached, or null if under limit
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

/**
 * Get platform configuration
 * @returns The platform configuration
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  const settings = await getSettingsWithDefaults();
  return settings?.platformConfig as PlatformConfig;
}
