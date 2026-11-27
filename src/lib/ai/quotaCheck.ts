import User from '@/models/User';
import Organization from '@/models/Organization';
import { getTeacherLimit } from '@/lib/settingsHelpers';
import { getSettingsWithDefaults } from '@/lib/dataService';
import type mongoose from 'mongoose';

export interface QuotaValidationResult {
  error?: string;
  status?: number;
  currentCount?: number;
  effectiveLimit?: number;
}

interface AiUserLean {
  limits?: {
    aiQuizGenerations?: number;
    aiQuizMaxQuestions?: number;
  };
  aiQuizGenerationsCount?: number;
  canGenerateAiQuizzes?: boolean;
  organizationId?: mongoose.Types.ObjectId | null;
  role?: string;
}

async function resolveAiGenerationAccess(
  user: AiUserLean,
  userRole: string,
  entityType: 'quiz' | 'contest' = 'quiz'
): Promise<{ allowed: boolean; error?: string }> {
  if (userRole === 'superadmin' || user.role === 'superadmin') {
    return { allowed: true };
  }

  if (user.organizationId) {
    const org = await Organization.findById(user.organizationId)
      .select('isActive permissions teacherLimits')
      .lean<{
        isActive?: boolean;
        permissions?: { canGenerateAiQuizzes?: boolean };
        teacherLimits?: { aiQuizGenerations?: number; aiQuizMaxQuestions?: number };
      }>();

    if (!org || org.isActive === false) {
      return {
        allowed: false,
        error: 'Your organization is currently inactive. Please contact an administrator.',
      };
    }

    if (org.permissions?.canGenerateAiQuizzes !== true) {
      return {
        allowed: false,
        error:
          entityType === 'contest'
            ? 'AI contest question generation is not enabled for your organization. Please contact an administrator.'
            : 'AI quiz generation is not enabled for your organization. Please contact an administrator.',
      };
    }

    if (userRole === 'admin' || user.role === 'admin') {
      return { allowed: true };
    }

    if (!user.canGenerateAiQuizzes) {
      return {
        allowed: false,
        error:
          entityType === 'contest'
            ? 'AI contest question generation is not enabled for your teacher account. Please contact an administrator to activate it.'
            : 'AI quiz generation is not enabled for your teacher account. Please contact an administrator to activate it.',
      };
    }

    return { allowed: true };
  }

  if (!user.canGenerateAiQuizzes) {
    return {
      allowed: false,
      error:
        entityType === 'contest'
          ? 'AI contest question generation is not enabled for your teacher account. Please contact an administrator to activate it.'
          : 'AI quiz generation is not enabled for your teacher account. Please contact an administrator to activate it.',
    };
  }

  return { allowed: true };
}

export async function validateTeacherAiPermissionsAndQuota(
  userId: string,
  userRole: string,
  entityType: 'quiz' | 'contest',
  numQuestions: number
): Promise<QuotaValidationResult> {
  const user = await User.findById(userId)
    .select('limits aiQuizGenerationsCount canGenerateAiQuizzes organizationId role')
    .lean<AiUserLean>();

  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  const isSuperAdmin = userRole === 'superadmin' || user.role === 'superadmin';
  const access = await resolveAiGenerationAccess(user, userRole, entityType);

  if (!access.allowed) {
    return {
      error: access.error,
      status: 403,
    };
  }

  const effectiveLimit = await getTeacherLimit('aiQuizGenerations', userId);
  const currentCount = user.aiQuizGenerationsCount ?? 0;

  if (!isSuperAdmin && currentCount >= effectiveLimit) {
    return {
      error: `You have reached your limit of ${effectiveLimit} AI generation(s). Please contact super admin to increase your quota.`,
      status: 403,
      currentCount,
      effectiveLimit,
    };
  }

  const maxAllowedQuestions =
    (await getTeacherLimit('aiQuizMaxQuestions', userId).catch(() => 10)) || 10;
  if (!isSuperAdmin && numQuestions > maxAllowedQuestions) {
    return {
      error: `Maximum ${maxAllowedQuestions} question(s) can be generated at a time. This limit is set by the administrator.`,
      status: 400,
    };
  }

  return { currentCount, effectiveLimit };
}

export async function fetchTeacherAiQuotaStatus(userId: string, userRole: string) {
  const user = await User.findById(userId)
    .select('limits aiQuizGenerationsCount canGenerateAiQuizzes organizationId role')
    .lean<AiUserLean>();

  if (!user) return null;

  const isSuperAdmin = userRole === 'superadmin' || user.role === 'superadmin';
  const access = await resolveAiGenerationAccess(user, userRole, 'quiz');

  const hasCustomMaxQuestions =
    isSuperAdmin ||
    (user.limits?.aiQuizMaxQuestions !== undefined && user.limits.aiQuizMaxQuestions !== null);

  const effectiveMaxQuestions = isSuperAdmin
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
    customMaxQuestions: hasCustomMaxQuestions ? effectiveMaxQuestions : null,
    usage: isSuperAdmin
      ? null
      : {
          used: currentCount,
          limit: effectiveGenerationsLimit,
          remaining: Math.max(0, effectiveGenerationsLimit - currentCount),
        },
    canGenerate: access.allowed,
  };
}
