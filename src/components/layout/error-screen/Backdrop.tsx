'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { AccentTone } from './types';

function FloatingSuit({ suit, className }: { suit: string; className: string }) {
  return (
    <span aria-hidden className={cn('absolute select-none font-semibold', className)}>
      {suit}
    </span>
  );
}

export function Backdrop({ tone }: { tone: AccentTone }) {
  const isNegative = tone === 'negative';
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'size-[640px] max-w-[140vw] rounded-full blur-[120px]',
            isNegative ? 'bg-red-500/10' : 'bg-purple-500/10'
          )}
        />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={cn(
            'size-[1100px] max-w-[160vw] rounded-full blur-[180px]',
            isNegative ? 'bg-red-500/[0.04]' : 'bg-purple-500/[0.04]'
          )}
        />
      </div>

      <div
        className="text-[var(--color-foreground)] absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <FloatingSuit
        suit="♠"
        className="text-[var(--color-foreground)]/[0.06] start-[6%] top-[10%] rotate-[-12deg] text-6xl sm:text-8xl"
      />
      <FloatingSuit
        suit="♥"
        className="text-[var(--color-foreground)]/[0.06] end-[8%] top-[14%] rotate-[18deg] text-5xl sm:text-7xl"
      />
      <FloatingSuit
        suit="♦"
        className="text-[var(--color-foreground)]/[0.06] bottom-[16%] start-[10%] rotate-[8deg] text-5xl sm:text-7xl"
      />
      <FloatingSuit
        suit="♣"
        className="text-[var(--color-foreground)]/[0.06] bottom-[12%] end-[6%] rotate-[-15deg] text-6xl sm:text-8xl"
      />
      <FloatingSuit
        suit="♠"
        className="text-[var(--color-foreground)]/[0.04] start-[3%] top-[45%] hidden rotate-[25deg] text-4xl sm:block"
      />
      <FloatingSuit
        suit="♥"
        className="text-[var(--color-foreground)]/[0.04] end-[3%] top-[55%] hidden rotate-[-20deg] text-4xl sm:block"
      />
    </div>
  );
}
