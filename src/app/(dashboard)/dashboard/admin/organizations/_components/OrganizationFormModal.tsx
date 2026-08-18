'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Copy, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import type { OrganizationItem, OrganizationFormData } from './types';

interface OrganizationFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  selectedOrg: OrganizationItem | null;
  formData: OrganizationFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
  isSubmitting: boolean;
  copiedCode: string | null;
  onCopy: (text: string, type: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function OrganizationFormModal({
  isOpen,
  isEdit,
  selectedOrg,
  formData,
  setFormData,
  isSubmitting,
  copiedCode,
  onCopy,
  onSubmit,
  onClose,
}: OrganizationFormModalProps) {
  const { t } = useTranslation();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isSubmitting ? undefined : onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative z-10 w-full max-w-lg bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)]">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">
                  {isEdit ? t('organizations.editOrganization') : t('organizations.createOrganization')}
                </h2>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  {isEdit ? selectedOrg?.name : t('organizations.description')}
                </p>
              </div>
            </div>

            <Tooltip label={t('common.close')} position="bottom">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label={t('common.close')}
                className="p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </Tooltip>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {/* Organization Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)] mb-1.5">
                {t('organizations.organizationName')} <span className="text-[var(--error)]">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('organizations.namePlaceholder')}
                className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-medium shadow-xs"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)] mb-1.5">
                {t('organizations.descriptionOptional')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('organizations.briefDescription')}
                rows={3}
                className="w-full px-4 py-2.5 bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-foreground)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-medium shadow-xs resize-none"
              />
            </div>

            {/* In Edit mode: Display immutable Code and Invite Code */}
            {isEdit && selectedOrg && (
              <div className="grid grid-cols-2 gap-3 bg-[var(--color-surface-muted)]/50 border border-[var(--border)] rounded-xl p-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--color-muted-foreground)] block mb-1">
                    {t('organizations.code')}
                  </span>
                  <div className="flex items-center justify-between gap-1 font-mono font-bold text-xs text-[var(--color-foreground)]">
                    <span>{selectedOrg.code}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(selectedOrg.code, 'code')}
                      className="p-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                    >
                      {copiedCode === `code-${selectedOrg.code}` ? (
                        <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--info)] block mb-1">
                    {t('organizations.inviteCode')}
                  </span>
                  <div className="flex items-center justify-between gap-1 font-mono font-bold text-xs text-[var(--info)]">
                    <span>{selectedOrg.inviteCode}</span>
                    <button
                      type="button"
                      onClick={() => onCopy(selectedOrg.inviteCode, 'inviteCode')}
                      className="p-1 text-[var(--info)] hover:text-[var(--info)]/80"
                    >
                      {copiedCode === `inviteCode-${selectedOrg.inviteCode}` ? (
                        <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Active Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 bg-[var(--color-surface-muted)]/60 rounded-xl border border-[var(--border)]">
              <div>
                <span className="text-sm font-bold text-[var(--color-foreground)] block">
                  {t('organizations.status')}
                </span>
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {formData.isActive ? t('organizations.active') : t('organizations.inactive')}
                </span>
              </div>
              <input
                type="checkbox"
                id="org-is-active"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-[var(--primary)] border-[var(--border)] rounded focus:ring-[var(--primary)] cursor-pointer"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-3 pt-3 border-t border-[var(--border)]">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                variant="secondary"
                className="flex-1 min-h-[44px]"
              >
                {t('organizations.cancel')}
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
                variant="primary"
                className="flex-1 min-h-[44px]"
              >
                {isEdit ? t('organizations.update') : t('organizations.create')}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
