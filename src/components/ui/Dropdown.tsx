'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

export interface DropdownProps {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  startIcon?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  label,
  error,
  helperText,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  required = false,
  name,
  id: customId,
  startIcon,
  className,
  containerClassName,
}) => {
  const internalId = useId();
  const dropdownId = customId || internalId;
  const helperTextId = `${dropdownId}-helper`;
  const errorTextId = `${dropdownId}-error`;
  const labelId = `${dropdownId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  const handleNativeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };

  // Keyboard navigation for desktop mode
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        setIsOpen((prev) => !prev);
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus next option or select it
          const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
          const nextIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
          handleSelect(String(options[nextIndex].value));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          // Focus previous option or select it
          const currentIndex = options.findIndex((opt) => String(opt.value) === String(value));
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
          handleSelect(String(options[prevIndex].value));
        }
        break;
      default:
        break;
    }
  };

  const baseInputStyles = cn(
    'form-field text-base sm:text-sm transition-all duration-150 block w-full rounded-xl select-none text-left',
    'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]',
    'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
    startIcon && 'pl-11',
    'pr-11',
    error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
    disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-muted-strong)]'
  );

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col gap-1.5 w-full relative', containerClassName)}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={dropdownId}
          className="block text-sm font-medium text-[var(--color-foreground)] select-none"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}

      {/* --------------------
          MOBILE NATIVE SELECT
          -------------------- */}
      <div className="relative flex items-center min-h-[44px] sm:hidden w-full">
        {startIcon && (
          <div className="absolute left-3.5 text-[var(--color-muted)] flex items-center pointer-events-none select-none">
            {startIcon}
          </div>
        )}
        <select
          id={dropdownId}
          name={name}
          value={value || ''}
          onChange={handleNativeChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorTextId : helperText ? helperTextId : undefined
          }
          className={cn(
            baseInputStyles,
            'appearance-none py-2.5 cursor-pointer',
            !value && 'text-[var(--color-muted)]',
            className
          )}
          style={{
            paddingLeft: startIcon ? '2.75rem' : undefined,
            paddingRight: '2.75rem',
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-[var(--color-muted)] pointer-events-none flex items-center select-none">
          <ChevronDown className="w-5 h-5 shrink-0" />
        </div>
      </div>

      {/* --------------------
          DESKTOP CUSTOM SELECT
          -------------------- */}
      <div className="relative hidden sm:block w-full">
        <button
          type="button"
          id={`${dropdownId}-btn`}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? labelId : undefined}
          aria-describedby={
            error ? errorTextId : helperText ? helperTextId : undefined
          }
          disabled={disabled}
          className={cn(
            baseInputStyles,
            'flex items-center justify-between cursor-pointer py-2.5',
            !selectedOption && 'text-[var(--color-muted)]',
            className
          )}
          style={{
            paddingLeft: startIcon ? '2.75rem' : undefined,
            paddingRight: '2.75rem',
          }}
        >
          <div className="flex items-center gap-2 truncate">
            {startIcon && (
              <span className="text-[var(--color-muted)] shrink-0 flex items-center">
                {startIcon}
              </span>
            )}
            {selectedOption ? (
              <span className="flex items-center gap-2 truncate text-[var(--color-foreground)]">
                {selectedOption.icon}
                {selectedOption.label}
              </span>
            ) : (
              <span>{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-[var(--color-muted)] transition-transform duration-200 shrink-0 ml-2',
              isOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Custom Form Data Binding for standard form submits */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={value || ''}
            required={required}
          />
        )}

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute z-30 mt-2 w-full bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl shadow-lg overflow-hidden py-1"
            >
              <ul
                role="listbox"
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : 'Dropdown options'}
                className="max-h-60 overflow-y-auto scrollbar-thin"
              >
                {options.map((option) => {
                  const isSelected = String(option.value) === String(value);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(String(option.value))}
                      className={cn(
                        'flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer select-none',
                        isSelected
                          ? 'bg-[var(--color-accent)] text-[var(--color-primary)]'
                          : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {option.icon}
                        {option.label}
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-[var(--color-primary)] shrink-0 ml-2" />}
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error and Helper Text messages */}
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
};

Dropdown.displayName = 'Dropdown';
