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

  const iconBtnClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:bg-[var(--teacher-soft)] hover:text-[var(--teacher-primary)] transition-colors cursor-pointer';
  const dangerBtnClass =
    'inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card-solid)] text-[var(--color-muted-foreground)] hover:bg-[var(--error-light)] hover:text-[var(--error)] transition-colors cursor-pointer';

  return (
    <div className="teacher-panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-[var(--surface-muted)]/75 text-[var(--color-muted-foreground)] font-bold uppercase text-[11px] tracking-wider border-b border-[var(--border)]">
            <tr>
              <th scope="col" className="px-4 py-3.5 min-w-[240px]">
                {t('files.fileName')}
              </th>
              <th scope="col" className="px-4 py-3.5 w-28">
                {t('organizations.status')}
              </th>
              <th scope="col" className="px-4 py-3.5 w-28">
                {t('files.fileSize')}
              </th>
              <th scope="col" className="px-4 py-3.5 w-36">
                {t('files.lastModified')}
              </th>
              <th scope="col" className="px-4 py-3.5 text-right w-48">
                {t('files.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]/70">
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
                  className="group hover:bg-[var(--surface-muted)]/45 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--warning-light)] text-[var(--warning)] shrink-0">
                        <Folder className="w-4 h-4 fill-current opacity-85" />
                      </span>
                      <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors truncate max-w-xs md:max-w-md">
                        {folder.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--warning-light)] text-[var(--warning)]">
                      {t('files.folder')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[var(--color-muted-foreground)]">—</td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)]">{formattedDate}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {canMutate && (
                        <>
                          <Tooltip label={t('common.edit')}>
                            <button
                              type="button"
                              onClick={() => onRenameFolder(folder)}
                              className={iconBtnClass}
                              aria-label={t('common.edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip label={t('common.delete')}>
                            <button
                              type="button"
                              onClick={() => onDeleteFolder(folder)}
                              className={dangerBtnClass}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}

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
                  className="group hover:bg-[var(--surface-muted)]/45 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-[var(--error-light)] text-[var(--error)] shrink-0">
                        <FileText className="w-4 h-4" />
                      </span>
                      <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--teacher-primary)] transition-colors truncate max-w-xs md:max-w-md">
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold uppercase bg-[var(--surface-muted)] text-[var(--color-muted-foreground)]">
                      {file.fileType || 'PDF'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)] tabular-nums">
                    {formatBytes(file.size)}
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--color-muted-foreground)]">{formattedDate}</td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip label={t('files.preview')}>
                        <button
                          type="button"
                          onClick={() => onPreviewFile(file)}
                          className={iconBtnClass}
                          aria-label={t('files.preview')}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip label={t('files.download')}>
                        <button
                          type="button"
                          onClick={() => onDownloadFile(file)}
                          className={iconBtnClass}
                          aria-label={t('files.download')}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip label={t('files.copyLink')}>
                        <button
                          type="button"
                          onClick={() => onCopyLink(file)}
                          className={iconBtnClass}
                          aria-label={t('files.copyLink')}
                        >
                          <LinkIcon className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                      {canMutate && (
                        <>
                          <Tooltip label={t('common.edit')}>
                            <button
                              type="button"
                              onClick={() => onRenameFile(file)}
                              className={iconBtnClass}
                              aria-label={t('common.edit')}
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                          </Tooltip>
                          <Tooltip label={t('common.delete')}>
                            <button
                              type="button"
                              onClick={() => onDeleteFile(file)}
                              className={dangerBtnClass}
                              aria-label={t('common.delete')}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
