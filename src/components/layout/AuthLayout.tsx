import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

/**
 * AuthLayout - A reusable wrapper for authentication pages
 * 
 * Provides consistent layout for login, register, and other auth pages.
 * Centers content and provides a clean, focused layout.
 * 
 * @example
 * <AuthLayout title="Welcome Back" description="Sign in to your account">
 *   <LoginForm />
 * </AuthLayout>
 */
export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] px-4">
      <div className="w-full max-w-md">
        {title && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-foreground)]">{title}</h1>
            {description && (
              <p className="mt-2 text-[var(--color-muted-foreground)]">{description}</p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
