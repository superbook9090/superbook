import type { Types } from 'mongoose';
import Organization from '@/models/Organization';
import { generateTeacherInviteCode } from '@/lib/inviteCode';

export type RegistrableRole = 'student' | 'teacher';

export function sanitizeRegistrationRole(rawRole: unknown): RegistrableRole | null {
  if (rawRole === undefined || rawRole === null || rawRole === '') {
    return 'student';
  }
  if (rawRole === 'student' || rawRole === 'teacher') {
    return rawRole;
  }
  return null;
}

export interface ResolvedOrgInvite {
  organization: {
    _id: Types.ObjectId;
    name: string;
    logo?: string | null;
    primaryColor?: string | null;
    website?: string | null;
    tagline?: string | null;
    inviteCode: string;
    teacherInviteCode?: string | null;
    description?: string | null;
  };
  inviteRole: RegistrableRole;
}

export type ResolveInviteResult =
  | { ok: true; data: ResolvedOrgInvite }
  | { ok: false; message: string; status: 400 | 403 };

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolves an organization invite code (student `inviteCode`/`code` or `teacherInviteCode`)
 * against active organizations and validates whether the requested role is permitted.
 */
export async function resolveOrganizationInvite(
  rawCode: string,
  requestedRole: RegistrableRole
): Promise<ResolveInviteResult> {
  const trimmedCode = rawCode.trim();
  if (!trimmedCode || trimmedCode.length > 64) {
    return { ok: false, message: 'Invalid invite code', status: 400 };
  }

  const regex = new RegExp(`^${escapeRegex(trimmedCode)}$`, 'i');
  const org = await Organization.findOne({
    $or: [{ inviteCode: regex }, { teacherInviteCode: regex }, { code: regex }],
    isActive: true,
  })
    .select('_id name logo primaryColor website tagline inviteCode teacherInviteCode description')
    .lean<{
      _id: Types.ObjectId;
      name: string;
      logo?: string | null;
      primaryColor?: string | null;
      website?: string | null;
      tagline?: string | null;
      inviteCode: string;
      teacherInviteCode?: string | null;
      description?: string | null;
    }>();

  if (!org) {
    return { ok: false, message: 'Invalid or inactive invite code', status: 400 };
  }

  const isTeacherCodeMatch =
    Boolean(org.teacherInviteCode) &&
    org.teacherInviteCode!.toLowerCase() === trimmedCode.toLowerCase();
  const inviteRole: RegistrableRole = isTeacherCodeMatch ? 'teacher' : 'student';

  if (requestedRole === 'teacher' && inviteRole !== 'teacher') {
    return {
      ok: false,
      message: 'A teacher invite code is required to register as a teacher for this organization.',
      status: 403,
    };
  }

  return {
    ok: true,
    data: {
      organization: org,
      inviteRole,
    },
  };
}

/**
 * Generates a unique teacherInviteCode and persists it onto an existing organization
 * that was created before teacherInviteCode existed.
 */
export async function ensureTeacherInviteCode(orgId: Types.ObjectId | string): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = generateTeacherInviteCode();
    const exists = await Organization.exists({ teacherInviteCode: candidate });
    if (!exists) {
      const updated = await Organization.findOneAndUpdate(
        { _id: orgId, $or: [{ teacherInviteCode: { $exists: false } }, { teacherInviteCode: null }, { teacherInviteCode: '' }] },
        { $set: { teacherInviteCode: candidate } },
        { new: true }
      )
        .select('teacherInviteCode')
        .lean<{ teacherInviteCode?: string }>();
      if (updated?.teacherInviteCode) {
        return updated.teacherInviteCode;
      }
      const existing = await Organization.findById(orgId)
        .select('teacherInviteCode')
        .lean<{ teacherInviteCode?: string }>();
      if (existing?.teacherInviteCode) {
        return existing.teacherInviteCode;
      }
    }
  }
  return generateTeacherInviteCode();
}
