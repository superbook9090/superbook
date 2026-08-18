'use client';

import React from 'react';
import {
  FileText,
  Download,
  ExternalLink,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, type FileNodeItem } from './types';

interface FilePreviewModalProps {
  isOpen: boolean;
  file: FileNodeItem | null;
  onDownload: (file: FileNodeItem) => void;
  onCopyLink: (file: FileNodeItem) => void;
  onClose: () => void;
}

export function FilePreviewModal({
  isOpen,
  file,
  onDownload,
  onCopyLink,
  onClose,
}: FilePreviewModalProps) {
  const { t } = useTranslation();

  if (!isOpen || !file) return null;

  const previewUrl = `/api/files/view/${file._id}`;
  const formattedDate = file.createdAt
    ? new Date(file.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-5xl h-[92vh] max-h-[850px] bg-[var(--card-solid)] border border-[var(--border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--border)] bg-[var(--color-surface-muted)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-[var(--color-error-light)] text-[var(--color-error)] shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] truncate max-w-xs sm:max-w-md md:max-w-lg">
                {file.name}
              </h3>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                {formatBytes(file.size)} • {formattedDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <Tooltip label={t('files.copyLink') || 'Copy Link'}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCopyLink(file)}
                className="hidden sm:inline-flex items-center gap-1.5"
              >
                <LinkIcon className="w-4 h-4" />
                <span>{t('files.copyLink') || 'Copy Link'}</span>
              </Button>
            </Tooltip>

            <Tooltip label={t('files.download') || 'Download'}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDownload(file)}
                className="hidden sm:inline-flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>{t('files.download') || 'Download'}</span>
              </Button>
            </Tooltip>

            <Tooltip label={t('files.openInNewTab') || 'Open in new tab'}>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-[var(--card-solid)] hover:bg-[var(--primary-soft)] text-[var(--color-foreground)] hover:text-[var(--primary)] border border-[var(--border)] transition-colors inline-flex items-center justify-center"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </Tooltip>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer Body */}
        <div className="flex-1 bg-[var(--color-surface-muted)] relative overflow-hidden">
          <iframe
            src={`${previewUrl}#toolbar=1&navpanes=0`}
            title={file.name}
            className="w-full h-full border-0"
          />
        </div>
      </div>
    </div>
  );
}
