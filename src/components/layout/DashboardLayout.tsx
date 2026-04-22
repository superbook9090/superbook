import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * DashboardLayout - A reusable wrapper for dashboard pages
 * 
 * Provides consistent layout structure for all dashboard pages
 * including sidebar, header, and main content area.
 * 
 * @example
 * <DashboardLayout>
 *   <AdminAnalyticsPage />
 * </DashboardLayout>
 */
export function DashboardLayout({ children, className = '' }: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-[var(--color-background)] ${className}`}>
      <div className="flex">
        {/* Sidebar placeholder - will be integrated with actual sidebar component */}
        {/* Header placeholder - will be integrated with actual header component */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
