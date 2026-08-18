'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Copy,
  Check,
  Edit2,
  Trash2,
  Power,
  Link as LinkIcon,
  Calendar,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import type { OrganizationItem } from './types';

interface OrganizationDetailModalProps {
  isOpen: boolean;
  organization: OrganizationItem | null;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onOpenEdit: (org: OrganizationItem) => void;
  onToggleActive: (org: OrganizationItem) => void;
  onDelete: (org: OrganizationItem) => void;
  onClose: () => void;
}

function getOrgInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OrganizationDetailModal({
  isOpen,
  organization: org,
  copiedCode,
  onCopy,
  onOpenEdit,
  onToggleActive,
  onDelete,
  onClose,
}: OrganizationDetailModalProps) {
  const { t } = useTranslation();

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Construct Direct Registration Link
  const registerUrl = useMemo(() => {
    if (!org) return '';
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/register?inviteCode=${encodeURIComponent(org.inviteCode)}`;
    }
    return `/register?inviteCode=${org.inviteCode}`;
  }, [org]);

  if (!isOpen || !org) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-xl bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow-sm">
                {getOrgInitials(org.name)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-extrabold text-[var(--color-foreground)] truncate">
                    {org.name}
                  </h2>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full ${
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
                <div className="flex items-center gap-1.5 text-xs text-[var(--color-muted-foreground)] mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('organizations.createdOn')}: {new Date(org.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <Tooltip label={t('common.close')} position="bottom">
              <button
                type="button"
                onClick={onClose}
                aria-label={t('common.close')}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Description */}
          {org.description && (
            <div className="bg-[var(--color-surface-muted)]/40 border border-[var(--border)] rounded-xl p-3.5">
              <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-wider block mb-1">
                {t('organizations.briefDescription')}
              </span>
              <p className="text-xs text-[var(--color-foreground)] leading-relaxed">{org.description}</p>
            </div>
          )}

          {/* Code & Invite Code Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[var(--color-surface-muted)]/60 border border-[var(--border)] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-wider block mb-0.5">
                  {t('organizations.code')}
                </span>
                <span className="font-mono font-bold text-sm text-[var(--color-foreground)]">{org.code}</span>
              </div>
              <Tooltip label={copiedCode === `code-${org.code}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                <button
                  type="button"
                  onClick={() => onCopy(org.code, 'code')}
                  aria-label={t('organizations.copyCode')}
                  className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  {copiedCode === `code-${org.code}` ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </Tooltip>
            </div>

            <div className="bg-[var(--info-light)]/40 border border-[var(--info)]/20 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--info)] tracking-wider block mb-0.5">
                  {t('organizations.inviteCode')}
                </span>
                <span className="font-mono font-bold text-sm text-[var(--info)]">{org.inviteCode}</span>
              </div>
              <Tooltip label={copiedCode === `inviteCode-${org.inviteCode}` ? t('organizations.codeCopied') : t('organizations.copyCode')}>
                <button
                  type="button"
                  onClick={() => onCopy(org.inviteCode, 'inviteCode')}
                  aria-label={t('organizations.copyCode')}
                  className="p-2 rounded-lg border border-[var(--info)]/20 hover:bg-[var(--card-solid)] text-[var(--info)] transition-colors"
                >
                  {copiedCode === `inviteCode-${org.inviteCode}` ? (
                    <Check className="w-4 h-4 text-[var(--success)]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Direct Registration Link Share Box */}
          <div className="bg-[var(--card-solid)] border border-[var(--primary)]/30 rounded-xl p-3.5 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <LinkIcon className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-xs font-bold text-[var(--color-foreground)]">
                {t('organizations.registrationLink')}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-muted-foreground)] mb-2.5">
              {t('organizations.registrationLinkDesc')}
            </p>
            <div className="flex items-center gap-2 bg-[var(--color-surface-muted)] px-3 py-2 rounded-lg border border-[var(--border)]">
              <span className="text-xs font-mono text-[var(--color-foreground)] truncate flex-1 select-all">
                {registerUrl}
              </span>
              <Button
                onClick={() => onCopy(registerUrl, 'inviteLink')}
                variant="primary"
                size="sm"
                className="shrink-0 flex items-center gap-1.5 text-xs py-1 px-2.5"
              >
                {copiedCode === `inviteLink-${registerUrl}` ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{t('organizations.codeCopied')}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t('organizations.copyInviteLink')}</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Breakdown Metrics */}
          <div>
            <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] tracking-wider block mb-2">
              {t('organizations.contentBreakdown')}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-[var(--student-soft)]/50 border border-[var(--student-primary)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <Users className="w-5 h-5 text-[var(--student-primary)] mb-1.5" />
                <span className="text-lg font-bold tabular-nums text-[var(--color-foreground)]">{org.userCount || 0}</span>
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{t('organizations.users')}</span>
              </div>
              <div className="bg-[var(--teacher-soft)]/50 border border-[var(--teacher-primary)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <BookOpen className="w-5 h-5 text-[var(--teacher-primary)] mb-1.5" />
                <span className="text-lg font-bold tabular-nums text-[var(--color-foreground)]">{org.courseCount || 0}</span>
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{t('organizations.courses')}</span>
              </div>
              <div className="bg-[var(--info-light)]/50 border border-[var(--info)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <ClipboardList className="w-5 h-5 text-[var(--info)] mb-1.5" />
                <span className="text-lg font-bold tabular-nums text-[var(--color-foreground)]">{org.quizCount || 0}</span>
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{t('organizations.quizzes')}</span>
              </div>
              <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl p-3 flex flex-col items-center justify-center text-center">
                <FileText className="w-5 h-5 text-[var(--accent)] mb-1.5" />
                <span className="text-lg font-bold tabular-nums text-[var(--color-foreground)]">{org.blogCount || 0}</span>
                <span className="text-xs font-medium text-[var(--color-muted-foreground)]">{t('organizations.blogs')}</span>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-2 pt-4 border-t border-[var(--border)]">
            <Button
              onClick={() => onToggleActive(org)}
              variant="secondary"
              className="flex items-center gap-1.5 text-xs min-h-[44px]"
            >
              <Power className="w-4 h-4" />
              <span>{org.isActive ? t('organizations.deactivateOrg') : t('organizations.activateOrg')}</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => { onClose(); onOpenEdit(org); }}
                variant="secondary"
                className="flex items-center gap-1.5 text-xs min-h-[44px]"
              >
                <Edit2 className="w-4 h-4" />
                <span>{t('organizations.editOrgDetails')}</span>
              </Button>

              <Button
                onClick={() => { onClose(); onDelete(org); }}
                variant="danger"
                className="flex items-center gap-1.5 text-xs min-h-[44px]"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('common.delete')}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
