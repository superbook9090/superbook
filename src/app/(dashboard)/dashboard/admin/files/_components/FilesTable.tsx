'use client';

import React from 'react';
import {
  Folder,
  FileText,
  Eye,
  Download,
  Link as LinkIcon,
  Pencil,
  Trash2,
} from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';
import { useTranslation } from '@/hooks/useTranslation';
import { formatBytes, type FileNodeItem, type FolderNode } from './types';

interface FilesTableProps {
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

export function FilesTable({
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
}: FilesTableProps) {
  const { t } = useTranslation();

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)] font-semibold text-xs border-b border-[var(--border)]">
            <tr>
              <th scope="col" className="px-4 py-3.5 min-w-[240px]">
                {t('files.fileName') || 'Name'}
              </th>
              <th scope="col" className="px-4 py-3.5 w-28">
                {t('organizations.status') || 'Type'}
              </th>
              <th scope="col" className="px-4 py-3.5 w-28">
                {t('files.fileSize') || 'Size'}
              </th>
              <th scope="col" className="px-4 py-3.5 w-36">
                {t('files.lastModified') || 'Date'}
              </th>
              <th scope="col" className="px-4 py-3.5 text-right w-44">
                {t('files.actions') || 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {/* Folders */}
            {folders.map((folder) => {
              const formattedDate = folder.createdAt
                ? new Date(folder.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-';

              return (
                <tr
                  key={folder._id}
                  onClick={() => onOpenFolder(folder)}
                  className="group hover:bg-[var(--color-surface-muted)]/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--color-warning-light)] text-[var(--color-warning)] shrink-0">
                        <Folder className="w-4 h-4 fill-current opacity-80" />
                      </div>
                      <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate max-w-xs md:max-w-md">
                        {folder.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-warning-light)] text-[var(--color-warning)]">
                      {t('files.folder') || 'Folder'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">-</td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{formattedDate}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canMutate && (
                        <>
                          <Tooltip label={t('common.edit') || 'Rename'}>
                            <button
                              type="button"
                              onClick={() => onRenameFolder(folder)}
                              className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                              aria-label={t('common.edit') || 'Rename'}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip label={t('common.delete') || 'Delete'}>
                            <button
                              type="button"
                              onClick={() => onDeleteFolder(folder)}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-error-light)] text-[var(--color-muted-foreground)] hover:text-[var(--color-error)] transition-colors"
                              aria-label={t('common.delete') || 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Files */}
            {files.map((file) => {
              const formattedDate = file.createdAt
                ? new Date(file.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '-';

              return (
                <tr
                  key={file._id}
                  onClick={() => onPreviewFile(file)}
                  className="group hover:bg-[var(--color-surface-muted)]/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-[var(--color-error-light)] text-[var(--color-error)] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--primary)] transition-colors truncate max-w-xs md:max-w-md">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]">
                      {file.fileType || 'PDF'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
                    {formatBytes(file.size)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">{formattedDate}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip label={t('files.preview') || 'Preview'}>
                        <button
                          type="button"
                          onClick={() => onPreviewFile(file)}
                          className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                          aria-label={t('files.preview') || 'Preview'}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label={t('files.download') || 'Download'}>
                        <button
                          type="button"
                          onClick={() => onDownloadFile(file)}
                          className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                          aria-label={t('files.download') || 'Download'}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      <Tooltip label={t('files.copyLink') || 'Copy Link'}>
                        <button
                          type="button"
                          onClick={() => onCopyLink(file)}
                          className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                          aria-label={t('files.copyLink') || 'Copy Link'}
                        >
                          <LinkIcon className="w-4 h-4" />
                        </button>
                      </Tooltip>
                      {canMutate && (
                        <>
                          <Tooltip label={t('common.edit') || 'Rename'}>
                            <button
                              type="button"
                              onClick={() => onRenameFile(file)}
                              className="p-1.5 rounded-lg hover:bg-[var(--primary-soft)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-colors"
                              aria-label={t('common.edit') || 'Rename'}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip label={t('common.delete') || 'Delete'}>
                            <button
                              type="button"
                              onClick={() => onDeleteFile(file)}
                              className="p-1.5 rounded-lg hover:bg-[var(--color-error-light)] text-[var(--color-muted-foreground)] hover:text-[var(--color-error)] transition-colors"
                              aria-label={t('common.delete') || 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
