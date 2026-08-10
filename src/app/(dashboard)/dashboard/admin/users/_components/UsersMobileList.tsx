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

export function UsersMobileList({ users, organizations, handleOpenUserDetail }: Props) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="sm:hidden flex flex-col gap-4"
    >
      {users.map((user, index) => (
        <motion.div
          key={user._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          className="bg-[var(--card-solid)] rounded-2xl p-4 border border-[var(--border)] cursor-pointer hover:bg-[var(--color-surface-muted)] transition-colors"
          onClick={() => handleOpenUserDetail(user)}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[var(--info-light)] text-[var(--info)]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--color-foreground)]">{user.name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] flex items-center">
                  <Mail className="w-3 h-3 mr-1" />
                  {user.email}
                </p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 bg-[var(--info-light)] text-[var(--info)] rounded-full capitalize">{user.role}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted-foreground)]">{t('adminUsers.organization')}</span>
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
            </div>

            {user.role === 'teacher' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-foreground)]">{t('adminUsers.limits')}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-foreground)]">
                    C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted-foreground)]">{t('admin.joined')}</span>
              <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border)]">
              <span className="text-xs text-[var(--info)] font-medium">{t('adminUsers.tapForDetails')}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
