'use client';

import { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
  /** Extra classes for the wrapper span (e.g. positioning when wrapping an absolutely-positioned button). */
  className?: string;
}

/** Lightweight CSS-only hover/focus tooltip for icon buttons. */
export default function Tooltip({ label, children, position = 'top', className = '' }: TooltipProps) {
  const bubblePlacement =
    position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  const arrowPlacement =
    position === 'top'
      ? 'top-full border-t-[var(--color-foreground)]'
      : 'bottom-full border-b-[var(--color-foreground)]';

  // Both `relative` and a caller-provided `absolute`/`fixed` would conflict in the
  // compiled stylesheet (order there wins, not class order) — so only add `relative`
  // when the caller doesn't position the wrapper itself.
  const positionClass = /\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative';

  return (
    <span className={`${positionClass} inline-flex group/tooltip ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 -translate-x-1/2 ${bubblePlacement} z-50 whitespace-nowrap rounded-md bg-[var(--color-foreground)] text-[var(--color-background)] text-xs font-medium px-2.5 py-1.5 shadow-lg opacity-0 scale-95 transition-all duration-150 group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 group-focus-within/tooltip:opacity-100 group-focus-within/tooltip:scale-100`}
      >
        {label}
        <span
          className={`absolute left-1/2 -translate-x-1/2 ${arrowPlacement} border-4 border-transparent`}
        />
      </span>
    </span>
  );
}
