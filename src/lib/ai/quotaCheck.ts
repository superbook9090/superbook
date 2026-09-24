import User from '@/models/User';
import { getTeacherLimit } from '@/lib/settingsHelpers';
import { getSettingsWithDefaults } from '@/lib/dataService';

export interface QuotaValidationResult {
  error?: string;
  status?: number;
  currentCount?: number;
  effectiveLimit?: number;
}

export async function validateTeacherAiPermissionsAndQuota(
  userId: string,
  userRole: string,
  entityType: 'quiz' | 'contest',
  numQuestions: number
): Promise<QuotaValidationResult> {
  const user = await User.findById(userId)
    .select('limits aiQuizGenerationsCount canGenerateAiQuizzes canCreateContests role')
    .lean();

  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  const isSuperOrAdmin = userRole === 'superadmin' || userRole === 'admin';
  const hasContestPermission = entityType === 'contest' && Boolean(user.canCreateContests);

  if (!isSuperOrAdmin && !user.canGenerateAiQuizzes && !hasContestPermission) {
    return {
      error:
        entityType === 'contest'
          ? 'AI contest question generation is not enabled for your teacher account. Please contact an administrator to activate it.'
          : 'AI quiz generation is not enabled for your teacher account. Please contact an administrator to activate it.',
      status: 403,
    };
  }

  const effectiveLimit = await getTeacherLimit('aiQuizGenerations', userId);
  const currentCount = user.aiQuizGenerationsCount ?? 0;

  if (!isSuperOrAdmin && currentCount >= effectiveLimit) {
    return {
      error: `You have reached your limit of ${effectiveLimit} AI generation(s). Please contact super admin to increase your quota.`,
      status: 403,
      currentCount,
      effectiveLimit,
    };
  }

  const maxAllowedQuestions =
    (await getTeacherLimit('aiQuizMaxQuestions', userId).catch(() => 10)) || 10;
  if (!isSuperOrAdmin && numQuestions > maxAllowedQuestions) {
    return {
      error: `Maximum ${maxAllowedQuestions} question(s) can be generated at a time. This limit is set by the administrator.`,
      status: 400,
    };
  }

  return { currentCount, effectiveLimit };
}

export async function fetchTeacherAiQuotaStatus(userId: string, userRole: string) {
  const user = await User.findById(userId)
    .select('limits aiQuizGenerationsCount canGenerateAiQuizzes canCreateContests role')
    .lean();

  if (!user) return null;

  const isSuperOrAdmin = userRole === 'superadmin' || userRole === 'admin';
  const hasCustomMaxQuestions =
    isSuperOrAdmin ||
    (user.limits?.aiQuizMaxQuestions !== undefined && user.limits.aiQuizMaxQuestions !== null);

  const effectiveMaxQuestions = isSuperOrAdmin
    ? 50
    : await getTeacherLimit('aiQuizMaxQuestions', userId).catch(() => 10);

  const effectiveGenerationsLimit = await getTeacherLimit('aiQuizGenerations', userId).catch(() => 5);
  const currentCount = user.aiQuizGenerationsCount ?? 0;

  const settings = await getSettingsWithDefaults();
  const globalMaxQuestions = settings?.teacherLimits?.aiQuizMaxQuestions ?? 10;

  return {
    maxQuestions: effectiveMaxQuestions,
    globalMaxQuestions,
    hasCustomMaxQuestions,
    customMaxQuestions: hasCustomMaxQuestions ? user.limits?.aiQuizMaxQuestions : null,
    usage: isSuperOrAdmin
      ? null
      : {
          used: currentCount,
          limit: effectiveGenerationsLimit,
          remaining: Math.max(0, effectiveGenerationsLimit - currentCount),
        },
    canGenerate:
      isSuperOrAdmin || Boolean(user.canGenerateAiQuizzes) || Boolean(user.canCreateContests),
  };
}
