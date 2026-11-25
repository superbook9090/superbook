'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { User } from './types';
import { UsersTableRow } from './UsersTableRow';

type Props = {
  users: User[];
  organizations: Array<{ _id: string; name: string }>;
  handleOpenUserDetail: (user: User) => void;
  handleDeleteClick?: (userId: string) => void;
};

export function UsersTable({
  users,
  organizations,
  handleOpenUserDetail,
  handleDeleteClick,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className="teacher-panel overflow-hidden hidden sm:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--surface-muted)]/75">
            <tr>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminAnalytics.platform')}
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.lastOpened')}
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.organization')}
              </th>
              <th className="px-5 py-3.5 text-left text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.capabilitiesAndLimits')}
              </th>
              <th className="px-5 py-3.5 text-right text-[11px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/60">
            {users.map((user, index) => (
              <UsersTableRow
                key={user._id}
                user={user}
                index={index}
                organizations={organizations}
                onOpenDetail={handleOpenUserDetail}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
