'use client';

/**
 * Slot-machine-themed status page rendered for HTTP-shaped page states:
 *   - `not-found` (404, default) — the URL doesn't exist
 *   - `gone`      (410)          — the URL existed but was intentionally removed
 *   - `error`     (500)          — render / fetch failure from an `error.tsx` boundary
 *
 * Mounted from Next.js convention files (`not-found.tsx`, `error.tsx`) and
 * error boundaries across the app. Layout knobs (`embedded`, `inline`) toggle
 * full-screen vs card-style presentation depending on parent route chrome.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKeyInput } from '@/i18n';
import { cn } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import Button from '@/components/ui/Button';

type AccentTone = 'brand' | 'negative';

const REDIRECT_SECONDS = 8;

type Variant = 'not-found' | 'gone' | 'error';

type Props = {
  retry?: () => void;
  variant?: Variant;
  embedded?: boolean;
  inline?: boolean;
  error?: (Error & { digest?: string }) | null;
};

const COPY: Record<
  Variant,
  { code: string; titleKey: string; bodyKey: string; statusKey: string }
> = {
  'not-found': {
    code: '404',
    titleKey: 'pageNotFound',
    bodyKey: 'pageNotFoundBody',
    statusKey: 'slotStatusNotFound',
  },
  gone: {
    code: '410',
    titleKey: 'pageGone',
    bodyKey: 'pageGoneBody',
    statusKey: 'slotStatusGone',
  },
  error: {
    code: '500',
    titleKey: 'pageError',
    bodyKey: 'pageErrorBody',
    statusKey: 'slotStatusError',
  },
};

export default function ErrorScreen({
  retry,
  variant = 'not-found',
  embedded = false,
  inline = false,
  error,
}: Props) {
  const { t } = useTranslation();
  const { code, titleKey, bodyKey, statusKey } = COPY[variant];
  const router = useRouter();
  const isError = variant === 'error';
  const tone: AccentTone = isError ? 'negative' : 'brand';

  const showErrorDetails =
    isError && !!error && process.env.NODE_ENV !== 'production';

  const [countdown, setCountdown] = useState(REDIRECT_SECONDS);
  const [autoRedirect, setAutoRedirect] = useState(!embedded && !isError);

  useEffect(() => {
    if (!autoRedirect) return;
    if (countdown <= 0) {
      router.replace(ROUTES.home);
      return;
    }
    const timer = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [autoRedirect, countdown, router]);

  useEffect(() => {
    if (!autoRedirect) return;
    const cancel = () => setAutoRedirect(false);
    window.addEventListener('pointerdown', cancel);
    window.addEventListener('keydown', cancel);
    return () => {
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('keydown', cancel);
    };
  }, [autoRedirect]);

  return (
    <>
      {variant === 'gone' && (
        <meta name="robots" content="noindex,nofollow" />
      )}
      <section
        className={cn(
          'relative isolate flex w-full flex-col items-center justify-center',
          'overflow-hidden px-4 text-[var(--color-foreground)]',
          embedded
            ? 'bg-[var(--color-card)] min-h-[60dvh] rounded-2xl py-10 sm:py-16 shadow-lg border border-[var(--color-border)]'
            : inline
            ? 'py-4 sm:py-6'
            : 'min-h-[100dvh] py-6 sm:py-12 bg-[var(--color-background)]'
        )}
      >
        <Backdrop tone={tone} />

        <div className="relative z-10 flex flex-col items-center gap-5 text-center sm:gap-7 max-w-2xl mx-auto">
          <Link
            href={ROUTES.home}
            onClick={isError ? undefined : retry}
            aria-label={t('errors.homeAriaLabel')}
            className="inline-block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          >
            <BrandLogo size="md" />
          </Link>

          <SlotMachine
            code={code}
            status={t(`errors.${statusKey}` as TranslationKeyInput)}
            leverAriaLabel={t('errors.pullLeverAriaLabel')}
            tone={tone}
          />

          <div className="flex max-w-sm flex-col items-center gap-2 sm:max-w-md sm:gap-3">
            <h1 className="text-[var(--color-foreground)] text-2xl font-bold leading-tight sm:text-4xl">
              {t(`errors.${titleKey}` as TranslationKeyInput)}
            </h1>
            <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed sm:text-base">
              {t(`errors.${bodyKey}` as TranslationKeyInput)}
            </p>
          </div>

          {showErrorDetails && error && <ErrorDetails error={error} />}

          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center items-center">
            {isError && retry ? (
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto sm:min-w-52"
                onClick={retry}
              >
                <span>{t('errors.tryAgain')}</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto sm:min-w-52"
                onClick={() => {
                  if (retry) retry();
                  router.push(ROUTES.home);
                }}
              >
                <span>{t('errors.backToHome')}</span>
                {autoRedirect && countdown > 0 && (
                  <span
                    aria-hidden
                    className="ms-2 tabular-nums opacity-70"
                  >{`· ${countdown}s`}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export { ErrorScreen as StatusPage };

const SLOT_STYLE = `
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

function SlotMachine({
  code,
  status,
  leverAriaLabel,
  tone,
}: {
  code: string;
  status: string;
  leverAriaLabel: string;
  tone: AccentTone;
}) {
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

function Lever({
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

function Marquee({ tone }: { tone: AccentTone }) {
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

function Bolt({ className }: { className?: string }) {
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

function Reel({
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

function Backdrop({ tone }: { tone: AccentTone }) {
  const isNegative = tone === 'negative';
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
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
            isNegative
              ? 'bg-red-500/[0.04]'
              : 'bg-purple-500/[0.04]'
          )}
        />
      </div>

      <div
        className="text-[var(--color-foreground)] absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
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

function FloatingSuit({
  suit,
  className,
}: {
  suit: string;
  className: string;
}) {
  return (
    <span
      aria-hidden
      className={cn('absolute select-none font-semibold', className)}
    >
      {suit}
    </span>
  );
}

function ErrorDetails({ error }: { error: Error & { digest?: string } }) {
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
