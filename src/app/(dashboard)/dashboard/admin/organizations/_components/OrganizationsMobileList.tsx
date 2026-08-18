'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Copy,
  Check,
  Edit2,
  Trash2,
  ChevronRight,
  Power,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationItem } from './types';

interface OrganizationsMobileListProps {
  organizations: OrganizationItem[];
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

export function OrganizationsMobileList({
  organizations,
  copiedCode,
  onCopy,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: OrganizationsMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 md:hidden">
      {organizations.map((org, index) => {
        const totalContent = (org.courseCount || 0) + (org.quizCount || 0) + (org.blogCount || 0);

        return (
          <motion.div
            key={org._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.2 }}
            className="bg-[var(--card-solid)] border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-sm)] flex flex-col gap-3"
          >
            {/* Header: Avatar, Name, Status, Detail chevron */}
            <div className="flex items-start justify-between gap-2">
              <div
                onClick={() => onOpenDetail(org)}
                className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                  {getOrgInitials(org.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-[var(--color-foreground)] truncate">
                    {org.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.2 text-[10px] font-semibold rounded-full ${
                        org.isActive
                          ? 'bg-[var(--success-light)] text-[var(--success)]'
                          : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                      }`}
                    >
                      <span
                        className={`w-1 h-1 rounded-full ${
                          org.isActive ? 'bg-[var(--success)]' : 'bg-[var(--color-muted-foreground)]'
                        }`}
                      />
                      {org.isActive ? t('organizations.statusActive') : t('organizations.statusInactive')}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenDetail(org)}
                aria-label={t('organizations.viewDetails')}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Codes Bar */}
            <div className="flex items-center justify-between gap-2 bg-[var(--color-surface-muted)]/60 rounded-lg p-2 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)]">
                  {t('organizations.code')}:
                </span>
                <span className="font-mono font-semibold truncate text-[var(--color-foreground)]">{org.code}</span>
                <button
                  type="button"
                  onClick={() => onCopy(org.code, 'code')}
                  aria-label={t('organizations.copyCode')}
                  className="p-1 hover:text-[var(--primary)] text-[var(--color-muted-foreground)]"
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
                  className="p-1 text-[var(--info)]"
                >
                  {copiedCode === `inviteCode-${org.inviteCode}` ? (
                    <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Metrics & Action Footer */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1 font-bold text-[var(--student-primary)]">
                  <Users className="w-3.5 h-3.5" />
                  {org.userCount || 0}
                </span>
                <span className="flex items-center gap-1 font-bold text-[var(--teacher-primary)]">
                  <BookOpen className="w-3.5 h-3.5" />
                  {totalContent}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onToggleActive(org)}
                  aria-label={t('organizations.toggleStatus')}
                  className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--border)] ${
                    org.isActive ? 'text-[var(--success)]' : 'text-[var(--color-muted-foreground)]'
                  }`}
                >
                  <Power className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenEdit(org)}
                  aria-label={t('common.edit')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--color-foreground)]"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onDelete(org)}
                  aria-label={t('common.delete')}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-[var(--border)] text-[var(--error)]"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
