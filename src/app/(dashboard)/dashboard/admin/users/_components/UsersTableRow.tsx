'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Building2,
  Video,
  Globe,
  Sparkles,
  ChevronRight,
  UserX,
  Shield,
  Trash2,
  Smartphone,
  Clock,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime, getRelativeTime } from '@/lib/dateUtils';
import Tooltip from '@/components/ui/Tooltip';
import type { User } from './types';

interface UsersTableRowProps {
  user: User;
  index: number;
  organizations: Array<{ _id: string; name: string }>;
  onOpenDetail: (user: User) => void;
  onDeleteClick?: (userId: string) => void;
}

const roleBadgeConfig: Record<string, { bg: string; text: string; border: string }> = {
  superadmin: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/25',
  },
  admin: {
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/20',
    text: 'text-indigo-600 dark:text-indigo-400',
    border: 'border-indigo-500/25',
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

export function UsersTableRow({
  user,
  index,
  organizations,
  onOpenDetail,
  onDeleteClick,
}: UsersTableRowProps) {
  const { t } = useTranslation();
  const roleBadge = roleBadgeConfig[user.role] || roleBadgeConfig.student;
  const orgName = organizations.find((org) => org._id === user.organizationId)?.name;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.02 }}
      className="hover:bg-[var(--surface-muted)]/60 transition-colors group cursor-pointer"
      onClick={() => onOpenDetail(user)}
    >
      {/* User Column */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-[var(--student-accent)] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm border border-white/20">
            {initials}
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
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold rounded-lg border capitalize shadow-2xs ${roleBadge.bg} ${roleBadge.text} ${roleBadge.border}`}
          >
            <Shield className="w-3 h-3" />
            {user.role}
          </span>
          {user.isSuspended ? (
            <span className="text-[11px] text-[var(--error)] font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--error)] animate-pulse" />
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

      {/* Platform Column */}
      <td className="px-5 py-3.5">
        {user.lastPlatform === 'android' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold border border-[var(--primary)]/20">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </span>
        ) : user.lastPlatform === 'ios' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)] text-xs font-semibold border border-[var(--primary)]/20">
            <Smartphone className="w-3.5 h-3.5" />
            <span>iOS</span>
          </span>
        ) : user.lastPlatform === 'web' ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[var(--info-light)] text-[var(--info)] text-xs font-semibold border border-[var(--info)]/20">
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
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[var(--info-light)] text-[var(--info)] text-xs font-semibold border border-[var(--info)]/20">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate max-w-[160px]">{orgName}</span>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-muted)] italic">
            {t('common.none') || 'Public'}
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
              {user.canGenerateAiQuizzes && (
                <Tooltip label="AI quiz generation enabled">
                  <span className="p-1 rounded bg-[var(--primary-soft)] text-[var(--color-primary)]">
                    <Sparkles className="w-3 h-3" />
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-muted)] italic">
            {user.role === 'student' ? 'Student defaults' : 'Staff level'}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {onDeleteClick && (
            <Tooltip label={t('admin.delete') || 'Delete'}>
              <button
                type="button"
                onClick={() => onDeleteClick(user._id)}
                className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--error)] hover:bg-[var(--error-light)] transition-colors cursor-pointer"
                aria-label="Delete user"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
          <button
            type="button"
            onClick={() => onOpenDetail(user)}
            className="p-2 rounded-xl text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
            aria-label="View user details"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}
