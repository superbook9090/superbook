import { ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageWrapper - A reusable wrapper for dashboard pages
 * 
 * Provides consistent spacing, padding, and mobile responsiveness
 * across all dashboard pages.
 * 
 * @example
 * <PageWrapper>
 *   <BlogList />
 * </PageWrapper>
 */
export function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <div className={`px-4 sm:px-6 lg:px-8 space-y-6 ${className}`}>
      {children}
    </div>
  );
}
