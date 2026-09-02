'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  ChevronRight,
  UserX,
  Shield,
  Smartphone,
  Globe,
  Clock,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, getRelativeTime } from '@/lib/dateUtils';
import type { User } from './types';

type Props = {
  users: User[];
  organizations: Array<{ _id: string; name: string }>;
  handleOpenUserDetail: (user: User) => void;
};

const roleBadgeConfig: Record<string, { bg: string; text: string }> = {
  superadmin: {
    bg: 'bg-purple-500/15',
    text: 'text-purple-600 dark:text-purple-400',
  },
  admin: {
    bg: 'bg-indigo-500/15',
    text: 'text-indigo-600 dark:text-indigo-400',
  },
  teacher: {
    bg: 'bg-[var(--teacher-soft)]',
    text: 'text-[var(--teacher-primary)]',
  },
  student: {
    bg: 'bg-[var(--student-soft)]',
    text: 'text-[var(--student-primary)]',
  },
};

export function UsersMobileList({ users, organizations, handleOpenUserDetail }: Props) {
  const { t } = useTranslation();

  const getInitials = (name?: string) =>
    name
      ? name
          .split(' ')
          .map((n) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()
      : 'U';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="sm:hidden flex flex-col gap-3"
    >
      {users.map((user, index) => {
        const roleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.student;
        const orgName = organizations.find((org) => org._id === user.organizationId)?.name;

        return (
          <motion.div
            key={user._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + index * 0.04 }}
            className="bg-[var(--card-solid)] rounded-2xl p-4 border border-[var(--border)] shadow-[var(--shadow-sm)] flex flex-col gap-3 active:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
            onClick={() => handleOpenUserDetail(user)}
          >
            {/* Header: Avatar, Name, Email, Role */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--student-accent)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-[var(--color-foreground)] truncate">{user.name}</p>
                    {user.isSuspended && (
                      <span className="p-0.5 rounded bg-[var(--error-light)] text-[var(--error)]" title="Suspended">
                        <UserX className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 truncate mt-0.5">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </p>
                  {user.phone && (
                    <p className="text-[11px] text-[var(--color-muted)] flex items-center gap-1 truncate mt-0.5">
                      <Phone className="w-3 h-3 shrink-0 text-[var(--success)]" />
                      <span className="truncate">{user.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-lg capitalize shrink-0 ${roleBadge.bg} ${roleBadge.text}`}
              >
                <Shield className="w-3 h-3" />
                {user.role}
              </span>
            </div>

            {/* Info Grid */}
            <div className="flex flex-col gap-2 pt-2.5 border-t border-[var(--border)] text-xs">
              {/* Platform & Last Opened */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminAnalytics.platform') || 'Platform'}</span>
                {user.lastPlatform === 'android' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] text-[11px] font-semibold">
                    <Smartphone className="w-3 h-3" />
                    Android App
                  </span>
                ) : user.lastPlatform === 'ios' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary-soft)] text-[var(--primary)] text-[11px] font-semibold">
                    <Smartphone className="w-3 h-3" />
                    iOS App
                  </span>
                ) : user.lastPlatform === 'web' ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--info-light)] text-[var(--info)] text-[11px] font-semibold">
                    <Globe className="w-3 h-3" />
                    Website
                  </span>
                ) : (
                  <span className="text-[var(--color-muted)] italic">N/A</span>
                )}
              </div>

              {/* Last Opened */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminUsers.lastOpened') || 'Last Opened'}</span>
                {user.lastActiveAt ? (
                  <span className="font-semibold text-[var(--color-foreground)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[var(--primary)]" />
                    {getRelativeTime(user.lastActiveAt)}
                  </span>
                ) : (
                  <span className="text-[var(--color-muted)] italic">{t('common.never') || 'Never'}</span>
                )}
              </div>

              {/* Organization */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('adminUsers.organization') || 'Organization'}</span>
                {orgName ? (
                  <span className="font-semibold text-[var(--color-foreground)] flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-[var(--info)]" />
                    {orgName}
                  </span>
                ) : (
                  <span className="text-[var(--color-muted)] italic">{t('common.none') || 'Public'}</span>
                )}
              </div>

              {/* Teacher limits if teacher */}
              {user.role === 'teacher' && (
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted-foreground)]">{t('adminUsers.limits') || 'Quotas'}</span>
                  <span className="font-mono font-semibold text-[var(--color-foreground)] text-[11px]">
                    C: {user.limits?.courses ?? '∞'} | Q: {user.limits?.quizzes ?? '∞'} | B: {user.limits?.blogs ?? '∞'}
                  </span>
                </div>
              )}

              {/* Joined */}
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-muted-foreground)]">{t('admin.joined') || 'Joined'}</span>
                <span className="text-[var(--color-muted)] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>

            {/* Tap Action Bar (min 44px touch target) */}
            <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between text-xs font-bold text-[var(--primary)] min-h-[44px]">
              <span>{t('adminUsers.manageUser') || 'Manage User'}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
