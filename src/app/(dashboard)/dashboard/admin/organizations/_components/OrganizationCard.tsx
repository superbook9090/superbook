'use client';

import React from 'react';
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
  Share2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { OrganizationItem } from './types';

interface OrganizationCardProps {
  organization: OrganizationItem;
  index: number;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onCopyShareInfo: (org: OrganizationItem) => void;
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
  copiedCode,
  onCopy,
  onCopyShareInfo,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: OrganizationCardProps) {
  const { t } = useTranslation();
  const initials = getOrgInitials(org.name);
  const isShareCopied = copiedCode === `shareInfo-${org._id}`;

  return (
    <div className="teacher-card p-5 flex flex-col justify-between gap-4 group">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-[10px] text-white font-bold text-sm flex items-center justify-center shrink-0"
              style={{ background: 'var(--teacher-gradient)' }}
            >
              {initials}
            </div>
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onOpenDetail(org)}
                className="text-base font-bold text-[var(--color-foreground)] truncate hover:text-[var(--teacher-primary)] cursor-pointer transition-colors block text-left w-full"
                title={org.name}
              >
                {org.name}
              </button>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('organizations.createdOn')}: {new Date(org.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-bold rounded-full shrink-0 ${
              org.isActive
                ? 'bg-[var(--success-light)] text-[var(--success)]'
                : 'bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                org.isActive ? 'bg-[var(--success)]' : 'bg-[var(--color-muted-foreground)]'
              }`}
            />
            {org.isActive ? t('organizations.statusActive') : t('organizations.statusInactive')}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--color-muted-foreground)] line-clamp-2 min-h-[2rem] leading-relaxed">
          {org.description || t('organizations.briefDescription')}
        </p>

        {/* Codes */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-1.5 bg-[var(--surface-muted)] border border-[var(--border)] px-2.5 py-1 rounded-[8px] text-xs font-mono">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--color-muted-foreground)]">
              {t('organizations.code')}:
            </span>
            <span className="font-semibold text-[var(--color-foreground)]">{org.code}</span>
            <Tooltip label={copiedCode === `code-${org.code}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
              <button
                type="button"
                onClick={() => onCopy(org.code, 'code')}
                aria-label={t('organizations.copyCode')}
                className="p-0.5 hover:text-[var(--teacher-primary)] text-[var(--color-muted-foreground)] transition-colors cursor-pointer"
              >
                {copiedCode === `code-${org.code}` ? (
                  <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </Tooltip>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-[var(--info-light)]/70 border border-[var(--info)]/20 px-2.5 py-1 rounded-[8px] text-xs font-mono">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--info)]">
              {t('organizations.inviteCode')}:
            </span>
            <span className="font-bold text-[var(--info)]">{org.inviteCode}</span>
            <Tooltip label={copiedCode === `inviteCode-${org.inviteCode}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
              <button
                type="button"
                onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                aria-label={t('organizations.copyCode')}
                className="p-0.5 hover:opacity-80 text-[var(--info)] transition-opacity cursor-pointer"
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

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-1.5 bg-[var(--surface-muted)]/70 rounded-xl p-2 border border-[var(--border)]/60">
          {[
            { icon: Users, color: 'text-[var(--student-primary)]', val: org.userCount || 0, label: t('organizations.users') },
            { icon: BookOpen, color: 'text-[var(--teacher-primary)]', val: org.courseCount || 0, label: t('organizations.courses') },
            { icon: ClipboardList, color: 'text-[var(--info)]', val: org.quizCount || 0, label: t('organizations.quizzes') },
            { icon: FileText, color: 'text-amber-600 dark:text-amber-400', val: org.blogCount || 0, label: t('organizations.blogs') },
          ].map((m) => (
            <div key={m.label} className="flex flex-col items-center justify-center p-1 text-center">
              <m.icon className={`w-3.5 h-3.5 ${m.color} mb-0.5`} />
              <span className="text-xs font-bold tabular-nums text-[var(--color-foreground)]">{m.val}</span>
              <span className="text-[10px] text-[var(--color-muted-foreground)] truncate max-w-full">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-[var(--border)]/70">
        <button
          type="button"
          onClick={() => onOpenDetail(org)}
          className="teacher-pill-btn flex-1 min-h-[40px] px-3 text-xs font-semibold cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{t('organizations.viewDetails')}</span>
        </button>

        <div className="flex items-center gap-1.5">
          <Tooltip label={isShareCopied ? t('organizations.codeCopied') : t('organizations.copyShareInfo')}>
            <button
              type="button"
              onClick={() => onCopyShareInfo(org)}
              aria-label={t('organizations.copyShareInfo')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--primary)] hover:bg-[var(--primary-soft)] transition-colors cursor-pointer"
            >
              {isShareCopied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Share2 className="w-4 h-4" />}
            </button>
          </Tooltip>

          <Tooltip label={org.isActive ? t('organizations.deactivateOrg') : t('organizations.activateOrg')}>
            <button
              type="button"
              onClick={() => onToggleActive(org)}
              aria-label={t('organizations.toggleStatus')}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] transition-colors cursor-pointer ${
                org.isActive
                  ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip label={t('common.delete')}>
            <button
              type="button"
              onClick={() => onDelete(org)}
              aria-label={t('common.delete')}
              className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-muted-foreground)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
