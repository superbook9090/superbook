'use client';

import React from 'react';
import {
  Users,
  BookOpen,
  Copy,
  Check,
  Edit2,
  Trash2,
  ChevronRight,
  Power,
  Share2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationItem } from './types';

interface OrganizationsMobileListProps {
  organizations: OrganizationItem[];
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

export function OrganizationsMobileList({
  organizations,
  copiedCode,
  onCopy,
  onCopyShareInfo,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: OrganizationsMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {organizations.map((org) => {
        const totalContent = (org.courseCount || 0) + (org.quizCount || 0) + (org.blogCount || 0);

        return (
          <div key={org._id} className="teacher-card p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => onOpenDetail(org)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <div
                  className="w-10 h-10 rounded-[10px] text-white font-bold text-sm flex items-center justify-center shrink-0"
                  style={{ background: 'var(--teacher-gradient)' }}
                >
                  {getOrgInitials(org.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[var(--color-foreground)] truncate">
                    {org.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 text-[10px] font-bold rounded-full ${
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
              </div>

              <button
                type="button"
                onClick={() => onOpenDetail(org)}
                aria-label={t('organizations.viewDetails')}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 bg-[var(--surface-muted)]/70 rounded-[10px] p-2.5 text-xs border border-[var(--border)]/60">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)]">
                  {t('organizations.code')}:
                </span>
                <span className="font-mono font-semibold truncate text-[var(--color-foreground)]">{org.code}</span>
                <button
                  type="button"
                  onClick={() => onCopy(org.code, 'code')}
                  aria-label={t('organizations.copyCode')}
                  className="p-1 hover:text-[var(--teacher-primary)] text-[var(--color-muted-foreground)] cursor-pointer"
                >
                  {copiedCode === `code-${org.code}` ? (
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[var(--info)]">
                  {t('organizations.inviteCode')}:
                </span>
                <span className="font-mono font-bold text-[var(--info)] truncate">{org.inviteCode}</span>
                <button
                  type="button"
                  onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                  aria-label={t('organizations.copyCode')}
                  className="p-1 text-[var(--info)] cursor-pointer"
                >
                  {copiedCode === `inviteCode-${org.inviteCode}` ? (
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-[var(--border)]/70">
              <div className="flex items-center gap-3 text-xs tabular-nums">
                <span className="inline-flex items-center gap-1 font-bold text-[var(--student-primary)]">
                  <Users className="w-3.5 h-3.5" />
                  {org.userCount || 0}
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-[var(--teacher-primary)]">
                  <BookOpen className="w-3.5 h-3.5" />
                  {totalContent}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onCopyShareInfo(org)}
                  aria-label={t('organizations.copyShareInfo')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--primary)] cursor-pointer"
                >
                  {copiedCode === `shareInfo-${org._id}` ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onToggleActive(org)}
                  aria-label={t('organizations.toggleStatus')}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] cursor-pointer ${
                    org.isActive ? 'text-[var(--success)]' : 'text-[var(--color-muted-foreground)]'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEdit(org)}
                  aria-label={t('common.edit')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--color-foreground)] cursor-pointer"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(org)}
                  aria-label={t('common.delete')}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--surface-muted)] text-[var(--error)] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
