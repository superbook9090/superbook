'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader } from '@/components/ui/Loader';
import { useRoleTheme } from '@/contexts/RoleThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const { theme } = useRoleTheme();

    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-semibold transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
      'min-h-[44px]', // Mobile touch target rule
      fullWidth && 'w-full'
    );

    const variants = {
      primary: cn(
        `bg-gradient-to-r ${theme.gradient} text-white`,
        'shadow-lg hover:shadow-xl',
        'hover:brightness-110 active:brightness-95',
        'focus-visible:ring-offset-2 focus-visible:ring-2'
      ),
      secondary: cn(
        'bg-[var(--color-surface-muted)] text-[var(--color-foreground)]',
        'hover:bg-[var(--color-surface-muted-strong)]',
        'active:bg-[var(--color-muted)]',
        'focus-visible:ring-[var(--color-muted)]'
      ),
      outline: cn(
        `border-2 ${theme.border} ${theme.text}`,
        'hover:bg-[var(--color-surface-muted)]',
        'active:bg-[var(--color-surface-muted-strong)]',
        'focus-visible:ring-offset-2 focus-visible:ring-2'
      ),
      ghost: cn(
        `${theme.text} ${theme.activeBg}`,
        'hover:opacity-80',
        'active:opacity-60',
        'focus-visible:ring-offset-2 focus-visible:ring-2'
      ),
      danger: cn(
        'bg-[var(--color-error)] text-white',
        'hover:opacity-90',
        'active:opacity-80',
        'shadow-md hover:shadow-lg',
        'focus-visible:ring-[var(--color-error)]'
      ),
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-lg',
      md: 'px-5 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.01, y: disabled || isLoading ? 0 : -1 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...props as any}
      >
        {isLoading && (
          <Loader size="sm" />
        )}
        {!isLoading && children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps };
