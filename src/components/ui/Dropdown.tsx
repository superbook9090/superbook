'use client';

import React, { useId } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DropdownProps, DropdownOption } from './dropdown/types';
import { useDropdown } from './dropdown/useDropdown';
import { DropdownMenuPopup } from './dropdown/DropdownMenuPopup';

export type { DropdownOption, DropdownProps };

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

  const {
    isOpen,
    setIsOpen,
    searchQuery,
    setSearchQuery,
    containerRef,
    searchInputRef,
    selectedOption,
    filteredOptions,
    trimmedQuery,
    showCustomOption,
    handleSelect,
    handleKeyDown,
  } = useDropdown({
    options,
    value,
    onChange,
    disabled,
    searchable,
    allowCustom,
  });

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

        {name && (
          <input
            type="hidden"
            name={name}
            value={value || ''}
            required={required}
          />
        )}

        <AnimatePresence>
          <DropdownMenuPopup
            isOpen={isOpen}
            searchable={searchable}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder={searchPlaceholder}
            searchInputRef={searchInputRef}
            showCustomOption={showCustomOption}
            customLabelPrefix={customLabelPrefix}
            trimmedQuery={trimmedQuery}
            filteredOptions={filteredOptions}
            selectedValue={value}
            label={label}
            labelId={labelId}
            onSelect={handleSelect}
            onClose={() => setIsOpen(false)}
          />
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
