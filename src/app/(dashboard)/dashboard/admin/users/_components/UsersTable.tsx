'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Video,
  Globe,
  ChevronRight,
  UserX,
  Shield,
  Trash2,
  Smartphone,
  Clock,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate, formatDateTime, getRelativeTime } from '@/lib/dateUtils';
import Tooltip from '@/components/ui/Tooltip';
import type { User } from './types';

type Props = {
  users: User[];
  organizations: Array<{ _id: string; name: string }>;
  handleOpenUserDetail: (user: User) => void;
  handleDeleteClick?: (userId: string) => void;
};

const roleBadgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/20',
  },
  admin: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/20',
  },
  teacher: {
    bg: 'bg-[var(--teacher-soft)]',
    text: 'text-[var(--teacher-primary)]',
    border: 'border-[var(--teacher-border)]',
  },
  student: {
    bg: 'bg-[var(--student-soft)]',
    text: 'text-[var(--student-primary)]',
    border: 'border-[var(--student-border)]',
  },
};

export function UsersTable({ users, organizations, handleOpenUserDetail, handleDeleteClick }: Props) {
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
      className="bg-[var(--card-solid)] rounded-2xl border border-[var(--border)] shadow-[var(--shadow-sm)] overflow-hidden hidden sm:block"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--color-surface-muted)]/60">
            <tr>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.user') || 'User'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.role') || 'Role & Status'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminAnalytics.platform') || 'Platform'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.lastOpened') || 'Last Opened'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.organization') || 'Organization'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('adminUsers.capabilitiesAndLimits') || 'Quotas & Capabilities'}
              </th>
              <th className="px-5 py-3.5 text-left text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.joined') || 'Joined'}
              </th>
              <th className="px-5 py-3.5 text-right text-xs font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                {t('admin.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {users.map((user, index) => {
              const roleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.student;
              const orgName = organizations.find((org) => org._id === user.organizationId)?.name;

              return (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  className="hover:bg-[var(--color-surface-muted)]/50 transition-colors group cursor-pointer"
                  onClick={() => handleOpenUserDetail(user)}
                >
                  {/* User Column */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[var(--primary)] to-[var(--student-accent)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                        {getInitials(user.name)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[var(--color-foreground)] truncate">
                            {user.name}
                          </p>
                          {user.isSuspended && (
                            <span className="p-0.5 rounded bg-[var(--error-light)] text-[var(--error)]" title="Suspended">
                              <UserX className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-muted-foreground)] flex items-center gap-1 mt-0.5 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        {user.phone && (
                          <p className="text-[11px] text-[var(--color-muted)] flex items-center gap-1 mt-0.5 truncate">
                            <Phone className="w-3 h-3 shrink-0 text-[var(--success)]" />
                            <span className="truncate">{user.phone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Role & Status Column */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-lg border capitalize ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
                      >
                        <Shield className="w-3 h-3" />
                        {user.role}
                      </span>
                      {user.isSuspended ? (
                        <span className="text-[11px] text-[var(--error)] font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)]" />
                          {t('adminUsers.suspended') || 'Suspended'}
                        </span>
                      ) : (
                        <span className="text-[11px] text-[var(--success)] font-medium flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                          {t('adminUsers.active') || 'Active'}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Platform (App vs Website) Column */}
                  <td className="px-5 py-3.5">
                    {user.lastPlatform === 'android' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Android</span>
                      </span>
                    ) : user.lastPlatform === 'ios' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold">
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>iOS</span>
                      </span>
                    ) : user.lastPlatform === 'web' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--info-light)] text-[var(--info)] text-xs font-semibold">
                        <Globe className="w-3.5 h-3.5" />
                        <span>Website</span>
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)] italic">
                        {t('common.notAvailable') || 'N/A'}
                      </span>
                    )}
                  </td>

                  {/* Last Opened Column */}
                  <td className="px-5 py-3.5 text-xs text-[var(--color-muted-foreground)]">
                    {user.lastActiveAt ? (
                      <Tooltip label={formatDateTime(user.lastActiveAt)}>
                        <div className="inline-flex items-center gap-1.5 font-medium text-[var(--color-foreground)]">
                          <Clock className="w-3.5 h-3.5 text-[var(--primary)] shrink-0" />
                          <span>{getRelativeTime(user.lastActiveAt)}</span>
                        </div>
                      </Tooltip>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)] italic">
                        {t('common.never') || 'Never'}
                      </span>
                    )}
                  </td>

                  {/* Organization Column */}
                  <td className="px-5 py-3.5">
                    {orgName ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--info-light)] text-[var(--info)] text-xs font-semibold">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[160px]">{orgName}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)] italic">
                        {t('common.none') || 'Public / None'}
                      </span>
                    )}
                  </td>

                  {/* Quotas & Capabilities */}
                  <td className="px-5 py-3.5">
                    {user.role === 'teacher' ? (
                      <div className="flex flex-col gap-1 text-xs">
                        <span className="font-mono text-[11px] text-[var(--color-foreground)] font-semibold">
                          C: {user.limits?.courses ?? '∞'} | Q: {user.limits?.quizzes ?? '∞'} | B: {user.limits?.blogs ?? '∞'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {user.canUploadVideos && (
                            <Tooltip label="Video uploads enabled">
                              <span className="p-1 rounded bg-[var(--teacher-soft)] text-[var(--teacher-primary)]">
                                <Video className="w-3 h-3" />
                              </span>
                            </Tooltip>
                          )}
                          {user.canCreatePublicCourses && (
                            <Tooltip label="Public course creation enabled">
                              <span className="p-1 rounded bg-[var(--info-light)] text-[var(--info)]">
                                <Globe className="w-3 h-3" />
                              </span>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-[var(--color-muted)]">-</span>
                    )}
                  </td>

                  {/* Joined Date */}
                  <td className="px-5 py-3.5 text-xs text-[var(--color-muted-foreground)]">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[var(--color-muted)] shrink-0" />
                      <span>{formatDate(user.createdAt)}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenUserDetail(user);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-[var(--color-surface-muted)] text-[var(--color-foreground)] group-hover:bg-[var(--primary)] group-hover:text-white transition-all shadow-xs"
                      >
                        <span>{t('adminUsers.manageUser') || 'Manage'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                      {handleDeleteClick && user.role !== 'superadmin' && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(user._id);
                          }}
                          className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors opacity-0 group-hover:opacity-100"
                          title={t('admin.delete') || 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
