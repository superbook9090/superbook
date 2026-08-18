import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { NOTE_CATEGORIES, type NoteColor } from '@/features/notes/types';

interface NoteColorPickerProps {
  color: NoteColor;
  onSelectColor: (c: NoteColor) => void;
}

const COLOR_OPTIONS: NoteColor[] = [
  'blue',
  'amber',
  'emerald',
  'rose',
  'purple',
  'slate',
];

export function NoteColorPicker({ color, onSelectColor }: NoteColorPickerProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] mb-2">
        {t('notes.selectColor')}
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {COLOR_OPTIONS.map((c) => {
          const config = NOTE_CATEGORIES[c];
          const isSelected = color === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => onSelectColor(c)}
              className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                isSelected
                  ? `bg-[var(--color-surface-muted)] ${config.borderClass} ring-2 ${config.activeRingClass} text-[var(--color-foreground)] font-semibold shadow-xs`
                  : 'border-[var(--color-border)] hover:bg-[var(--color-surface-muted)] text-[var(--color-muted)]'
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotClass}`} />
              <span className="truncate">{t(config.labelKey)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
