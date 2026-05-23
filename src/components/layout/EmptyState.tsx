import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'card-surface flex flex-col items-center justify-center text-center py-[var(--space-8)] sm:py-[var(--space-10)] px-[var(--card-padding)] border-dashed',
        className
      )}
      role="status"
    >
      {Icon ? (
        <Icon className="w-12 h-12 text-[var(--muted)] opacity-40 mb-[var(--space-4)]" aria-hidden />
      ) : null}
      <h3 className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-[var(--space-1)]">{title}</h3>
      {description ? <p className="text-body text-[var(--muted)] max-w-md">{description}</p> : null}
      {action ? <div className="mt-[var(--space-6)]">{action}</div> : null}
    </div>
  );
}
