'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface EditorFieldProps {
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

/** Compact label + control wrapper shared across blog, lesson, and quiz editors. */
export function EditorField({ label, hint, error, htmlFor, className, children }: EditorFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-xs sm:text-sm font-semibold text-[var(--color-foreground)]"
      >
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-[var(--color-muted-foreground)]">{hint}</p>
      )}
      {error && (
        <p className="text-[11px] text-[var(--color-error)] font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/** Shared compact input styles for editor forms. */
export const editorInputClass =
  'w-full min-h-[40px] px-3 py-2 text-sm bg-[var(--color-background)] text-[var(--color-foreground)] border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/25 focus:border-[var(--color-primary)]';

export const editorSelectClass = editorInputClass;

/** Number input without browser spinner arrows — use with type="text" + inputMode="numeric". */
export const editorNumberInputClass = cn(
  editorInputClass,
  '[appearance:textfield] [-moz-appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
);
