'use client';

import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import BackButton from '@/components/ui/BackButton';
import { cn } from '@/lib/utils';

interface AdminPageBannerProps {
  icon?: LucideIcon;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  badges?: ReactNode;
  tier?: 'admin' | 'superadmin';
  className?: string;
}

const SUPERADMIN_GRADIENT =
  'linear-gradient(90deg, #f59e0b 0%, var(--teacher-primary) 100%)';

export function AdminPageBanner({
  icon: Icon,
  eyebrow,
  title,
  description,
  actions,
  backHref,
  backLabel,
  badges,
  tier = 'admin',
  className,
}: AdminPageBannerProps) {
  const isSuper = tier === 'superadmin';
  const topBarStyle = isSuper
    ? { background: SUPERADMIN_GRADIENT }
    : { background: 'var(--teacher-gradient)' };

  const eyebrowTone = isSuper
    ? 'bg-amber-500/12 text-amber-700 dark:text-amber-400 border-amber-500/30'
    : 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border-[var(--teacher-border)]';

  return (
    <section
      className={cn(
        'teacher-panel overflow-hidden p-4 sm:p-6',
        isSuper && 'border-amber-500/25',
        className
      )}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px]"
        style={topBarStyle}
        aria-hidden
      />
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={topBarStyle}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-3">
        {backHref && backLabel && (
          <div>
            <BackButton
              href={backHref}
              label={backLabel}
              className="text-xs font-semibold text-[var(--color-muted-foreground)] hover:text-[var(--teacher-primary)] transition-colors"
            />
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-1.5">
            {(eyebrow || badges) && (
              <div className="flex items-center gap-2 flex-wrap">
                {eyebrow && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border',
                      eyebrowTone
                    )}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden />}
                    <span>{eyebrow}</span>
                  </span>
                )}
                {badges}
              </div>
            )}

            <div className="flex items-center gap-2.5 min-w-0">
              {!eyebrow && Icon && (
                <span
                  className={cn(
                    'inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border shrink-0',
                    eyebrowTone
                  )}
                >
                  <Icon className="w-5 h-5" aria-hidden />
                </span>
              )}
              <h1 className="text-xl sm:text-2xl lg:text-[1.75rem] font-extrabold font-[family-name:var(--font-display)] tracking-tight text-[var(--color-foreground)] leading-tight break-words">
                {title}
              </h1>
            </div>

            {description && (
              <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default AdminPageBanner;
