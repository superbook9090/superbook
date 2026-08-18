import React from 'react';
import { Folder, MoreVertical, Pencil, Trash2, ChevronRight } from 'lucide-react';
import DropdownMenu from '@/components/ui/DropdownMenu';
import { useTranslation } from '@/hooks/useTranslation';
import type { FolderNode } from './types';

interface FolderGridCardProps {
  folder: FolderNode;
  canMutate: boolean;
  onOpen: (folder: FolderNode) => void;
  onRename: (folder: FolderNode) => void;
  onDelete: (folder: FolderNode) => void;
}

export function FolderGridCard({
  folder,
  canMutate,
  onOpen,
  onRename,
  onDelete,
}: FolderGridCardProps) {
  const { t } = useTranslation();

  const formattedDate = folder.createdAt
    ? new Date(folder.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const dropdownItems = [
    {
      label: t('common.edit') || 'Rename',
      icon: <Pencil className="w-4 h-4" />,
      onClick: () => onRename(folder),
    },
    {
      label: t('common.delete') || 'Delete',
      icon: <Trash2 className="w-4 h-4 text-[var(--color-error)]" />,
      onClick: () => onDelete(folder),
      className: 'text-[var(--color-error)] hover:bg-[var(--color-error-light)]',
    },
  ];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(folder)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(folder);
        }
      }}
      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] hover:border-[var(--color-warning)]/50 hover:shadow-md transition-all duration-200 cursor-pointer select-none text-left"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-3 rounded-xl bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/20 shrink-0 group-hover:scale-105 transition-transform">
            <Folder className="w-6 h-6 fill-current opacity-80" />
          </div>
          <div className="min-w-0 flex-1">
            <h3
              className="text-sm font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors"
              title={folder.name}
            >
              {folder.name}
            </h3>
            <p className="text-xs text-[var(--color-muted-foreground)] mt-0.5">
              {t('files.folder') || 'Folder'}
            </p>
          </div>
        </div>

        {canMutate && (
          <div onClick={(e) => e.stopPropagation()} className="shrink-0">
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
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
        <span>{formattedDate}</span>
        <div className="flex items-center gap-1 text-[var(--primary)] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{t('files.view') || 'Open'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}
