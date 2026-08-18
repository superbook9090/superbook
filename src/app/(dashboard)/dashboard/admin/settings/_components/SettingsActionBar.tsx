'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RotateCcw, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface Props {
  isDirty: boolean;
  isSaving: boolean;
  pendingCount: number;
  onSave: () => void;
  onRequestDiscard: () => void;
}

export function SettingsActionBar({
  isDirty,
  isSaving,
  pendingCount,
  onSave,
  onRequestDiscard,
}: Props) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isDirty && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.2 }}
          className="sticky bottom-4 sm:bottom-6 z-40"
        >
          <div className="card-surface p-3 sm:p-4 rounded-2xl border border-[var(--border)] shadow-xl bg-[var(--card-solid)]/95 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <span className="p-2 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] shrink-0">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)]">
                  {t('adminSettings.unsavedChanges')}
                </p>
                <p className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)]">
                  {pendingCount} change(s) pending save
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onRequestDiscard}
                disabled={isSaving}
                className="flex-1 sm:flex-initial min-h-[40px] flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('adminSettings.discardChanges') || 'Discard'}</span>
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={onSave}
                isLoading={isSaving}
                disabled={isSaving}
                className="flex-1 sm:flex-initial min-h-[40px] flex items-center justify-center gap-1.5"
              >
                {!isSaving && <Save className="w-4 h-4" />}
                <span>{isSaving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
