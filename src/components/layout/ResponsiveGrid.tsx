import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

type GridVariant = 'cards' | 'stats' | 'dense' | 'charts' | 'statsWide';

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  variant?: GridVariant;
}

const variantClass: Record<GridVariant, string> = {
  cards: 'grid-responsive-cards',
  stats: 'grid-responsive-stats',
  dense: 'grid-responsive-dense',
  charts: 'grid-responsive-charts',
  statsWide: 'grid-responsive-stats-wide',
};

export function ResponsiveGrid({ children, className, variant = 'cards' }: ResponsiveGridProps) {
  return <div className={cn(variantClass[variant], className)}>{children}</div>;
}
