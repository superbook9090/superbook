'use client';

import React from 'react';
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
    <div className="teacher-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-muted)]/75 text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
              <th className="py-3.5 px-4">{t('organizations.organizationName')}</th>
              <th className="py-3.5 px-4">{t('organizations.status')}</th>
              <th className="py-3.5 px-4">{t('organizations.code')}</th>
              <th className="py-3.5 px-4">{t('organizations.inviteCode')}</th>
              <th className="py-3.5 px-4 text-center">{t('organizations.users')}</th>
              <th className="py-3.5 px-4 text-center">{t('organizations.totalContent')}</th>
              <th className="py-3.5 px-4 text-right">{t('organizations.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70">
            {organizations.map((org) => {
              const totalContent = (org.courseCount || 0) + (org.quizCount || 0) + (org.blogCount || 0);

              return (
                <tr
                  key={org._id}
                  className="hover:bg-[var(--surface-muted)]/45 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-[10px] text-white font-bold text-xs flex items-center justify-center shrink-0"
                        style={{ background: 'var(--teacher-gradient)' }}
                      >
                        {getOrgInitials(org.name)}
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <button
                          type="button"
                          onClick={() => onOpenDetail(org)}
                          className="font-bold text-sm text-[var(--color-foreground)] hover:text-[var(--teacher-primary)] truncate block text-left transition-colors cursor-pointer"
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

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 bg-[var(--surface-muted)] border border-[var(--border)] px-2.5 py-1 rounded-[8px] text-xs font-mono">
                      <span className="font-semibold text-[var(--color-foreground)]">{org.code}</span>
                      <Tooltip label={copiedCode === `code-${org.code}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                        <button
                          type="button"
                          onClick={() => onCopy(org.code, 'code')}
                          aria-label={t('organizations.copyCode')}
                          className="text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] transition-colors cursor-pointer"
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

                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 bg-[var(--info-light)]/70 border border-[var(--info)]/20 px-2.5 py-1 rounded-[8px] text-xs font-mono">
                      <span className="font-bold text-[var(--info)]">{org.inviteCode}</span>
                      <Tooltip label={copiedCode === `inviteCode-${org.inviteCode}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                        <button
                          type="button"
                          onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                          aria-label={t('organizations.copyCode')}
                          className="text-[var(--info)] hover:opacity-80 transition-opacity cursor-pointer"
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

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--student-primary)] bg-[var(--student-soft)] px-2.5 py-1 rounded-[8px] tabular-nums">
                      <Users className="w-3.5 h-3.5" />
                      {org.userCount || 0}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[var(--teacher-primary)] bg-[var(--teacher-soft)] px-2.5 py-1 rounded-[8px] tabular-nums">
                      <BookOpen className="w-3.5 h-3.5" />
                      {totalContent}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip label={t('organizations.viewDetails')}>
                        <button
                          type="button"
                          onClick={() => onOpenDetail(org)}
                          aria-label={t('organizations.viewDetails')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip label={org.isActive ? t('organizations.deactivateOrg') : t('organizations.activateOrg')}>
                        <button
                          type="button"
                          onClick={() => onToggleActive(org)}
                          aria-label={t('organizations.toggleStatus')}
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] transition-colors cursor-pointer ${
                            org.isActive
                              ? 'text-[var(--success)] hover:bg-[var(--success-light)]'
                              : 'text-[var(--color-muted-foreground)] hover:bg-[var(--surface-muted)]'
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
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      <Tooltip label={t('common.delete')}>
                        <button
                          type="button"
                          onClick={() => onDelete(org)}
                          aria-label={t('common.delete')}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
