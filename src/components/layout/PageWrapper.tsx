import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  /** Tighter vertical rhythm for dense dashboards */
  compact?: boolean;
}

/** Mobile-first page content wrapper. Use inside dashboard main. */
export function PageWrapper({ children, className, compact }: PageWrapperProps) {
  return (
    <div className={cn('stack-page', compact && 'stack-page--compact', className)}>
      {children}
    </div>
  );
}
