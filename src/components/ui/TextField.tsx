'use client';

import React, { forwardRef, useState, useId } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  multiline?: boolean;
  rows?: number;
  fullWidth?: boolean;
  // Support both input and textarea onChange
  onChange?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    event: React.ChangeEvent<any>
  ) => void;
  // Custom container class
  containerClassName?: string;
}

export const TextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  TextFieldProps
>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      type = 'text',
      multiline = false,
      rows = 4,
      fullWidth = false,
      disabled,
      required,
      className,
      containerClassName,
      id: customId,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalId = useId();
    const inputId = customId || internalId;
    const helperTextId = `${inputId}-helper`;
    const errorTextId = `${inputId}-error`;

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    const baseInputStyles = cn(
      'form-field text-base sm:text-sm transition-all duration-150 block w-full rounded-xl',
      'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]',
      'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
      startIcon && 'pl-11',
      (endIcon || isPassword) && 'pr-11',
      error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
      disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-muted-strong)]'
    );

    const inputWrapperStyles = cn(
      'relative flex items-center min-h-[44px]',
      fullWidth ? 'w-full' : 'w-auto'
    );

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[var(--color-foreground)] select-none"
          >
            {label}
            {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
          </label>
        )}

        <div className={inputWrapperStyles}>
          {startIcon && (
            <div className="absolute left-3.5 text-[var(--color-muted)] flex items-center pointer-events-none select-none">
              {startIcon}
            </div>
          )}

          {multiline ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              disabled={disabled}
              rows={rows}
              required={required}
              aria-invalid={!!error}
              aria-describedby={
                error ? errorTextId : helperText ? helperTextId : undefined
              }
              onChange={onChange}
              className={cn(baseInputStyles, 'py-3 min-h-[100px] resize-y', className)}
              style={{
                paddingLeft: startIcon ? '2.75rem' : undefined,
                paddingRight: endIcon ? '2.75rem' : undefined,
              }}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              type={inputType}
              disabled={disabled}
              required={required}
              aria-invalid={!!error}
              aria-describedby={
                error ? errorTextId : helperText ? helperTextId : undefined
              }
              onChange={onChange}
              className={cn(baseInputStyles, className)}
              style={{
                paddingLeft: startIcon ? '2.75rem' : undefined,
                paddingRight: (endIcon || isPassword) ? '2.75rem' : undefined,
              }}
              {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {/* Suffix icon / Password visibility toggle */}
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={disabled}
              tabIndex={0}
              className="absolute right-3.5 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors focus-ring rounded-lg p-1"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 shrink-0" />
              ) : (
                <Eye className="w-5 h-5 shrink-0" />
              )}
            </button>
          ) : (
            endIcon && (
              <div className="absolute right-3.5 text-[var(--color-muted)] flex items-center pointer-events-none select-none">
                {endIcon}
              </div>
            )
          )}
        </div>

        {/* Error and Helper Text messages using Framer Motion for smooth rendering */}
        <AnimatePresence initial={false}>
          {error ? (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              id={errorTextId}
              className="flex items-center gap-1 text-xs font-medium text-[var(--color-error)]"
            >
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </motion.p>
          ) : (
            helperText && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                id={helperTextId}
                className="text-xs text-[var(--color-muted)]"
              >
                {helperText}
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>
    );
  }
);

TextField.displayName = 'TextField';
