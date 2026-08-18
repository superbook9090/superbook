import React from 'react';
import { Bold, Italic, Heading, List, ListOrdered, Quote, Code } from 'lucide-react';

interface NoteFormattingToolbarProps {
  onApplyFormat: (prefix: string, suffix?: string) => void;
}

export function NoteFormattingToolbar({ onApplyFormat }: NoteFormattingToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-muted)] rounded-lg border border-[var(--color-border)] flex-wrap">
      <button
        type="button"
        onClick={() => onApplyFormat('**', '**')}
        title="Bold (**text**)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <Bold className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('*', '*')}
        title="Italic (*text*)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <Italic className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('### ')}
        title="Heading (### Heading)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <Heading className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('- ')}
        title="Bullet List (- item)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <List className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('1. ')}
        title="Numbered List (1. item)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <ListOrdered className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('> ')}
        title="Quote (> quote)"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <Quote className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        onClick={() => onApplyFormat('```\n', '\n```')}
        title="Code Block"
        className="p-1.5 rounded hover:bg-[var(--card-solid)] text-[var(--color-foreground)] transition-colors cursor-pointer"
      >
        <Code className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
