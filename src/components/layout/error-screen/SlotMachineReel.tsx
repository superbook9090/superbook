'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AccentTone } from './types';

export const SLOT_STYLE = `
.slot-machine { --cell-h: 2rem; }
@media (min-width: 640px) { .slot-machine { --cell-h: 2.6667rem; } }
@keyframes slot-reel-spin {
  0%   { transform: translateY(0); }
  100% { transform: translateY(calc(var(--cell-h) * var(--reel-spins, 22) * -1)); }
}
@media (prefers-reduced-motion: reduce) {
  .slot-reel-strip {
    animation: none !important;
    transform: translateY(calc(var(--cell-h) * var(--reel-spins, 22) * -1));
  }
}
`;

export function Reel({
  digit,
  index,
  tone,
}: {
  digit: string;
  index: number;
  tone: AccentTone;
}) {
  const num = Number.parseInt(digit, 10);
  const prev = (((num - 1) % 10) + 10) % 10;
  const next = (num + 1) % 10;
  const isNegative = tone === 'negative';

  const spins = 22 + index * 4;
  const delayMs = index * 220;

  const strip: number[] = [];
  for (let i = 0; i < spins; i++) {
    strip.push((i * (7 + index) + 1) % 10);
  }
  strip.push(prev, num, next);
  strip.push((spins + 3) % 10, (spins + 5) % 10);

  return (
    <div
      className={cn(
        'relative h-24 w-16 overflow-hidden rounded-lg sm:h-32 sm:w-20',
        'border border-[var(--color-border)]',
        'bg-gradient-to-b from-[var(--color-background)] via-[var(--color-card)] to-[var(--color-background)]'
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-1/4 bg-gradient-to-b from-[var(--color-background)] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/4 bg-gradient-to-t from-[var(--color-background)] to-transparent" />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-20 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.4) 2px, rgba(255,255,255,0.4) 3px)',
        }}
      />

      <div
        className="slot-reel-strip absolute inset-x-0 top-0 flex flex-col items-center will-change-transform"
        style={
          {
            '--reel-spins': spins,
            animation: `slot-reel-spin 2.4s cubic-bezier(0.16, 1, 0.3, 1) both`,
            animationDelay: `${delayMs}ms`,
          } as React.CSSProperties
        }
      >
        {strip.map((d, i) => (
          <div
            key={i}
            className="flex w-full shrink-0 items-center justify-center"
            style={{ height: 'var(--cell-h)' }}
          >
            <span
              className={cn(
                'text-3xl font-extrabold leading-none sm:text-4xl',
                'bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent',
                isNegative
                  ? 'drop-shadow-[0_0_14px_rgba(239,68,68,0.8)]'
                  : 'drop-shadow-[0_0_14px_rgba(168,85,247,0.8)]'
              )}
            >
              {d}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
