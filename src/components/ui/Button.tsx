'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
  theme?: 'student' | 'teacher';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      fullWidth = false,
      theme = 'student',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center font-medium transition-all duration-200',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
      'press-effect',
      fullWidth && 'w-full'
    );

    const variants = {
      primary: theme === 'student'
        ? 'bg-[var(--student-primary)] text-white hover:bg-[var(--student-primary-dark)] focus-visible:ring-[var(--student-primary)] shadow-md hover:shadow-lg'
        : 'bg-[var(--teacher-primary)] text-white hover:bg-[var(--teacher-primary-dark)] focus-visible:ring-[var(--teacher-primary)] shadow-md hover:shadow-lg',
      secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900 shadow-md hover:shadow-lg',
      outline: theme === 'student'
        ? 'border-2 border-[var(--student-primary)] text-[var(--student-primary)] hover:bg-[var(--student-primary-light)] focus-visible:ring-[var(--student-primary)]'
        : 'border-2 border-[var(--teacher-primary)] text-[var(--teacher-primary)] hover:bg-[var(--teacher-primary-light)] focus-visible:ring-[var(--teacher-primary)]',
      ghost: theme === 'student'
        ? 'text-[var(--student-primary)] hover:bg-[var(--student-primary-light)] focus-visible:ring-[var(--student-primary)]'
        : 'text-[var(--teacher-primary)] hover:bg-[var(--teacher-primary-light)] focus-visible:ring-[var(--teacher-primary)]',
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
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps };
