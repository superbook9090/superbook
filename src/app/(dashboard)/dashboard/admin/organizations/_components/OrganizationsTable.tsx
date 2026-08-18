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
  ExternalLink,
  Power,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Tooltip from '@/components/ui/Tooltip';
import type { OrganizationItem } from './types';

interface OrganizationsTableProps {
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

export function OrganizationsTable({
  organizations,
  copiedCode,
  onCopy,
  onOpenDetail,
  onOpenEdit,
  onToggleActive,
  onDelete,
}: OrganizationsTableProps) {
  const { t } = useTranslation();

  return (
    <div className="bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-sm)]">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--color-surface-muted)]/50 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <th className="py-3.5 px-4 font-bold">{t('organizations.organizationName')}</th>
              <th className="py-3.5 px-4 font-bold">{t('organizations.status')}</th>
              <th className="py-3.5 px-4 font-bold">{t('organizations.code')}</th>
              <th className="py-3.5 px-4 font-bold">{t('organizations.inviteCode')}</th>
              <th className="py-3.5 px-4 font-bold text-center">{t('organizations.users')}</th>
              <th className="py-3.5 px-4 font-bold text-center">{t('organizations.totalContent')}</th>
              <th className="py-3.5 px-4 font-bold text-right">{t('organizations.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {organizations.map((org, index) => {
              const totalContent = (org.courseCount || 0) + (org.quizCount || 0) + (org.blogCount || 0);

              return (
                <motion.tr
                  key={org._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02, duration: 0.2 }}
                  className="hover:bg-[var(--color-surface-muted)]/40 transition-colors group"
                >
                  {/* Organization Name & Initials */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {getOrgInitials(org.name)}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(org)}
                          className="font-bold text-sm text-[var(--color-foreground)] hover:text-[var(--primary)] truncate block text-left transition-colors"
                        >
                          {org.name}
                        </button>
                        {org.description && (
                          <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                            {org.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
                  </td>

                  {/* Org Code */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 bg-[var(--color-surface-muted)] px-2.5 py-1 rounded-md text-xs font-mono">
                      <span className="font-semibold text-[var(--color-foreground)]">{org.code}</span>
                      <Tooltip label={copiedCode === `code-${org.code}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                        <button
                          type="button"
                          onClick={() => onCopy(org.code, 'code')}
                          aria-label={t('organizations.copyCode')}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                        >
                          {copiedCode === `code-${org.code}` ? (
                            <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </td>

                  {/* Invite Code */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 bg-[var(--info-light)]/60 border border-[var(--info)]/20 px-2.5 py-1 rounded-md text-xs font-mono">
                      <span className="font-bold text-[var(--info)]">{org.inviteCode}</span>
                      <Tooltip label={copiedCode === `inviteCode-${org.inviteCode}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                        <button
                          type="button"
                          onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                          aria-label={t('organizations.copyCode')}
                          className="text-[var(--info)] hover:text-[var(--info)]/80 transition-colors"
                        >
                          {copiedCode === `inviteCode-${org.inviteCode}` ? (
                            <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </Tooltip>
                    </div>
                  </td>

                  {/* Users */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--student-primary)] bg-[var(--student-soft)] px-2.5 py-1 rounded-lg tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {org.userCount || 0}
                    </span>
                  </td>

                  {/* Content */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--teacher-primary)] bg-[var(--teacher-soft)] px-2.5 py-1 rounded-lg tabular-nums">
                      <BookOpen className="w-3.5 h-3.5" />
                      {totalContent}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip label={t('organizations.viewDetails')}>
                        <button
                          type="button"
                          onClick={() => onOpenDetail(org)}
                          aria-label={t('organizations.viewDetails')}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip label={org.isActive ? t('organizations.deactivateOrg') : t('organizations.activateOrg')}>
                        <button
                          type="button"
                          onClick={() => onToggleActive(org)}
                          aria-label={t('organizations.toggleStatus')}
                          className={`p-1.5 rounded-lg border border-[var(--border)] transition-colors ${
                            org.isActive
                              ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                              : 'text-[var(--color-muted-foreground)] hover:bg-[var(--color-surface-muted)]'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip label={t('common.edit')}>
                        <button
                          type="button"
                          onClick={() => onOpenEdit(org)}
                          aria-label={t('common.edit')}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-foreground)] transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip label={t('common.delete')}>
                        <button
                          type="button"
                          onClick={() => onDelete(org)}
                          aria-label={t('common.delete')}
                          className="p-1.5 rounded-lg border border-[var(--border)] hover:bg-[var(--error-light)] text-[var(--error)] transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
