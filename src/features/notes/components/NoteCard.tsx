import React, { useState } from 'react';
import { Pin, Edit2, Trash2, Eye, Copy, Check, Tag } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { NOTE_CATEGORIES, type NoteItem } from '@/features/notes/types';

interface NoteCardProps {
  note: NoteItem;
  maxWordsPerPage: number;
  onView: (note: NoteItem) => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (note: NoteItem) => void;
  onTogglePin: (note: NoteItem) => void;
  onSelectTag?: (tag: string) => void;
}

export function NoteCard({
  note,
  maxWordsPerPage,
  onView,
  onEdit,
  onDelete,
  onTogglePin,
  onSelectTag,
}: NoteCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const category = NOTE_CATEGORIES[note.color || 'blue'] || NOTE_CATEGORIES.blue;
  const wordPercent = Math.min(100, Math.round(((note.wordCount || 0) / Math.max(1, maxWordsPerPage)) * 100));

  const formattedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
      className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-[var(--card-solid)] border ${category.borderClass} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden`}
    >
      {/* Top Accent Gradient Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${category.gradientClass}`} />

      <div>
        {/* Header: Category Badge & Pin Action */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${category.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${category.dotClass}`} />
            {t(category.labelKey)}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin(note);
            }}
            title={note.isPinned ? t('notes.unpinNote') : t('notes.pinNote')}
            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
              note.isPinned
                ? 'text-amber-500 bg-amber-500/10 hover:bg-amber-500/20'
                : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-foreground)]'
            }`}
          >
            <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-amber-500' : ''}`} />
          </button>
        </div>

        {/* Note Title */}
        <h3 className="font-bold text-base text-[var(--color-foreground)] line-clamp-1 mb-2 group-hover:text-[var(--color-primary)] transition-colors">
          {note.title}
        </h3>

        {/* Snippet Content */}
        <p className="text-sm text-[var(--color-muted)] line-clamp-3 leading-relaxed mb-4 whitespace-pre-wrap">
          {previewSnippet || t('notes.noContent')}
        </p>

        {/* Tags list if present */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectTag?.(tag);
                }}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-[var(--color-surface-muted)] text-[var(--color-muted)] text-[11px] font-medium hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted-strong)] transition-colors"
              >
                <Tag className="w-2.5 h-2.5 opacity-70" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] font-semibold text-[var(--color-muted)]">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer: Word Gauge, Date, and Actions */}
      <div className="pt-3 border-t border-[var(--color-border)] space-y-2.5">
        {/* Word progress line */}
        <div className="flex items-center justify-between text-xs text-[var(--color-muted)]">
          <span className="font-medium">
            {note.wordCount || 0} / {maxWordsPerPage} {t('notes.words')}
          </span>
          <span>{formattedDate}</span>
        </div>
        <div className="w-full h-1 bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              wordPercent > 90 ? 'bg-[var(--color-error)]' : 'bg-[var(--color-primary)]'
            }`}
            style={{ width: `${wordPercent}%` }}
          />
        </div>

        {/* Action Button Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(note);
              }}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
              title={t('notes.viewNote')}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors"
              title={copied ? t('notes.copied') : t('notes.copyContent')}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(note);
              }}
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)] transition-colors"
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
              className="p-1.5 rounded-lg text-[var(--color-muted)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-light)] transition-colors"
              title={t('notes.deleteNote')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
