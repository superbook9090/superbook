'use client';

/**
 * Slot-machine-themed status page rendered for HTTP-shaped page states:
 *   - `not-found` (404, default) — the URL doesn't exist
 *   - `gone`      (410)          — the URL existed but was intentionally removed
 *   - `error`     (500)          — render / fetch failure from an `error.tsx` boundary
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
import type { AccentTone, ErrorScreenProps } from './error-screen/types';
import { COPY, REDIRECT_SECONDS } from './error-screen/types';
import { Backdrop } from './error-screen/Backdrop';
import { ErrorDetails } from './error-screen/ErrorDetails';
import { SlotMachine } from './error-screen/SlotMachine';

export default function ErrorScreen({
  retry,
  variant = 'not-found',
  embedded = false,
  inline = false,
  error,
}: ErrorScreenProps) {
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
