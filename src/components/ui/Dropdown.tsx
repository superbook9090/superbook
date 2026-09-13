'use client';

import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, AlertCircle, Search, X, Plus } from 'lucide-react';
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
  /** Enables live search filter inside dropdown menu */
  searchable?: boolean;
  /** Custom placeholder for search input */
  searchPlaceholder?: string;
  /** Allows selecting or entering a custom value not present in options */
  allowCustom?: boolean;
  /** Label prefix for custom option (defaults to "Use custom") */
  customLabelPrefix?: string;
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
  searchable = false,
  searchPlaceholder = 'Search...',
  allowCustom = false,
  customLabelPrefix = 'Use custom',
}) => {
  const internalId = useId();
  const dropdownId = customId || internalId;
  const helperTextId = `${dropdownId}-helper`;
  const errorTextId = `${dropdownId}-error`;
  const labelId = `${dropdownId}-label`;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find the currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      if (searchable) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 60);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, searchable]);

  // Close custom dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setIsOpen(false);
  };

  // Filtered options based on search query
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const query = searchQuery.trim().toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        String(opt.value).toLowerCase().includes(query)
    );
  }, [options, searchable, searchQuery]);

  const trimmedQuery = searchQuery.trim();
  const hasExactMatch = options.some(
    (opt) =>
      opt.label.toLowerCase() === trimmedQuery.toLowerCase() ||
      String(opt.value).toLowerCase() === trimmedQuery.toLowerCase()
  );
  const showCustomOption = allowCustom && trimmedQuery.length > 0 && !hasExactMatch;

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;

    switch (event.key) {
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault();
          setIsOpen(true);
        }
        break;
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredOptions.length > 0) {
          const currentIndex = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
          const nextIndex = currentIndex < filteredOptions.length - 1 ? currentIndex + 1 : 0;
          handleSelect(String(filteredOptions[nextIndex].value));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else if (filteredOptions.length > 0) {
          const currentIndex = filteredOptions.findIndex((opt) => String(opt.value) === String(value));
          const prevIndex = currentIndex > 0 ? currentIndex - 1 : filteredOptions.length - 1;
          handleSelect(String(filteredOptions[prevIndex].value));
        }
        break;
      default:
        break;
    }
  };

  const baseInputStyles = cn(
    'form-field text-xs sm:text-sm transition-all duration-150 block w-full rounded-xl select-none text-left',
    'border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] placeholder-[var(--color-muted)]',
    'focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10',
    startIcon && 'pl-10',
    'pr-10',
    error && 'border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]/10',
    disabled && 'opacity-50 cursor-not-allowed bg-[var(--color-surface-muted-strong)]'
  );

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col gap-1 w-full relative', containerClassName)}
    >
      {label && (
        <label
          id={labelId}
          htmlFor={`${dropdownId}-btn`}
          className="block text-xs font-semibold text-[var(--color-foreground)] select-none"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}

      {/* Unified Custom Dropdown */}
      <div className="relative w-full">
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
            'flex items-center justify-between cursor-pointer py-2 min-h-[38px]',
            !selectedOption && !value && 'text-[var(--color-muted)]',
            className
          )}
          style={{
            paddingLeft: startIcon ? '2.5rem' : undefined,
            paddingRight: '2.5rem',
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
            ) : value ? (
              <span className="flex items-center gap-2 truncate text-[var(--color-foreground)]">
                <span className="truncate">{String(value)}</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--primary-soft)] text-[var(--primary)] uppercase tracking-wider border border-[var(--primary)]/20 shrink-0">
                  Custom
                </span>
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
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.12 }}
              className="absolute z-50 top-full left-0 mt-1.5 w-full min-w-[220px] bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl shadow-xl overflow-hidden py-1"
            >
              {/* Live Search Input Field */}
              {searchable && (
                <div className="p-2 border-b border-[var(--color-border)]/70 bg-[var(--color-surface-muted)]/50 sticky top-0 z-10">
                  <div className="relative flex items-center">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 text-[var(--color-muted)] pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (filteredOptions.length > 0) {
                            handleSelect(String(filteredOptions[0].value));
                          } else if (showCustomOption) {
                            handleSelect(trimmedQuery);
                          }
                        } else if (e.key === 'Escape') {
                          setIsOpen(false);
                        }
                      }}
                      placeholder={searchPlaceholder}
                      className="w-full pl-8 pr-7 py-1.5 text-xs sm:text-sm rounded-lg border border-[var(--color-border)] bg-[var(--card-solid)] text-[var(--color-foreground)] placeholder-[var(--color-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSearchQuery('');
                          searchInputRef.current?.focus();
                        }}
                        className="absolute right-2 text-[var(--color-muted)] hover:text-[var(--color-foreground)] p-0.5"
                        aria-label="Clear search"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <ul
                role="listbox"
                aria-labelledby={label ? labelId : undefined}
                aria-label={label ? undefined : 'Dropdown options'}
                className="max-h-60 overflow-y-auto scrollbar-thin"
              >
                {/* Custom Option Prompt */}
                {showCustomOption && (
                  <li
                    role="option"
                    aria-selected={false}
                    onClick={() => handleSelect(trimmedQuery)}
                    className="flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] border-b border-[var(--color-border)]/60 cursor-pointer select-none transition-colors"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Plus className="w-4 h-4 shrink-0 text-[var(--primary)]" />
                      <span>{customLabelPrefix}: &ldquo;{trimmedQuery}&rdquo;</span>
                    </span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--primary-soft)] text-[var(--primary)] uppercase tracking-wider border border-[var(--primary)]/20 shrink-0">
                      Custom
                    </span>
                  </li>
                )}

                {/* Preset Filtered Options */}
                {filteredOptions.map((option) => {
                  const isSelected = String(option.value) === String(value);
                  return (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(String(option.value))}
                      className={cn(
                        'flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none',
                        isSelected
                          ? 'bg-[var(--color-accent)] text-[var(--color-primary)] font-semibold'
                          : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
                      )}
                    >
                      <span className="flex items-center gap-2 truncate">
                        {option.icon}
                        {option.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-primary)] shrink-0 ml-2" />}
                    </li>
                  );
                })}

                {filteredOptions.length === 0 && !showCustomOption && (
                  <li className="py-6 px-4 text-center text-xs text-[var(--color-muted)] select-none">
                    No matching options
                  </li>
                )}
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
