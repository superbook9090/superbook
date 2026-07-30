'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Tooltip from '@/components/ui/Tooltip';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  title: string;
  className?: string;
  theme?: 'student' | 'teacher';
}

export const ToolbarButton = ({
  onClick,
  isActive,
  disabled,
  children,
  title,
  className,
  theme = 'teacher',
}: ToolbarButtonProps) => {
  const themeStyles = {
    student: {
      active: 'bg-[var(--student-soft)] text-[var(--student-primary)] dark:bg-[var(--student-primary)]/10 dark:text-[var(--student-primary)]',
      hover: 'hover:bg-[var(--student-soft)]/50 dark:hover:bg-[var(--student-primary)]/5',
      ring: 'focus-visible:ring-[var(--student-primary)]',
    },
    teacher: {
      active: 'bg-[var(--teacher-soft)] text-[var(--teacher-primary)] dark:bg-[var(--teacher-primary)]/10 dark:text-[var(--teacher-primary)]',
      hover: 'hover:bg-[var(--teacher-soft)]/50 dark:hover:bg-[var(--teacher-primary)]/5',
      ring: 'focus-visible:ring-[var(--teacher-primary)]',
    },
  };

  const currentTheme = themeStyles[theme];

  return (
    <Tooltip label={title} position="bottom">
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      aria-label={title}
      className={cn(
        'p-2 rounded-lg transition-all duration-200 flex items-center justify-center',
        'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
        currentTheme.hover,
        isActive && currentTheme.active,
        isActive && 'shadow-sm',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        currentTheme.ring,
        className
      )}
    >
      {children}
    </motion.button>
    </Tooltip>
  );
};
