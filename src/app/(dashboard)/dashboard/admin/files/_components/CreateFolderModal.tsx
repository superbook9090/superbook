'use client';

import React, { useState, useEffect } from 'react';
import { FolderPlus, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useTranslation } from '@/hooks/useTranslation';

interface CreateFolderModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onSubmit: (name: string) => Promise<void>;
  onClose: () => void;
}

export function CreateFolderModal({
  isOpen,
  isSubmitting,
  onSubmit,
  onClose,
}: CreateFolderModalProps) {
  const { t } = useTranslation();
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFolderName('');
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = folderName.trim();
    if (!trimmed) {
      setError(t('files.enterFolderName') || 'Please enter a folder name');
      return;
    }
    if (trimmed.length > 255) {
      setError('Folder name is too long');
      return;
    }
    setError('');
    await onSubmit(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)]">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-foreground)]">
                {t('files.createFolder') || 'Create New Folder'}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {t('files.enterFolderName') || 'Organize documents in subdirectories'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <TextField
              label={t('files.folderName') || 'Folder Name'}
              value={folderName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setFolderName(e.target.value);
                if (error) setError('');
              }}
              placeholder={t('files.enterFolderName') || 'e.g. Science Mock Tests'}
              autoFocus
              required
            />
            {error && <p className="mt-1.5 text-xs text-[var(--color-error)]">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              {t('common.cancel') || 'Cancel'}
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              {t('files.createFolder') || 'Create Folder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
