'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import Loader from '@/components/ui/Loader';
import { useRoleTheme } from '@/contexts/RoleThemeContext';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
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
      'relative inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'press-effect',
      fullWidth && 'w-full'
    );

    const variants = {
      primary: `bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg focus-visible:ring-offset-2 focus-visible:ring-2`,
      secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900 shadow-md hover:shadow-lg',
      outline: `border-2 ${theme.border} ${theme.text} ${theme.activeBg} hover:opacity-80 focus-visible:ring-offset-2 focus-visible:ring-2`,
      ghost: `${theme.text} ${theme.activeBg} hover:opacity-80 focus-visible:ring-offset-2 focus-visible:ring-2`,
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600 shadow-md hover:shadow-lg',
      success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-600 shadow-md hover:shadow-lg',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2.5 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...props as any}
      >
        {isLoading && (
          <Loader variant="button" size="sm" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps };
