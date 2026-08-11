import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { countWords } from '@/lib/wordCount';
import Button from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import type { NoteItem } from '@/hooks/useNotes';

interface NoteEditorModalProps {
  isOpen: boolean;
  note?: NoteItem | null;
  maxWordsPerPage: number;
  onClose: () => void;
  onSave: (payload: { title: string; content: string; color: NoteItem['color'] }) => Promise<{ success: boolean; error?: string }>;
}

const COLOR_OPTIONS: NoteItem['color'][] = ['blue', 'amber', 'emerald', 'rose', 'purple', 'slate'];

export function NoteEditorModal({
  isOpen,
  note,
  maxWordsPerPage,
  onClose,
  onSave,
}: NoteEditorModalProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState<NoteItem['color']>('blue');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setColor(note.color || 'blue');
    } else {
      setTitle('');
      setContent('');
      setColor('blue');
    }
    setErrorMsg(null);
  }, [note, isOpen]);

  const currentWordCount = useMemo(() => countWords(content), [content]);
  const isWordLimitExceeded = currentWordCount > maxWordsPerPage;
  const wordCountPercentage = Math.min(100, Math.round((currentWordCount / maxWordsPerPage) * 100));

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(t('notes.titleRequired'));
      return;
    }
    if (!content.trim()) {
      setErrorMsg(t('notes.contentRequired'));
      return;
    }
    if (isWordLimitExceeded) {
      setErrorMsg(
        t('notes.wordLimitExceeded')
          .replace('{words}', String(currentWordCount))
          .replace('{max}', String(maxWordsPerPage))
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    const result = await onSave({ title: title.trim(), content, color });
    setSubmitting(false);

    if (result.success) {
      onClose();
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h3 className="font-semibold text-lg text-[var(--color-foreground)]">
            {note ? t('notes.editNote') : t('notes.addNote')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)] min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg ? (
            <div className="flex items-center gap-2 p-3 text-sm text-[var(--color-error)] bg-[var(--color-error-light)] border border-[var(--color-error)]/20 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <TextField
            label={t('notes.titleLabel')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('notes.titlePlaceholder')}
            maxLength={150}
            required
            fullWidth
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-[var(--color-foreground)]">
                {t('notes.contentLabel')} <span className="text-[var(--color-error)]">*</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                <span className={isWordLimitExceeded ? 'text-[var(--color-error)] font-bold' : 'text-[var(--color-muted)]'}>
                  {currentWordCount} / {maxWordsPerPage} {t('notes.words')}
                </span>
              </div>
            </div>

            {/* Word count progress bar */}
            <div className="w-full h-1.5 bg-[var(--color-surface-muted)] rounded-full overflow-hidden mb-2">
              <div
                className={`h-full transition-all duration-300 ${
                  isWordLimitExceeded
                    ? 'bg-[var(--color-error)]'
                    : wordCountPercentage > 85
                    ? 'bg-[var(--color-warning)]'
                    : 'bg-[var(--color-primary)]'
                }`}
                style={{ width: `${wordCountPercentage}%` }}
              />
            </div>

            <TextField
              multiline
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('notes.contentPlaceholder')}
              required
              fullWidth
              error={isWordLimitExceeded ? t('notes.wordLimitExceeded').replace('{words}', String(currentWordCount)).replace('{max}', String(maxWordsPerPage)) : undefined}
            />
          </div>

          {/* Color selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
              {t('notes.selectColor')}
            </label>
            <div className="flex items-center gap-3">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    c === 'blue'
                      ? 'bg-blue-500'
                      : c === 'amber'
                      ? 'bg-amber-500'
                      : c === 'emerald'
                      ? 'bg-emerald-500'
                      : c === 'rose'
                      ? 'bg-rose-500'
                      : c === 'purple'
                      ? 'bg-purple-500'
                      : 'bg-slate-500'
                  } ${color === c ? 'ring-2 ring-offset-2 ring-[var(--color-primary)] border-white' : 'border-transparent opacity-80 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-border)]">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              size="md"
            >
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
