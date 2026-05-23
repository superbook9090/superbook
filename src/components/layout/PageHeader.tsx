import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-[var(--space-3)] sm:flex-row sm:items-start sm:justify-between',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <h1 className="page-title truncate">{title}</h1>
        {description ? (
          <p className="mt-[var(--space-2)] text-body text-[var(--muted)]">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex flex-shrink-0 flex-wrap items-center gap-[var(--space-2)] w-full sm:w-auto">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
