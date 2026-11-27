import { validateObjectId } from '@/lib/sanitize';
import { AdminAuthResult } from './adminAuth';
import {
  ORG_LIMIT_KEYS,
  ORG_PERMISSION_KEYS,
  type OrganizationPolicy,
} from './orgPolicy';

interface UserTargetDoc {
  _id: unknown;
  role?: string;
  organizationId?: unknown;
  limits?: Partial<Record<(typeof ORG_LIMIT_KEYS)[number], number>>;
}

const ADMIN_ALLOWED_UPDATE_KEYS = new Set<string>([
  'role',
  'isSuspended',
  'suspendedReason',
  'canUploadVideos',
  'canCreatePublicCourses',
  'canCreateContests',
  'canGenerateAiQuizzes',
  'limits',
]);

const SUPERADMIN_ONLY_UPDATE_KEYS = new Set<string>(['organizationId', 'name']);

const VALID_USER_ROLES = new Set(['student', 'teacher', 'admin', 'superadmin']);

const ORG_LIMIT_KEY_SET = new Set<string>(ORG_LIMIT_KEYS);

const PERMISSION_LABELS: Record<(typeof ORG_PERMISSION_KEYS)[number], string> = {
  canUploadVideos: 'video upload permission',
  canCreatePublicCourses: 'public course creation permission',
  canCreateContests: 'contest creation permission',
  canGenerateAiQuizzes: 'AI quiz generation permission',
};

const LIMIT_LABELS: Record<(typeof ORG_LIMIT_KEYS)[number], string> = {
  courses: 'Courses',
  quizzes: 'Quizzes',
  blogs: 'Blogs',
  aiQuizGenerations: 'AI Quiz Generations',
  aiQuizMaxQuestions: 'AI Quiz Max Questions',
};

export function validateUserUpdate(
  targetUser: UserTargetDoc,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updates: Record<string, any>,
  sessionUserId: string,
  authResult: AdminAuthResult,
  orgPolicy?: OrganizationPolicy | null
): { error?: string; status?: number; sanitizedUpdates?: Record<string, unknown> } {
  const userId = String(targetUser._id);

  if (!updates || typeof updates !== 'object' || Array.isArray(updates)) {
    return { error: 'Updates must be an object', status: 400 };
  }

  // Require valid organizationId for non-superadmin callers (never fall back to null)
  if (!authResult.isSuperAdmin) {
    if (!authResult.organizationId || !validateObjectId(String(authResult.organizationId))) {
      return { error: 'Admin must belong to a valid organization', status: 403 };
    }
    const targetOrgId = targetUser.organizationId?.toString();
    if (!targetOrgId || targetOrgId !== authResult.organizationId.toString()) {
      return { error: 'You can only update users from your organization', status: 403 };
    }
  }

  // Strict allowlist & key safety check (prevent mass assignment & Mongo operator/dot injection)
  const updateKeys = Object.keys(updates);
  if (updateKeys.length === 0) {
    return { error: 'No valid update fields provided', status: 400 };
  }

  const allowedKeys = authResult.isSuperAdmin
    ? new Set<string>([...ADMIN_ALLOWED_UPDATE_KEYS, ...SUPERADMIN_ONLY_UPDATE_KEYS])
    : ADMIN_ALLOWED_UPDATE_KEYS;

  for (const key of updateKeys) {
    if (key.includes('.') || key.includes('$')) {
      return { error: `Invalid update field: ${key}`, status: 400 };
    }
    if (!allowedKeys.has(key)) {
      return { error: `Field "${key}" is not allowed`, status: 400 };
    }
  }

  // Prevent changing own role
  if (userId === sessionUserId && updates.role !== undefined && updates.role !== targetUser.role) {
    return { error: 'Cannot change your own role', status: 400 };
  }

  // Prevent suspending self
  if (userId === sessionUserId && updates.isSuspended) {
    return { error: 'Cannot suspend your own account', status: 400 };
  }

  // Block org admin from modifying ANY admin or superadmin account
  if (!authResult.isSuperAdmin && (targetUser.role === 'admin' || targetUser.role === 'superadmin')) {
    return { error: 'Only super admins can modify admin or super admin accounts', status: 403 };
  }

  const sanitizedUpdates: Record<string, unknown> = {};

  if (updates.role !== undefined) {
    if (typeof updates.role !== 'string' || !VALID_USER_ROLES.has(updates.role)) {
      return { error: 'Invalid role value', status: 400 };
    }
    if (!authResult.isSuperAdmin && updates.role === 'superadmin') {
      return { error: 'Only super admins can assign super admin role', status: 403 };
    }
    sanitizedUpdates.role = updates.role;
  }

  if (updates.isSuspended !== undefined) {
    if (typeof updates.isSuspended !== 'boolean') {
      return { error: 'isSuspended must be a boolean', status: 400 };
    }
    sanitizedUpdates.isSuspended = updates.isSuspended;
  }

  if (updates.suspendedReason !== undefined) {
    if (updates.suspendedReason !== null && typeof updates.suspendedReason !== 'string') {
      return { error: 'suspendedReason must be a string or null', status: 400 };
    }
    if (typeof updates.suspendedReason === 'string' && updates.suspendedReason.length > 500) {
      return { error: 'suspendedReason cannot exceed 500 characters', status: 400 };
    }
    sanitizedUpdates.suspendedReason = updates.suspendedReason;
  }

  if (authResult.isSuperAdmin && updates.name !== undefined) {
    if (typeof updates.name !== 'string' || !updates.name.trim() || updates.name.trim().length > 100) {
      return { error: 'name must be between 1 and 100 characters', status: 400 };
    }
    sanitizedUpdates.name = updates.name.trim();
  }

  if (authResult.isSuperAdmin && updates.organizationId !== undefined) {
    if (updates.organizationId === null || updates.organizationId === '') {
      sanitizedUpdates.organizationId = null;
    } else if (typeof updates.organizationId === 'string' && validateObjectId(updates.organizationId)) {
      sanitizedUpdates.organizationId = updates.organizationId;
    } else {
      return { error: 'Invalid organizationId', status: 400 };
    }
  }

  // Validate teacher feature permission toggles against superadmin-granted organization permissions
  for (const key of ORG_PERMISSION_KEYS) {
    if (updates[key] !== undefined) {
      if (typeof updates[key] !== 'boolean') {
        return { error: `${key} must be a boolean`, status: 400 };
      }
      if (!authResult.isSuperAdmin && !orgPolicy?.permissions?.[key]) {
        return {
          error: `Super admin has not enabled ${PERMISSION_LABELS[key]} for your organization`,
          status: 403,
        };
      }
      sanitizedUpdates[key] = updates[key];
    }
  }

  // Validate teacher content & AI quotas against superadmin-granted organization quota ceilings
  if (updates.limits !== undefined) {
    if (updates.limits === null || typeof updates.limits !== 'object' || Array.isArray(updates.limits)) {
      return { error: 'limits must be an object', status: 400 };
    }

    for (const limitKey of Object.keys(updates.limits)) {
      if (limitKey.includes('.') || limitKey.includes('$') || !ORG_LIMIT_KEY_SET.has(limitKey)) {
        return { error: `Invalid limit field: ${limitKey}`, status: 400 };
      }
    }

    const sanitizedLimits: Partial<Record<(typeof ORG_LIMIT_KEYS)[number], number | null>> = {};

    for (const key of ORG_LIMIT_KEYS) {
      if (!Object.prototype.hasOwnProperty.call(updates.limits, key)) continue;
      const val = updates.limits[key];
      if (val === undefined) continue;
      if (val === null) {
        sanitizedLimits[key] = null;
        continue;
      }

      if (typeof val !== 'number' || !Number.isInteger(val) || val < 1) {
        return { error: `${LIMIT_LABELS[key]} limit must be a positive integer`, status: 400 };
      }
      if (key === 'aiQuizMaxQuestions' && val > 50) {
        return { error: 'AI Quiz Max Questions limit cannot exceed 50', status: 400 };
      }

      if (!authResult.isSuperAdmin) {
        const orgMax = orgPolicy?.teacherLimits?.[key];
        const unchangedExisting = targetUser.limits?.[key] === val;
        if (orgMax === undefined || orgMax === null) {
          if (!unchangedExisting) {
            return {
              error: `Super admin has not granted a custom ${LIMIT_LABELS[key].toLowerCase()} quota for your organization`,
              status: 403,
            };
          }
        } else if (val > orgMax) {
          return {
            error: `${LIMIT_LABELS[key]} limit cannot exceed your organization quota (${orgMax})`,
            status: 400,
          };
        }
      }

      sanitizedLimits[key] = val;
    }

    sanitizedUpdates.limits = sanitizedLimits;
  }

  return { sanitizedUpdates };
}

export function validateUserDeletion(
  targetUser: UserTargetDoc,
  sessionUserId: string,
  authResult: AdminAuthResult
): { error?: string; status?: number } {
  const userId = String(targetUser._id);

  // Self deletion prevention
  if (userId === sessionUserId) {
    return { error: 'Cannot delete your own account', status: 400 };
  }

  // Require valid organizationId & cross-org check for non-superadmin callers
  if (!authResult.isSuperAdmin) {
    if (!authResult.organizationId || !validateObjectId(String(authResult.organizationId))) {
      return { error: 'Admin must belong to a valid organization', status: 403 };
    }
    const targetOrgId = targetUser.organizationId?.toString();
    if (!targetOrgId || targetOrgId !== authResult.organizationId.toString()) {
      return { error: 'You can only delete users from your organization', status: 403 };
    }
  }

  // Superadmin deletion prevention
  if (targetUser.role === 'superadmin') {
    return { error: 'Super admin accounts cannot be deleted', status: 403 };
  }

  // Admin deletion by non-superadmin prevention
  if (targetUser.role === 'admin' && !authResult.isSuperAdmin) {
    return { error: 'Only super admins can delete admin accounts', status: 403 };
  }

  return {};
}
