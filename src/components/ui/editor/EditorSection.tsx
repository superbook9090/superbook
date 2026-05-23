'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditorSectionProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Collapsible section for dense editor panels (lessons, quizzes, etc.). */
export function EditorSection({
  title,
  subtitle,
  defaultOpen = true,
  badge,
  className,
  children,
}: EditorSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section
      className={cn(
        'border border-[var(--color-border)] rounded-xl bg-[var(--color-background)]/40 overflow-hidden',
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-[var(--color-surface-muted)]/50 transition-colors"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn(
            'w-4 h-4 shrink-0 text-[var(--color-muted)] transition-transform',
            open && 'rotate-180'
          )}
        />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--color-foreground)]">{title}</span>
          {subtitle && (
            <span className="block text-[11px] text-[var(--color-muted-foreground)] truncate">
              {subtitle}
            </span>
          )}
        </div>
        {badge}
      </button>
      {open && <div className="px-3 pb-3 pt-1 space-y-3 border-t border-[var(--color-border)]">{children}</div>}
    </section>
  );
}
