import React from 'react';
import { Pin, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { NoteItem } from '@/hooks/useNotes';

interface NoteCardProps {
  note: NoteItem;
  maxWordsPerPage: number;
  onEdit: (note: NoteItem) => void;
  onDelete: (note: NoteItem) => void;
  onTogglePin: (note: NoteItem) => void;
}

const COLOR_MAP: Record<NoteItem['color'], { border: string; badge: string }> = {
  blue: {
    border: 'border-blue-500/30 dark:border-blue-500/20',
    badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  },
  amber: {
    border: 'border-amber-500/30 dark:border-amber-500/20',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  },
  emerald: {
    border: 'border-emerald-500/30 dark:border-emerald-500/20',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  },
  rose: {
    border: 'border-rose-500/30 dark:border-rose-500/20',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  },
  purple: {
    border: 'border-purple-500/30 dark:border-purple-500/20',
    badge: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  },
  slate: {
    border: 'border-slate-500/30 dark:border-slate-500/20',
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  },
};

export function NoteCard({
  note,
  maxWordsPerPage,
  onEdit,
  onDelete,
  onTogglePin,
}: NoteCardProps) {
  const { t } = useTranslation();
  const theme = COLOR_MAP[note.color || 'blue'];
  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const previewSnippet = note.content.replace(/<[^>]*>/g, '').trim();

  return (
    <div
      className={`card-panel relative flex flex-col justify-between p-5 rounded-2xl border ${theme.border} transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <h3 className="font-semibold text-base text-[var(--color-foreground)] line-clamp-1 flex-1">
            {note.title}
          </h3>
          <button
            type="button"
            onClick={() => onTogglePin(note)}
            title={note.isPinned ? t('notes.unpinNote') : t('notes.pinNote')}
            className={`p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
              note.isPinned
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'
            }`}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        <p className="text-sm text-[var(--color-muted)] line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap">
          {previewSnippet || t('notes.noContent')}
        </p>
      </div>

      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2 mt-2">
        <div className="flex items-center gap-2 text-xs">
          <span className={`px-2.5 py-1 rounded-md font-medium ${theme.badge}`}>
            {note.wordCount} / {maxWordsPerPage} {t('notes.words')}
          </span>
          <span className="text-[var(--color-muted)]">{formattedDate}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(note)}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('notes.editNote')}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(note)}
            className="p-2 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={t('notes.deleteNote')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
