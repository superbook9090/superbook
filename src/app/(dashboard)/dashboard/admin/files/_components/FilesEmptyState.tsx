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
          ? t('files.empty')
          : t('files.noFilteredResults')
      }
      description={
        isFolderEmpty
          ? canMutate
            ? t('files.emptyFolderDesc')
            : t('files.studentEmptyDesc')
          : t('files.noFilteredResultsDesc')
      }
      action={
        isFolderEmpty ? (
          canMutate ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={onOpenCreateFolder}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4 text-[var(--color-warning)]" />
                <span>{t('files.createFolder')}</span>
              </Button>
              <Button
                onClick={onOpenUpload}
                variant="primary"
                className="flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{t('files.uploadPdf')}</span>
              </Button>
            </div>
          ) : undefined
        ) : (
          <Button onClick={onResetFilters} variant="secondary">
            {t('common.reset')}
          </Button>
        )
      }
    />
  );
}
