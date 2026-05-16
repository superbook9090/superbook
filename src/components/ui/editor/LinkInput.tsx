'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, ExternalLink, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LinkInputProps {
  initialUrl?: string;
  onSave: (url: string) => void;
  onCancel: () => void;
  onRemove?: () => void;
  theme?: 'indigo' | 'emerald';
}

export const LinkInput = ({
  initialUrl = '',
  onSave,
  onCancel,
  onRemove,
  theme = 'emerald',
}: LinkInputProps) => {
  const [url, setUrl] = useState(initialUrl);

  useEffect(() => {
    setUrl(initialUrl);
  }, [initialUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(url);
  };

  const themeColors = {
    indigo: 'focus:ring-[var(--student-primary)] border-[var(--student-border)] bg-[var(--student-soft)]/50',
    emerald: 'focus:ring-[var(--teacher-primary)] border-[var(--teacher-border)] bg-[var(--teacher-soft)]/50',
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-1 p-1 min-w-[280px] animate-in fade-in zoom-in duration-200"
    >
      <div className="relative flex-1">
        <input
          autoFocus
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste link or search..."
          className={cn(
            'w-full px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 transition-all',
            'bg-[var(--card-solid)] border-[var(--color-border)] text-[var(--color-foreground)]',
            themeColors[theme]
          )}
        />
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <button
        type="submit"
        className="p-1.5 text-[var(--color-success)] hover:bg-[var(--color-success-light)] dark:hover:bg-[var(--color-success)]/20 rounded-md transition-colors"
        title="Save"
      >
        <Check className="w-4 h-4" />
      </button>

      {onRemove && initialUrl && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-[var(--color-error)] hover:bg-[var(--color-error-light)] dark:hover:bg-[var(--color-error)]/20 rounded-md transition-colors"
          title="Remove Link"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      <button
        type="button"
        onClick={onCancel}
        className="p-1.5 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)] dark:hover:bg-gray-800 rounded-md transition-colors"
        title="Cancel"
      >
        <X className="w-4 h-4" />
      </button>
    </form>
  );
};
