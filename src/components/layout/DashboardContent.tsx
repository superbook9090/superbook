import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

/** Scrollable dashboard main region with mobile safe-area padding. */
export function DashboardContent({ children, className }: DashboardContentProps) {
  return (
    <main className={cn('dashboard-main flex-1', className)} id="dashboard-main">
      <div className="dashboard-main__inner">{children}</div>
    </main>
  );
}
