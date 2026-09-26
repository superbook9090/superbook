'use client';

import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="antigravity-glass rounded-3xl border border-[var(--border)] shadow-lg overflow-hidden hidden sm:block"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--surface-muted)]/70">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.user')}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.role')}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminAnalytics.platform')}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.lastOpened')}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.organization')}
              </th>
              <th className="px-5 py-4 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.capabilitiesAndLimits')}
              </th>
              <th className="px-5 py-4 text-right text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
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
    </motion.div>
  );
}
