import { useId } from 'react';

type Size = 'sm' | 'md' | 'lg' | 'xl';

interface BrandLogoProps {
  size?: Size;
  /** Wordmark next to the mark; inherits currentColor from the parent. */
  withWordmark?: boolean;
  /** White outline style for gradient / colored backgrounds. */
  mono?: boolean;
  className?: string;
}

const markSize: Record<Size, string> = {
  sm: 'h-7 w-7',
  md: 'h-8 w-8 sm:h-9 sm:w-9',
  lg: 'h-10 w-10 sm:h-11 sm:w-11',
  xl: 'h-12 w-12 sm:h-14 sm:w-14',
};

const textSize: Record<Size, string> = {
  sm: 'text-base',
  md: 'text-lg sm:text-xl',
  lg: 'text-xl sm:text-2xl',
  xl: 'text-2xl sm:text-3xl',
};

/**
 * Theme-aware brand logo. The mark uses the role/theme gradient tokens and the
 * wordmark uses currentColor, so it picks up the right color from wherever it
 * sits — set `mono` on gradient or colored panels.
 */
export default function BrandLogo({
  size = 'md',
  withWordmark = true,
  mono = false,
  className = '',
}: BrandLogoProps) {
  // Unique per instance: a shared id would resolve to the first occurrence in
  // the DOM, which may sit inside a display:none container (e.g. the md:hidden
  // mobile header) where Chrome refuses to paint referenced gradients.
  const gradId = useId();
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 48 48" className={`${markSize[size]} shrink-0`} role="img" aria-label="Quiz Do">
        {mono ? (
          <rect
            x="2.75"
            y="2.75"
            width="42.5"
            height="42.5"
            rx="12.5"
            fill="rgba(255,255,255,0.16)"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="1.5"
          />
        ) : (
          <>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" style={{ stopColor: 'var(--primary, #6366f1)' }} />
                <stop offset="1" style={{ stopColor: 'var(--primary-accent, #a855f7)' }} />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#${gradId})`} />
          </>
        )}
        <path
          d="M14 25.5 L21.5 33 L34 16.5"
          fill="none"
          stroke="#fff"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {withWordmark && (
        <span
          className={`font-bold tracking-tight leading-none ${textSize[size]}`}
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Quiz Do
        </span>
      )}
    </span>
  );
}
