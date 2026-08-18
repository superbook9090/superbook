'use client';

import React from 'react';
import {
  FileText,
  Eye,
  Download,
  Link as LinkIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, type FileNodeItem } from './types';

interface FileGridCardProps {
  file: FileNodeItem;
  canMutate: boolean;
  onPreview: (file: FileNodeItem) => void;
  onDownload: (file: FileNodeItem) => void;
  onCopyLink: (file: FileNodeItem) => void;
  onRename: (file: FileNodeItem) => void;
  onDelete: (file: FileNodeItem) => void;
}

export function FileGridCard({
  file,
  canMutate,
  onPreview,
  onDownload,
  onCopyLink,
  onRename,
  onDelete,
}: FileGridCardProps) {
  const { t } = useTranslation();

  const formattedDate = file.createdAt
    ? new Date(file.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const dropdownItems = [
    {
      label: t('files.preview') || 'Preview',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onPreview(file),
    },
    {
      label: t('files.download') || 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: () => onDownload(file),
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
            onClick: () => onRename(file),
          },
          {
            label: t('common.delete') || 'Delete',
            icon: <Trash2 className="w-4 h-4 text-[var(--color-error)]" />,
            onClick: () => onDelete(file),
            className: 'text-[var(--color-error)] hover:bg-[var(--color-error-light)]',
          },
        ]
      : []),
  ];

  return (
    <div className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] hover:border-[var(--color-error)]/40 hover:shadow-md transition-all duration-200 text-left">
      <div className="flex items-start justify-between gap-2">
        <div
          onClick={() => onPreview(file)}
          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
        >
          <div className="p-3 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] border border-[var(--color-error)]/20 shrink-0 group-hover:scale-105 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors"
              title={file.name}
            >
              {file.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-[var(--color-muted-foreground)]">
              <span className="font-semibold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                {file.fileType || 'PDF'}
              </span>
              <span>•</span>
              <span>{formatBytes(file.size)}</span>
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <DropdownMenu
            items={dropdownItems}
            trigger={
              <button
                type="button"
                className="p-1.5 rounded-lg text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
                aria-label={t('files.actions') || 'Actions'}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            align="right"
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted-foreground)]">{formattedDate}</span>

        <div className="flex items-center gap-1">
          <Tooltip label={t('files.preview') || 'Preview'}>
            <button
              type="button"
              onClick={() => onPreview(file)}
              className="p-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
              aria-label={t('files.preview') || 'Preview'}
            >
              <Eye className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip label={t('files.download') || 'Download'}>
            <button
              type="button"
              onClick={() => onDownload(file)}
              className="p-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
              aria-label={t('files.download') || 'Download'}
            >
              <Download className="w-4 h-4" />
            </button>
          </Tooltip>
          <Tooltip label={t('files.copyLink') || 'Copy Link'}>
            <button
              type="button"
              onClick={() => onCopyLink(file)}
              className="p-1.5 rounded-lg bg-[var(--color-surface-muted)] hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
              aria-label={t('files.copyLink') || 'Copy Link'}
            >
              <LinkIcon className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
