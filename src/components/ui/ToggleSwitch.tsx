'use client';

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

/** Accessible pill toggle with a proper touch target on mobile. */
export default function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  className,
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative shrink-0 rounded-full p-2 -m-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          'h-7 w-12 sm:h-6 sm:w-11',
          checked ? 'bg-[var(--primary)]' : 'bg-neutral-300'
        )}
      >
        <span
          className={cn(
            'inline-block rounded-full bg-white shadow-sm transition-transform duration-200',
            'h-5 w-5 sm:h-4 sm:w-4',
            checked ? 'translate-x-6 sm:translate-x-6' : 'translate-x-1'
          )}
        />
      </span>
    </button>
  );
}
