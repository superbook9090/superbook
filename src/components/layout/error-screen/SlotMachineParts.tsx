'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AccentTone } from './types';

export function Bolt({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'absolute size-1.5 rounded-full sm:size-2',
        'bg-[var(--color-background)] border border-[var(--color-border)]',
        'shadow-[inset_0_-1px_0_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)]',
        className
      )}
    />
  );
}

export function Marquee({ tone }: { tone: AccentTone }) {
  const isNegative = tone === 'negative';
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <span
          key={i}
          className={cn(
            'size-1 animate-pulse rounded-full sm:size-1.5',
            isNegative
              ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
              : 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]'
          )}
          style={{ animationDelay: `${i * 0.12}s`, animationDuration: '1.4s' }}
        />
      ))}
    </div>
  );
}

export function Lever({
  onPull,
  ariaLabel,
  tone,
}: {
  onPull: () => void;
  ariaLabel: string;
  tone: AccentTone;
}) {
  const isNegative = tone === 'negative';
  return (
    <button
      type="button"
      onClick={onPull}
      aria-label={ariaLabel}
      className={cn(
        'group absolute start-full top-1/2 ms-1 flex -translate-y-1/2 cursor-pointer flex-col items-center sm:ms-2',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex origin-bottom flex-col items-center',
          'transition-transform duration-200 ease-out',
          'group-hover:rotate-[6deg] group-active:rotate-[28deg]'
        )}
      >
        <span
          className={cn(
            'block size-4 rounded-full bg-gradient-to-br sm:size-5',
            'shadow-[0_3px_6px_rgba(0,0,0,0.45),inset_0_2px_2px_rgba(255,255,255,0.5),inset_0_-2px_3px_rgba(0,0,0,0.3)]',
            isNegative
              ? 'from-red-500 via-red-600 to-red-800'
              : 'from-purple-500 via-indigo-600 to-purple-800'
          )}
        />
        <span
          className={cn(
            '-mt-px block h-12 w-1 sm:h-16 sm:w-1.5',
            'bg-gradient-to-r from-[rgba(255,255,255,0.15)] via-white/80 to-[rgba(255,255,255,0.15)]'
          )}
        />
      </span>

      <span
        aria-hidden
        className={cn(
          '-mt-px block h-2.5 w-5 rounded-sm sm:h-3 sm:w-7',
          'bg-gradient-to-b from-[var(--color-card)] to-[var(--color-background)]',
          'border border-[var(--color-border)]',
          'shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]'
        )}
      />
    </button>
  );
}
