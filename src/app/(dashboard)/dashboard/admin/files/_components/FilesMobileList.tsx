'use client';

import React from 'react';
import {
  Folder,
  FileText,
  Eye,
  Download,
  Link as LinkIcon,
  MoreVertical,
  Pencil,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, type FileNodeItem, type FolderNode } from './types';

interface FilesMobileListProps {
  folders: FolderNode[];
  files: FileNodeItem[];
  canMutate: boolean;
  onOpenFolder: (folder: FolderNode) => void;
  onPreviewFile: (file: FileNodeItem) => void;
  onDownloadFile: (file: FileNodeItem) => void;
  onCopyLink: (file: FileNodeItem) => void;
  onRenameFolder: (folder: FolderNode) => void;
  onRenameFile: (file: FileNodeItem) => void;
  onDeleteFolder: (folder: FolderNode) => void;
  onDeleteFile: (file: FileNodeItem) => void;
}

export function FilesMobileList({
  folders,
  files,
  canMutate,
  onOpenFolder,
  onPreviewFile,
  onDownloadFile,
  onCopyLink,
  onRenameFolder,
  onRenameFile,
  onDeleteFolder,
  onDeleteFile,
}: FilesMobileListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-2.5 md:hidden">
      {/* Folders */}
      {folders.map((folder) => {
        const dropdownItems = [
          {
            label: t('common.edit') || 'Rename',
            icon: <Pencil className="w-4 h-4" />,
            onClick: () => onRenameFolder(folder),
          },
          {
            label: t('common.delete') || 'Delete',
            icon: <Trash2 className="w-4 h-4 text-[var(--color-error)]" />,
            onClick: () => onDeleteFolder(folder),
            className: 'text-[var(--color-error)]',
          },
        ];

        return (
          <div
            key={folder._id}
            onClick={() => onOpenFolder(folder)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] active:scale-[0.99] transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] shrink-0">
                <Folder className="w-5 h-5 fill-current opacity-80" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                  {folder.name}
                </h4>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
                  {t('files.folder') || 'Folder'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              {canMutate && (
                <DropdownMenu
                  items={dropdownItems}
                  trigger={
                    <button
                      type="button"
                      className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--color-muted-foreground)] active:bg-[var(--color-surface-muted)]"
                      aria-label={t('files.actions') || 'Actions'}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  }
                  align="right"
                />
              )}
              <div className="p-2 text-[var(--color-muted-foreground)]">
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        );
      })}

      {/* Files */}
      {files.map((file) => {
        const dropdownItems = [
          {
            label: t('files.preview') || 'Preview',
            icon: <Eye className="w-4 h-4" />,
            onClick: () => onPreviewFile(file),
          },
          {
            label: t('files.download') || 'Download',
            icon: <Download className="w-4 h-4" />,
            onClick: () => onDownloadFile(file),
          },
          {
            label: t('files.copyLink') || 'Copy Link',
            icon: <LinkIcon className="w-4 h-4" />,
            onClick: () => onCopyLink(file),
          },
          ...(canMutate
            ? [
                {
                  label: t('common.edit') || 'Rename',
                  icon: <Pencil className="w-4 h-4" />,
                  onClick: () => onRenameFile(file),
                },
                {
                  label: t('common.delete') || 'Delete',
                  icon: <Trash2 className="w-4 h-4 text-[var(--color-error)]" />,
                  onClick: () => onDeleteFile(file),
                  className: 'text-[var(--color-error)]',
                },
              ]
            : []),
        ];

        return (
          <div
            key={file._id}
            onClick={() => onPreviewFile(file)}
            className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] active:scale-[0.99] transition-all cursor-pointer select-none"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="p-2.5 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-semibold text-[var(--color-foreground)] truncate">
                  {file.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                  <span className="font-semibold uppercase tracking-wider text-[10px] px-1 py-0.2 rounded bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                    {file.fileType || 'PDF'}
                  </span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onPreviewFile(file)}
                className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--primary)] active:bg-[var(--primary-soft)]"
                aria-label={t('files.preview') || 'Preview'}
              >
                <Eye className="w-4 h-4" />
              </button>

              <DropdownMenu
                items={dropdownItems}
                trigger={
                  <button
                    type="button"
                    className="p-2 min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-[var(--color-muted-foreground)] active:bg-[var(--color-surface-muted)]"
                    aria-label={t('files.actions') || 'Actions'}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                }
                align="right"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
