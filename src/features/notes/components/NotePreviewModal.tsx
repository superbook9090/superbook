import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  Printer,
  Edit2,
  Trash2,
  Pin,
  Calendar,
  FileText,
  Tag,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import { NOTE_CATEGORIES, type NoteItem } from '@/features/notes/types';

interface NotePreviewModalProps {
  isOpen: boolean;
  note: NoteItem | null;
  maxWordsPerPage: number;
  onClose: () => void;
  onEdit: (note: NoteItem) => void;
  onDelete: (note: NoteItem) => void;
  onTogglePin: (note: NoteItem) => void;
}

export function NotePreviewModal({
  isOpen,
  note,
  maxWordsPerPage,
  onClose,
  onEdit,
  onDelete,
  onTogglePin,
}: NotePreviewModalProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  const category = NOTE_CATEGORIES[note.color || 'blue'] || NOTE_CATEGORIES.blue;
  const createdDate = new Date(note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const updatedDate = new Date(note.updatedAt || note.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const previewSnippet = note.content.replace(/<[^>]*>/g, '').trim();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewSnippet || note.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = (type: 'txt' | 'md') => {
    const filename = `${note.title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.${type}`;
    const textContent =
      type === 'md'
        ? `# ${note.title}\n\n*Category: ${t(category.labelKey)} | Created: ${createdDate}*\n\n${previewSnippet || note.content}`
        : `${note.title}\nCategory: ${t(category.labelKey)}\nCreated: ${createdDate}\n\n${previewSnippet || note.content}`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className={`h-1.5 w-full bg-gradient-to-r ${category.gradientClass}`} />

        {/* Modal Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[var(--color-border)] gap-4">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${category.badgeClass}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${category.dotClass}`} />
                {t(category.labelKey)}
              </span>

              {note.isPinned && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--warning-light)] text-[var(--warning)] border border-[var(--warning)]/20">
                  <Pin className="w-3 h-3 fill-[var(--warning)]" />
                  {t('notes.pinned')}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-[var(--color-foreground)] leading-snug break-words">
              {note.title}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onTogglePin(note)}
              className={`p-2 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center ${
                note.isPinned
                  ? 'text-[var(--warning)] bg-[var(--warning-light)] hover:bg-[var(--warning-light)]'
                  : 'text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]'
              }`}
              title={note.isPinned ? t('notes.unpinNote') : t('notes.pinNote')}
            >
              <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-[var(--warning)]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-surface-muted)] min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Metadata bar */}
          <div className="flex items-center gap-4 text-xs text-[var(--color-muted)] pb-3 border-b border-[var(--color-border)] flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {t('notes.lastUpdated').replace('{time}', updatedDate)}
            </span>
            <span className="flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" />
              {note.wordCount || 0} / {maxWordsPerPage} {t('notes.words')}
            </span>
          </div>

          {/* Formatted Content */}
          <div className="text-base text-[var(--color-foreground)] leading-relaxed whitespace-pre-wrap font-sans">
            {previewSnippet || t('notes.noContent')}
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="pt-4 border-t border-[var(--color-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] block mb-2">
                {t('notes.tagsLabel')}
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] text-[var(--color-foreground)] text-xs font-medium"
                  >
                    <Tag className="w-3 h-3 text-[var(--color-muted)]" />
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/40">
          <div className="flex items-center gap-2 flex-wrap">
            <Button onClick={handleCopy} variant="secondary" size="sm">
              {copied ? <Check className="w-4 h-4 mr-1.5 text-[var(--success)]" /> : <Copy className="w-4 h-4 mr-1.5" />}
              <span>{copied ? t('notes.copied') : t('notes.copyContent')}</span>
            </Button>
            <Button onClick={() => handleDownload('md')} variant="secondary" size="sm">
              <Download className="w-4 h-4 mr-1.5" />
              <span>{t('notes.downloadMd')}</span>
            </Button>
            <Button onClick={handlePrint} variant="secondary" size="sm" className="hidden sm:inline-flex">
              <Printer className="w-4 h-4 mr-1.5" />
              <span>{t('notes.print')}</span>
            </Button>
          </div>

          <div className="flex items-center justify-end gap-2">
            <Button
              onClick={() => {
                onClose();
                onDelete(note);
              }}
              variant="danger"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              <span>{t('notes.deleteNote')}</span>
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              variant="primary"
              size="sm"
            >
              <Edit2 className="w-4 h-4 mr-1.5" />
              <span>{t('notes.editNote')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
