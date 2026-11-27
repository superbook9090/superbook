export interface OrganizationPermissions {
  canUploadVideos?: boolean;
  canCreatePublicCourses?: boolean;
  canCreateContests?: boolean;
  canGenerateAiQuizzes?: boolean;
}

export interface OrganizationTeacherLimits {
  courses?: number;
  quizzes?: number;
  blogs?: number;
  aiQuizGenerations?: number;
  aiQuizMaxQuestions?: number;
}

export interface OrganizationPolicy {
  permissions?: OrganizationPermissions;
  teacherLimits?: OrganizationTeacherLimits;
}

export const ORG_PERMISSION_KEYS = [
  'canUploadVideos',
  'canCreatePublicCourses',
  'canCreateContests',
  'canGenerateAiQuizzes',
] as const;

export const ORG_LIMIT_KEYS = [
  'courses',
  'quizzes',
  'blogs',
  'aiQuizGenerations',
  'aiQuizMaxQuestions',
] as const;

export type OrgPermissionKey = (typeof ORG_PERMISSION_KEYS)[number];
export type OrgLimitKey = (typeof ORG_LIMIT_KEYS)[number];

export function sanitizeOrganizationPermissions(
  raw: unknown
): { value?: OrganizationPermissions; error?: string } {
  if (raw === undefined) return {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'permissions must be an object' };
  }

  const input = raw as Record<string, unknown>;
  const value: OrganizationPermissions = {};
  for (const key of ORG_PERMISSION_KEYS) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'boolean') {
        return { error: `permissions.${key} must be a boolean` };
      }
      value[key] = input[key] as boolean;
    }
  }
  return { value };
}

export function sanitizeOrganizationTeacherLimits(
  raw: unknown
): { value?: OrganizationTeacherLimits; error?: string } {
  if (raw === undefined) return {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return { error: 'teacherLimits must be an object' };
  }

  const input = raw as Record<string, unknown>;
  const value: OrganizationTeacherLimits = {};

  for (const key of ORG_LIMIT_KEYS) {
    const item = input[key];
    if (item === undefined || item === null || item === '') {
      value[key] = undefined;
      continue;
    }
    const parsed = typeof item === 'number' ? item : Number(item);
    if (!Number.isInteger(parsed) || parsed < 1) {
      return { error: `teacherLimits.${key} must be a positive integer` };
    }
    if (key === 'aiQuizMaxQuestions' && parsed > 50) {
      return { error: 'teacherLimits.aiQuizMaxQuestions cannot exceed 50' };
    }
    value[key] = parsed;
  }

  return { value };
}

export function normalizeOrganizationPolicy(
  raw?: {
    permissions?: OrganizationPermissions | null;
    teacherLimits?: OrganizationTeacherLimits | null;
  } | null
): OrganizationPolicy {
  const permissions: OrganizationPermissions = {
    canUploadVideos: Boolean(raw?.permissions?.canUploadVideos),
    canCreatePublicCourses: Boolean(raw?.permissions?.canCreatePublicCourses),
    canCreateContests: Boolean(raw?.permissions?.canCreateContests),
    canGenerateAiQuizzes: Boolean(raw?.permissions?.canGenerateAiQuizzes),
  };

  const teacherLimits: OrganizationTeacherLimits = {};
  for (const key of ORG_LIMIT_KEYS) {
    const val = raw?.teacherLimits?.[key];
    if (typeof val === 'number' && Number.isFinite(val) && val >= 1) {
      teacherLimits[key] = val;
    }
  }

  return { permissions, teacherLimits };
}
