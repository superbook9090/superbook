import React, { forwardRef, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

/**
 * AccessibleButton
 * A thin wrapper around a button element that ensures:
 * - It is focusable via tab order (tabIndex=0 for non-button elements)
 * - Handles Enter and Space keys to trigger onClick
 * - Applies consistent focus-visible outline styles
 * - Allows passing any ARIA props
 */
export const AccessibleButton = forwardRef<HTMLElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  function AccessibleButton(props, ref) {
    const { className, onClick, children, type = 'button', ...rest } = props;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        (e.currentTarget as HTMLElement).click();
      }
    };

    return (
      <button
        ref={ref as any}
        type={type}
        className={cn('focus-visible', className)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

export default AccessibleButton;
