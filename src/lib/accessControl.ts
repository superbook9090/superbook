import mongoose from 'mongoose';

export interface AccessUser {
  _id: mongoose.Types.ObjectId;
  organizationId?: mongoose.Types.ObjectId | null;
  role: 'student' | 'teacher' | 'admin' | 'superadmin';
}

export function getAccessFilter(user: AccessUser): Record<string, unknown> {
  if (!user) return {};

  if (user.role === 'superadmin') {
    return {};
  }

  if (user.role === 'admin') {
    if (user.organizationId) {
      return { organizationId: user.organizationId };
    }

    return {
      $or: [{ organizationId: null }, { organizationId: { $exists: false } }],
    };
  }

  if (user.organizationId) {
    return {
      $or: [
        { organizationId: user.organizationId },
        { organizationId: null },
        { organizationId: { $exists: false } },
      ],
    };
  }

  return {
    $or: [{ organizationId: null }, { organizationId: { $exists: false } }],
  };
}

function checkContentAccess(
  contentOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser
): boolean {
  if (user.role === 'superadmin') {
    return true;
  }

  if (!contentOrganizationId) {
    return true;
  }

  if (!user.organizationId) {
    return false;
  }

  return user.organizationId.toString() === contentOrganizationId.toString();
}

export function validateContentAccess(
  contentOrganizationId: mongoose.Types.ObjectId | null | undefined,
  user: AccessUser,
  contentType: string = 'content'
): void {
  if (!checkContentAccess(contentOrganizationId, user)) {
    throw new Error(`You do not have permission to access this ${contentType}`);
  }
}
