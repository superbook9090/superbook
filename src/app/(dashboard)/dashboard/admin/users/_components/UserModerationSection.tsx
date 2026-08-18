'use client';

import React from 'react';
import { UserX, Trash2, AlertTriangle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import type { User } from './types';

interface UserModerationSectionProps {
  user: User;
  currentUserId?: string | null;
  currentUserRole?: string | null;
  onToggleSuspend: (isSuspended: boolean) => void;
  onDeleteClick: (userId: string) => void;
  isSuspending?: boolean;
}

export function UserModerationSection({
  user,
  currentUserId,
  currentUserRole,
  onToggleSuspend,
  onDeleteClick,
  isSuspending,
}: UserModerationSectionProps) {
  const { t } = useTranslation();

  const isSelf = user._id === currentUserId;
  const isSuperAdminUser = user.role === 'superadmin';
  const isTargetAdmin = user.role === 'admin';
  const isActorSuperAdmin = currentUserRole === 'superadmin';

  // Suspension restrictions:
  // Cannot suspend self; cannot suspend admin unless actor is superadmin; cannot suspend superadmin
  const canSuspend = !isSelf && !isSuperAdminUser && (!isTargetAdmin || isActorSuperAdmin);

  // Deletion restrictions:
  // Cannot delete self; cannot delete superadmin; cannot delete admin unless actor is superadmin
  const canDelete = !isSelf && !isSuperAdminUser && (!isTargetAdmin || isActorSuperAdmin);

  return (
    <div className="flex flex-col gap-3">
      {/* Moderation & Account Status */}
      <div className="p-4 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                user.isSuspended
                  ? 'bg-[var(--error-light)] text-[var(--error)]'
                  : 'bg-[var(--warning-light)] text-[var(--warning)]'
              }`}
            >
              <UserX className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)]">
                {user.isSuspended
                  ? t('adminUsers.unsuspendUser') || 'Unsuspend Account'
                  : t('adminUsers.suspendUser') || 'Suspend User Account'}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] mt-0.5">
                {user.isSuspended
                  ? 'Reactivate account to restore user login and access.'
                  : t('adminUsers.suspendUserDesc') || 'Block user from signing in and accessing resources.'}
              </p>
            </div>
          </div>

          <label
            className={`relative inline-flex items-center shrink-0 ${
              canSuspend ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
            }`}
          >
            <input
              type="checkbox"
              checked={Boolean(user.isSuspended)}
              disabled={!canSuspend || isSuspending}
              onChange={() => onToggleSuspend(!user.isSuspended)}
              className="sr-only peer"
            />
            <div className="w-10 h-5.5 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[var(--error)]" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="p-4 rounded-xl border border-[var(--error)]/25 bg-[var(--error-light)]/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[var(--error)] shrink-0 mt-0.5" />
            <div>
              <p className="text-xs sm:text-sm font-bold text-[var(--error)]">
                {t('adminUsers.dangerZone') || 'Danger Zone'}
              </p>
              <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)]">
                {t('adminUsers.deleteUserDesc') || 'Permanently delete this user account.'}
              </p>
            </div>
          </div>

          <Button
            onClick={() => onDeleteClick(user._id)}
            disabled={!canDelete}
            variant="danger"
            size="sm"
            className="w-full sm:w-auto flex items-center justify-center gap-2 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t('admin.delete') || 'Delete User'}</span>
          </Button>
        </div>

        {isSuperAdminUser && (
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-2 italic">
            {t('adminUsers.superAdminCannotDelete') || 'Super admin accounts cannot be deleted.'}
          </p>
        )}
      </div>
    </div>
  );
}
