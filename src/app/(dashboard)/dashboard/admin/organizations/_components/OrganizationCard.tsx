'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Copy,
  Check,
  Edit2,
  Trash2,
  ExternalLink,
  Power,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import Button from '@/components/ui/Button';
import type { OrganizationItem } from './types';

interface OrganizationCardProps {
  organization: OrganizationItem;
  index: number;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onOpenDetail: (org: OrganizationItem) => void;
  onOpenEdit: (org: OrganizationItem) => void;
  onToggleActive: (org: OrganizationItem) => void;
  onDelete: (org: OrganizationItem) => void;
}

function getOrgInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OrganizationCard({
  organization: org,
  index,
  copiedCode,
  onCopy,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: OrganizationCardProps) {
  const { t } = useTranslation();
  const initials = getOrgInitials(org.name);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl p-5 shadow-[var(--shadow-sm)] hover:shadow-md transition-all duration-200 flex flex-col justify-between group hover:border-[var(--primary)]/30"
    >
      <div>
        {/* Card Header: Avatar, Name, Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <h3
                onClick={() => onOpenDetail(org)}
                className="text-base font-bold text-[var(--color-foreground)] truncate hover:text-[var(--primary)] cursor-pointer transition-colors"
                title={org.name}
              >
                {org.name}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.createdOn')}: {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full shrink-0 ${
              org.isActive
                ? 'bg-[var(--success-light)] text-[var(--success)]'
                : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                org.isActive ? 'bg-[var(--success)] animate-pulse' : 'bg-[var(--color-muted-foreground)]'
              }`}
            />
            {org.isActive ? t('organizations.statusActive') : t('organizations.statusInactive')}
          </span>
        </div>

        {/* Description */}
        {org.description ? (
          <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
            {org.description}
          </p>
        ) : (
          <p className="text-xs italic text-[var(--color-muted-foreground)]/60 mb-4">
            {t('organizations.briefDescription')}
          </p>
        )}

        {/* Code & Invite Code Chips */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 bg-[var(--color-surface-muted)] border border-[var(--border)] px-2.5 py-1 rounded-lg text-xs font-mono">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-foreground)]">
              {t('organizations.code')}:
            </span>
            <span className="font-semibold text-[var(--color-foreground)]">{org.code}</span>
            <Tooltip label={copiedCode === `code-${org.code}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
              <button
                type="button"
                onClick={() => onCopy(org.code, 'code')}
                aria-label={t('organizations.copyCode')}
                className="p-1 hover:text-[var(--primary)] text-[var(--color-muted-foreground)] transition-colors rounded"
              >
                {copiedCode === `code-${org.code}` ? (
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--info-light)]/60 border border-[var(--info)]/20 px-2.5 py-1 rounded-lg text-xs font-mono">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--info)]">
              {t('organizations.inviteCode')}:
            </span>
            <span className="font-bold text-[var(--info)]">{org.inviteCode}</span>
            <Tooltip label={copiedCode === `inviteCode-${org.inviteCode}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
              <button
                type="button"
                onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                aria-label={t('organizations.copyCode')}
                className="p-1 hover:text-[var(--info)] text-[var(--info)]/80 transition-colors rounded"
              >
                {copiedCode === `inviteCode-${org.inviteCode}` ? (
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Content Metrics Breakdown */}
        <div className="grid grid-cols-4 gap-2 bg-[var(--color-surface-muted)]/50 rounded-xl p-2.5 mb-4 border border-[var(--border)]/50">
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <Users className="w-3.5 h-3.5 text-[var(--student-primary)] mb-1" />
            <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">{org.userCount || 0}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('organizations.users')}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <BookOpen className="w-3.5 h-3.5 text-[var(--teacher-primary)] mb-1" />
            <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">{org.courseCount || 0}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('organizations.courses')}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <ClipboardList className="w-3.5 h-3.5 text-[var(--info)] mb-1" />
            <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">{org.quizCount || 0}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('organizations.quizzes')}</span>
          </div>
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <FileText className="w-3.5 h-3.5 text-[var(--accent)] mb-1" />
            <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">{org.blogCount || 0}</span>
            <span className="text-[10px] text-[var(--color-muted-foreground)]">{t('organizations.blogs')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]">
        <Button
          onClick={() => onOpenDetail(org)}
          variant="secondary"
          size="sm"
          className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('organizations.viewDetails')}</span>
        </Button>

        <div className="flex items-center gap-1">
          <Tooltip label={org.isActive ? t('organizations.deactivateOrg') : t('organizations.activateOrg')}>
            <button
              type="button"
              onClick={() => onToggleActive(org)}
              aria-label={t('organizations.toggleStatus')}
              className={`p-2 rounded-lg border border-[var(--border)] transition-colors ${
                org.isActive
                  ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                  : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]'
              }`}
            >
              <Power className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip label={t('common.edit')}>
            <button
              type="button"
              onClick={() => onOpenEdit(org)}
              aria-label={t('common.edit')}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip label={t('common.delete')}>
            <button
              type="button"
              onClick={() => onDelete(org)}
              aria-label={t('common.delete')}
              className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--error-light)] text-[var(--error)] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </motion.div>
  );
}
