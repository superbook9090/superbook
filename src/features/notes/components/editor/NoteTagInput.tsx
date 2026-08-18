import React, { useState } from 'react';
import { Tag, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';

interface NoteTagInputProps {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
}

export function NoteTagInput({ tags, onChangeTags }: NoteTagInputProps) {
  const { t } = useTranslation();
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '').toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 8) {
      onChangeTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChangeTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-1.5">
        {t('notes.tagsLabel')}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--color-muted)] pointer-events-none" />
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={t('notes.tagsPlaceholder')}
            maxLength={30}
            className="w-full pl-9 pr-3 py-2 bg-[var(--color-surface-muted)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)]"
          />
        </div>
        <Button type="button" onClick={handleAddTag} variant="secondary" size="sm">
          {t('notes.addTag')}
        </Button>
      </div>

      {tags.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-foreground)]"
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemoveTag(tag)}
                className="text-[var(--color-muted)] hover:text-[var(--color-error)] cursor-pointer"
                title="Remove tag"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
