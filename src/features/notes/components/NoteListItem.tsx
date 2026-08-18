import React, { useState } from 'react';
import { Pin, Edit2, Trash2, Eye, Copy, Check, Tag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { NOTE_CATEGORIES, type NoteItem } from '@/features/notes/types';

interface NoteListItemProps {
  note: NoteItem;
  maxWordsPerPage: number;
  onView: (note: NoteItem) => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (note: NoteItem) => void;
  onTogglePin: (note: NoteItem) => void;
  onSelectTag?: (tag: string) => void;
}

export function NoteListItem({
  note,
  maxWordsPerPage,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onSelectTag,
}: NoteListItemProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const category = NOTE_CATEGORIES[note.color || 'blue'] || NOTE_CATEGORIES.blue;
  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });

  const previewSnippet = note.content.replace(/<[^>]*>/g, '').trim();

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(previewSnippet || note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div
      onClick={() => onView(note)}
      className="group flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:shadow-xs transition-all cursor-pointer gap-3"
    >
      {/* Left section: Category dot, Pin, Title & snippet */}
      <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          title={note.isPinned ? t('notes.unpinNote') : t('notes.pinNote')}
          className={`p-1.5 rounded-lg transition-colors flex-shrink-0 min-h-[36px] min-w-[36px] flex items-center justify-center ${
            note.isPinned
              ? 'text-[var(--warning)] bg-[var(--warning-light)]'
              : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'
          }`}
        >
          <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-[var(--warning)]' : ''}`} />
        </button>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[11px] font-semibold border ${category.badgeClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${category.dotClass}`} />
              {t(category.labelKey)}
            </span>
            <h4 className="font-bold text-sm text-[var(--color-foreground)] truncate group-hover:text-[var(--color-primary)] transition-colors">
              {note.title}
            </h4>
          </div>
          <p className="text-xs text-[var(--color-muted)] truncate max-w-xl">
            {previewSnippet || t('notes.noContent')}
          </p>
        </div>
      </div>

      {/* Middle/Right section: Tags, Word Count, Date & Action buttons */}
      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--color-border)]">
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="hidden md:flex items-center gap-1">
            {note.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-muted)] text-[11px] font-medium hover:text-[var(--color-foreground)] transition-colors"
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                {tag}
              </span>
            ))}
            {note.tags.length > 2 && (
              <span className="text-[10px] text-[var(--color-muted)]">+{note.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* Word count & date */}
        <div className="text-right text-xs text-[var(--color-muted)] min-w-[90px]">
          <div className="font-medium text-[var(--color-foreground)]">
            {note.wordCount || 0} / {maxWordsPerPage} w
          </div>
          <div className="text-[11px]">{formattedDate}</div>
        </div>

        {/* Actions toolbar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onView(note);
            }}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('notes.viewNote')}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={copied ? t('notes.copied') : t('notes.copyContent')}
          >
            {copied ? <Check className="w-4 h-4 text-[var(--success)]" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(note);
            }}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('notes.editNote')}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(note);
            }}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title={t('notes.deleteNote')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
