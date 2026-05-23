import User, { type IUser } from '@/models/User';
import type { FilterQuery } from 'mongoose';

/** Escape special regex characters in an email for case-insensitive exact match. */
function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Case-insensitive lookup — DB may store mixed-case emails from older registrations. */
export function emailFilterCaseInsensitive(email: string): FilterQuery<IUser> {
  const trimmed = email.trim();
  if (!trimmed) {
    return { email: '' };
  }
  return { email: { $regex: new RegExp(`^${escapeRegex(trimmed)}$`, 'i') } };
}

export function findUserByEmail(email: string) {
  return User.findOne(emailFilterCaseInsensitive(email));
}
