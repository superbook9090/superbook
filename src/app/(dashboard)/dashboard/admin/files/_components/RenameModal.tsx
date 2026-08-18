'use client';

import React, { useState, useEffect } from 'react';
import { Pencil, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useTranslation } from '@/hooks/useTranslation';
import type { FileNodeItem, FolderNode } from './types';

interface RenameModalProps {
  isOpen: boolean;
  target: FolderNode | FileNodeItem | null;
  isSubmitting: boolean;
  onSubmit: (id: string, newName: string) => Promise<void>;
  onClose: () => void;
}

export function RenameModal({
  isOpen,
  target,
  isSubmitting,
  onSubmit,
  onClose,
}: RenameModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && target) {
      setName(target.name);
      setError('');
    }
  }, [isOpen, target]);

  if (!isOpen || !target) return null;

  const isFolder = target.type === 'folder';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(
        isFolder
          ? t('files.enterFolderName') || 'Folder name is required'
          : t('files.enterFileName') || 'File name is required'
      );
      return;
    }
    if (trimmed === target.name) {
      onClose();
      return;
    }
    if (trimmed.length > 255) {
      setError('Name is too long');
      return;
    }
    await onSubmit(target._id, trimmed);
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
            <div className="p-2.5 rounded-xl bg-[var(--primary-soft)] text-[var(--primary)]">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-foreground)]">
                {t('files.rename') || 'Rename Item'}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {isFolder ? t('files.folder') || 'Folder' : t('files.file') || 'Document'}
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
              label={
                isFolder
                  ? t('files.folderName') || 'Folder Name'
                  : t('files.fileName') || 'File Name'
              }
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setName(e.target.value);
                if (error) setError('');
              }}
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
              {t('files.rename') || 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
