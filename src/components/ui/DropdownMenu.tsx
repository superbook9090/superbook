'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'left' | 'right';
  className?: string;
  menuClassName?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
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

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleItemClick = (e: React.MouseEvent, item: DropdownMenuItem) => {
    e.stopPropagation();
    if (item.disabled) return;
    setIsOpen(false);
    item.onClick();
  };

  return (
    <div ref={containerRef} className={cn('relative inline-block text-left', className)}>
      <div onClick={handleTriggerClick} className="inline-flex items-center justify-center">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12, ease: 'easeOut' }}
            role="menu"
            aria-orientation="vertical"
            className={cn(
              'absolute z-50 mt-1 min-w-[160px] py-1 rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] shadow-xl overflow-hidden focus:outline-none backdrop-blur-md',
              align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
              menuClassName
            )}
          >
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={(e) => handleItemClick(e, item)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium transition-colors text-left select-none cursor-pointer',
                  item.disabled
                    ? 'opacity-40 cursor-not-allowed text-[var(--color-muted-foreground)]'
                    : 'text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] active:bg-[var(--color-surface-muted-strong)]',
                  item.className
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DropdownMenu;
