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
      className="sm:hidden flex flex-col gap-2.5"
    >
      {users.map((user, index) => (
        <motion.div
          key={user._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.05 }}
          className="bg-[var(--card-solid)] rounded-xl p-3 border border-[var(--border)] cursor-pointer hover:bg-[var(--color-surface-muted)] transition-colors"
          onClick={() => handleOpenUserDetail(user)}
        >
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-[var(--info-light)] text-[var(--info)]">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--color-foreground)]">{user.name}</p>
                <p className="text-xs text-[var(--color-muted-foreground)] flex items-center mt-0.5">
                  <Mail className="w-3 h-3 mr-1 shrink-0" />
                  <span className="truncate">{user.email}</span>
                </p>
              </div>
            </div>
            <span className="text-[11px] px-2 py-0.5 bg-[var(--info-light)] text-[var(--info)] font-semibold rounded-full capitalize shrink-0">{user.role}</span>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted-foreground)]">{t('adminUsers.organization')}</span>
              <div className="flex items-center gap-1.5">
                {user.organizationId ? (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[var(--info)]" />
                    <span className="text-xs sm:text-sm font-medium text-[var(--color-foreground)]">
                      {organizations.find(org => org._id === user.organizationId)?.name || user.organizationId}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-[var(--color-muted-foreground)]">{t('common.none')}</span>
                )}
              </div>
            </div>

            {user.role === 'teacher' && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--color-muted-foreground)]">{t('adminUsers.limits')}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[var(--color-foreground)]">
                    C: {user.limits?.courses || '-'} | Q: {user.limits?.quizzes || '-'} | B: {user.limits?.blogs || '-'}
                  </span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-muted-foreground)]">{t('admin.joined')}</span>
              <div className="flex items-center text-xs text-[var(--color-muted-foreground)]">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                {formatDate(user.createdAt)}
              </div>
            </div>

            <div className="pt-1.5 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--info)] font-semibold">{t('adminUsers.tapForDetails')}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
