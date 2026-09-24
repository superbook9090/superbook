'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, X, Plus, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DropdownOption } from './types';

interface DropdownMenuPopupProps {
  isOpen: boolean;
  searchable: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder: string;
  searchInputRef: React.RefObject<HTMLInputElement | null>;
  showCustomOption: boolean;
  customLabelPrefix: string;
  trimmedQuery: string;
  filteredOptions: DropdownOption[];
  selectedValue?: string | number;
  label?: React.ReactNode;
  labelId: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

export function DropdownMenuPopup({
  isOpen,
  searchable,
  searchQuery,
  setSearchQuery,
  searchPlaceholder,
  searchInputRef,
  showCustomOption,
  customLabelPrefix,
  trimmedQuery,
  filteredOptions,
  selectedValue,
  label,
  labelId,
  onSelect,
  onClose,
}: DropdownMenuPopupProps) {
  if (!isOpen) return null;

  return (
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
                    onSelect(String(filteredOptions[0].value));
                  } else if (showCustomOption) {
                    onSelect(trimmedQuery);
                  }
                } else if (e.key === 'Escape') {
                  onClose();
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
            onClick={() => onSelect(trimmedQuery)}
            className="flex items-center justify-between px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)] border-b border-[var(--color-border)]/60 cursor-pointer select-none transition-colors"
          >
            <span className="flex items-center gap-2 truncate">
              <Plus className="w-4 h-4 shrink-0 text-[var(--primary)]" />
              <span>
                {customLabelPrefix}: &ldquo;{trimmedQuery}&rdquo;
              </span>
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[var(--primary-soft)] text-[var(--primary)] uppercase tracking-wider border border-[var(--primary)]/20 shrink-0">
              Custom
            </span>
          </li>
        )}

        {/* Preset Filtered Options */}
        {filteredOptions.map((option) => {
          const isSelected = String(option.value) === String(selectedValue);
          return (
            <li
              key={option.value}
              role="option"
              aria-selected={isSelected}
              onClick={() => onSelect(String(option.value))}
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
  );
}
