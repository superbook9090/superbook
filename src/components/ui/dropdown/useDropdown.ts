'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { DropdownOption } from './types';

interface UseDropdownParams {
  options: DropdownOption[];
  value?: string | number;
  onChange?: (value: string) => void;
  disabled?: boolean;
  searchable?: boolean;
  allowCustom?: boolean;
}

export function useDropdown({
  options,
  value,
  onChange,
  disabled,
  searchable,
  allowCustom,
}: UseDropdownParams) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

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
  const showCustomOption = Boolean(allowCustom && trimmedQuery.length > 0 && !hasExactMatch);

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

  return {
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
  };
}
