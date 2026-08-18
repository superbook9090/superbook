import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Save, AlertCircle, Pin } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { countWords } from '@/lib/wordCount';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { NoteColor, NoteItem } from '@/features/notes/types';
import { NoteColorPicker } from './editor/NoteColorPicker';
import { NoteTagInput } from './editor/NoteTagInput';
import { NoteFormattingToolbar } from './editor/NoteFormattingToolbar';

interface NoteEditorModalProps {
  isOpen: boolean;
  note?: NoteItem | null;
  maxWordsPerPage: number;
  onClose: () => void;
  onSave: (payload: {
    title: string;
    content: string;
    color: NoteColor;
    isPinned: boolean;
    tags: string[];
  }) => Promise<{ success: boolean; error?: string }>;
}

export function NoteEditorModal({
  isOpen,
  note,
  maxWordsPerPage,
  onClose,
  onSave,
}: NoteEditorModalProps) {
  const { t } = useTranslation();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteColor>('blue');
  const [isPinned, setIsPinned] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || 'blue');
      setIsPinned(note.isPinned || false);
      setTags(note.tags ? [...note.tags] : []);
    } else {
      setTitle('');
      setContent('');
      setColor('blue');
      setIsPinned(false);
      setTags([]);
    }
    setErrorMsg(null);
  }, [note, isOpen]);

  const currentWordCount = useMemo(() => countWords(content), [content]);
  const isWordLimitExceeded = currentWordCount > maxWordsPerPage;
  const wordCountPercent = Math.min(100, Math.round((currentWordCount / maxWordsPerPage) * 100));

  if (!isOpen) return null;

  const applyFormat = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.substring(start, end) || 'text';
    const newContent =
      content.substring(0, start) + prefix + selected + suffix + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setErrorMsg(t('notes.titleRequired'));
    if (!content.trim()) return setErrorMsg(t('notes.contentRequired'));
    if (isWordLimitExceeded) {
      return setErrorMsg(
        t('notes.wordLimitExceeded')
          .replace('{words}', String(currentWordCount))
          .replace('{max}', String(maxWordsPerPage))
      );
    }

    setSubmitting(true);
    setErrorMsg(null);
    const result = await onSave({
      title: title.trim(),
      content,
      color,
      isPinned,
      tags,
    });
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-bold text-lg text-[var(--color-foreground)]">
            {note ? t('notes.editNote') : t('notes.addNote')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded-xl hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 text-sm text-[var(--color-error)] bg-[var(--color-error-light)] border border-[var(--color-error)]/20 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Color Picker */}
          <NoteColorPicker color={color} onSelectColor={setColor} />

          {/* Title input */}
          <TextField
            label={t('notes.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notes.titlePlaceholder')}
            maxLength={150}
            required
            fullWidth
          />

          {/* Content Area with Word Meter & Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-[var(--color-foreground)]">
                {t('notes.contentLabel')} <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="text-xs">
                <span className={isWordLimitExceeded ? 'text-[var(--color-error)] font-bold' : 'text-[var(--color-muted)]'}>
                  {currentWordCount} / {maxWordsPerPage} {t('notes.words')}
                </span>
              </div>
            </div>

            <div className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isWordLimitExceeded
                    ? 'bg-[var(--color-error)]'
                    : wordCountPercent > 85
                    ? 'bg-[var(--color-warning)]'
                    : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${wordCountPercent}%` }}
              />
            </div>

            <NoteFormattingToolbar onApplyFormat={applyFormat} />

            <textarea
              ref={textareaRef}
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('notes.contentPlaceholder')}
              required
              className="w-full p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/15 leading-relaxed font-sans"
            />
          </div>

          {/* Tag input manager */}
          <NoteTagInput tags={tags} onChangeTags={setTags} />

          {/* Pin note toggle */}
          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="pin-note-checkbox"
              type="checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] cursor-pointer"
            />
            <label htmlFor="pin-note-checkbox" className="text-xs font-medium text-[var(--color-foreground)] flex items-center gap-1 cursor-pointer">
              <Pin className={`w-3.5 h-3.5 ${isPinned ? 'fill-[var(--warning)] text-[var(--warning)]' : 'text-[var(--color-muted)]'}`} />
              {t('notes.pinToTop')}
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button type="button" onClick={onClose} variant="secondary" size="md">
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={submitting || isWordLimitExceeded}
              isLoading={submitting}
              variant="primary"
              size="md"
            >
              {!submitting && <Save className="w-4 h-4 mr-2" />}
              <span>{submitting ? t('notes.saving') : t('notes.saveNote')}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
