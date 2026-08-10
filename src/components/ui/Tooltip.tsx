'use client';

import { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  label: string;
  children: ReactNode;
  position?: 'top' | 'bottom';
  /** Extra classes for the wrapper span (e.g. positioning when wrapping an absolutely-positioned button). */
  className?: string;
}

/** 
 * Portal-based hover/focus tooltip for icon buttons. 
 * Renders in document.body to avoid clipping inside overflow-hidden containers. 
 */
export default function Tooltip({ label, children, position = 'top', className = '' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: position === 'top' ? rect.top : rect.bottom,
        left: rect.left + rect.width / 2,
      });
    }
  }, [position]);

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      // Use capture phase for scroll so we catch scrolls in any scrollable container
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isVisible, updatePosition]);

  const bubblePlacement = position === 'top' ? '-translate-y-full -mt-2' : 'mt-2';
  
  const arrowPlacement =
    position === 'top'
      ? 'top-full border-t-[var(--color-foreground)]'
      : 'bottom-full border-b-[var(--color-foreground)]';

  const positionClass = /\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative';

  return (
    <>
      <span
        ref={containerRef}
        className={`${positionClass} inline-flex ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </span>
      {typeof document !== 'undefined'
        ? createPortal(
            <AnimatePresence>
              {isVisible && (
                <motion.span
                  role="tooltip"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  style={{ top: coords.top, left: coords.left }}
                  className={`pointer-events-none fixed -translate-x-1/2 ${bubblePlacement} z-[99999] whitespace-nowrap rounded-md bg-[var(--color-foreground)] text-[var(--color-background)] text-xs font-medium px-2.5 py-1.5 shadow-lg`}
                >
                  {label}
                  <span
                    className={`absolute left-1/2 -translate-x-1/2 ${arrowPlacement} border-4 border-transparent`}
                  />
                </motion.span>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
