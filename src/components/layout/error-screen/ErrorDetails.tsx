'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export function ErrorDetails({ error }: { error: Error & { digest?: string } }) {
  return (
    <details
      className={cn(
        'w-full max-w-2xl text-start',
        'border-red-500/40 bg-red-500/[0.05]',
        'rounded-md border p-3 sm:p-4'
      )}
    >
      <summary
        className={cn(
          'text-red-500 cursor-pointer select-none',
          'text-xs font-semibold uppercase tracking-wider sm:text-sm'
        )}
      >
        {error.name || 'Error'}
        {error.digest ? ` · digest ${error.digest}` : ''}
        <span className="text-[var(--color-muted-foreground)] ms-2 font-normal normal-case tracking-normal">
          (dev only — hidden in production)
        </span>
      </summary>
      <div className="mt-2 flex flex-col gap-2">
        <pre
          className={cn(
            'text-[var(--color-foreground)] text-xs sm:text-sm',
            'whitespace-pre-wrap break-words font-mono'
          )}
        >
          {error.message || '(no message)'}
        </pre>
        {error.stack && (
          <pre
            className={cn(
              'text-[var(--color-muted-foreground)] text-[10px] sm:text-xs',
              'max-h-72 overflow-auto whitespace-pre-wrap break-words font-mono',
              'border border-[var(--color-border)] bg-[var(--color-background)] rounded p-2'
            )}
          >
            {error.stack}
          </pre>
        )}
      </div>
    </details>
  );
}
