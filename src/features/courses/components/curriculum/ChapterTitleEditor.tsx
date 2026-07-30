'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiClientError } from '@/lib/api/http';
import { Check, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useUpdateChapter, type Chapter } from '@/lib/react-query/hooks';
import Tooltip from '@/components/ui/Tooltip';

interface ChapterTitleEditorProps {
  chapter: Chapter;
  courseId: string;
  onDone: () => void;
}

export function ChapterTitleEditor({ chapter, courseId, onDone }: ChapterTitleEditorProps) {
  const { t } = useTranslation();
  const updateChapter = useUpdateChapter();
  const [title, setTitle] = useState(chapter.title);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError(t('curriculum.chapterTitleRequired'));
      return;
    }
    if (trimmed === chapter.title) {
      onDone();
      return;
    }

    setError(null);
    updateChapter.mutate(
      { chapterId: chapter._id, courseId, data: { title: trimmed } },
      {
        onSuccess: () => onDone(),
        onError: (err) => {
          const message =
            err instanceof ApiClientError ? err.message : t('curriculum.saveChapterFailed');
          setError(message);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col gap-1 min-w-0">
      <div className="flex flex-1 gap-2 min-w-0">
        <input
          ref={inputRef}
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSave();
            }
            if (e.key === 'Escape') {
              e.preventDefault();
              onDone();
            }
          }}
          disabled={updateChapter.isPending}
          className="flex-1 min-w-0 bg-[var(--color-background)] border border-[var(--color-primary)] rounded-lg px-3 py-1.5 text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 disabled:opacity-60 min-h-[44px]"
          aria-label={t('curriculum.editChapter')}
        />
        <Tooltip label={t('common.save')}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleSave}
            disabled={updateChapter.isPending}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-white bg-[var(--color-primary)] hover:opacity-90 rounded-lg transition-opacity disabled:opacity-50"
            aria-label={t('common.save')}
          >
            {updateChapter.isPending ? (
              <span className="w-4 h-4 block border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        </Tooltip>
        <Tooltip label={t('common.cancel')}>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onDone}
            disabled={updateChapter.isPending}
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] rounded-lg transition-colors disabled:opacity-50"
            aria-label={t('common.cancel')}
          >
            <X className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>
      {error && (
        <p className="text-xs text-[var(--color-error)] font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
