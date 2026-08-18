'use client';

import React from 'react';
import { FolderPlus, UploadCloud } from 'lucide-react';
import { EmptyState } from '@/components/layout';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface FilesEmptyStateProps {
  isFolderEmpty: boolean;
  canMutate: boolean;
  onOpenCreateFolder: () => void;
  onOpenUpload: () => void;
  onResetFilters: () => void;
}

export function FilesEmptyState({
  isFolderEmpty,
  canMutate,
  onOpenCreateFolder,
  onOpenUpload,
  onResetFilters,
}: FilesEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <EmptyState
      title={
        isFolderEmpty
          ? t('files.empty') || 'This folder is empty'
          : t('files.noFilteredResults') || 'No matching items'
      }
      description={
        isFolderEmpty
          ? t('files.emptyFolderDesc') || 'Upload a PDF or create a subfolder to get started.'
          : t('files.noFilteredResultsDesc') || 'Try adjusting your search query or filters.'
      }
      action={
        isFolderEmpty && canMutate ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={onOpenCreateFolder}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-[var(--color-warning)]" />
              <span>{t('files.createFolder') || 'New Folder'}</span>
            </Button>
            <Button
              onClick={onOpenUpload}
              variant="primary"
              className="flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{t('files.uploadPdf') || 'Upload PDF'}</span>
            </Button>
          </div>
        ) : (
          <Button onClick={onResetFilters} variant="secondary">
            {t('common.reset') || 'Reset Filters'}
          </Button>
        )
      }
    />
  );
}
