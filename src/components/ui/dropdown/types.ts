import React from 'react';

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
