import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Building2, Calendar } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import type { User } from './types';

type Props = {
  users: User[];
  organizations: Array<{ _id: string; name: string }>;
  handleOpenUserDetail: (user: User) => void;
};

export function UsersTable({ users, organizations, handleOpenUserDetail }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--card-solid)] rounded-2xl shadow-sm overflow-hidden hidden sm:block"
    >
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--color-surface-muted)]">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('admin.user')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('admin.role')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('adminUsers.organization')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('adminUsers.limits')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('admin.joined')}
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">
              {t('admin.actions')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-[var(--card-solid)] divide-y divide-[var(--border)]">
          {users.map((user, index) => (
            <motion.tr
              key={user._id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
              onClick={() => handleOpenUserDetail(user)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-[var(--info-light)] text-[var(--info)] mr-3">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)] flex items-center">
                      <Mail className="w-3 h-3 mr-1" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-[var(--color-foreground)] capitalize">{user.role}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {user.organizationId ? (
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[var(--info)]" />
                      <span className="text-sm text-[var(--color-foreground)]">
                        {organizations.find(org => org._id === user.organizationId)?.name || user.organizationId}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-[var(--color-muted-foreground)]">{t('common.none')}</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {user.role === 'teacher' ? (
                  <span className="text-sm text-[var(--color-foreground)]">
                    C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                  </span>
                ) : (
                  <span className="text-sm text-[var(--color-muted-foreground)]">-</span>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-[var(--color-muted-foreground)] flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4">
                <span className="text-sm text-[var(--info)] font-medium">{t('adminUsers.viewDetails')}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
