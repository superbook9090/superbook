'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { AccentTone } from './types';
import { Bolt, Marquee, Lever } from './SlotMachineParts';
import { Reel, SLOT_STYLE } from './SlotMachineReel';

interface SlotMachineProps {
  code: string;
  status: string;
  leverAriaLabel: string;
  tone: AccentTone;
}

export function SlotMachine({ code, status, leverAriaLabel, tone }: SlotMachineProps) {
  const [spinId, setSpinId] = useState(0);
  const digits = code.split('');
  const isNegative = tone === 'negative';

  return (
    <div className="slot-machine relative">
      <style dangerouslySetInnerHTML={{ __html: SLOT_STYLE }} />

      <div
        className={cn(
          'absolute -inset-6 rounded-full blur-3xl sm:-inset-10',
          isNegative ? 'bg-red-500/20' : 'bg-purple-500/20'
        )}
      />

      <div
        className={cn(
          'relative rounded-2xl border shadow-2xl p-3 sm:p-5',
          'bg-gradient-to-b from-[var(--color-card)] via-[var(--color-card)] to-[var(--color-background)]',
          isNegative ? 'border-red-500/40' : 'border-purple-500/40'
        )}
      >
        <Bolt className="start-2 top-2 sm:start-3 sm:top-3" />
        <Bolt className="end-2 top-2 sm:end-3 sm:top-3" />
        <Bolt className="bottom-2 start-2 sm:bottom-3 sm:start-3" />
        <Bolt className="bottom-2 end-2 sm:bottom-3 sm:end-3" />

        <Marquee tone={tone} />

        <div
          className={cn(
            'relative mt-3 rounded-xl border p-1.5 sm:mt-4 sm:p-2',
            'border-[var(--color-border)] bg-[var(--color-background)]',
            'shadow-[inset_0_4px_18px_rgba(0,0,0,0.3)]'
          )}
        >
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            {digits.map((d, i) => (
              <Reel key={`${spinId}-${i}`} digit={d} index={i} tone={tone} />
            ))}
          </div>

          <div
            className={cn(
              'pointer-events-none absolute inset-x-2 top-1/2 z-20 h-px -translate-y-1/2 bg-gradient-to-r from-transparent to-transparent',
              isNegative
                ? 'via-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                : 'via-purple-500/70 shadow-[0_0_12px_rgba(168,85,247,0.7)]'
            )}
          />
        </div>

        <div className="text-[var(--color-muted-foreground)] mt-3 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] sm:mt-4 sm:text-xs">
          <span
            className={cn(
              'size-1.5 animate-pulse rounded-full',
              isNegative
                ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'
            )}
          />
          <span>{status}</span>
        </div>

        <Lever
          onPull={() => setSpinId((s) => s + 1)}
          ariaLabel={leverAriaLabel}
          tone={tone}
        />
      </div>
    </div>
  );
}
