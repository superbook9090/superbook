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
  /** Long press duration in ms for mobile/touch screens. Defaults to 450ms. */
  longPressDelay?: number;
}

/** 
 * Portal-based tooltip with Desktop Hover + Mobile/Touch Long-Press support.
 * - On desktop: Appears on hover.
 * - On mobile/touch/APK: Only appears upon long press (press & hold for ~450ms) and avoids sticking on normal taps.
 */
export default function Tooltip({
  label,
  children,
  position = 'top',
  className = '',
  longPressDelay = 450,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLSpanElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: position === 'top' ? rect.top : rect.bottom,
        left: rect.left + rect.width / 2,
      });
    }
  }, [position]);

  const clearTimers = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
      autoHideTimerRef.current = null;
    }
  }, []);

  const show = useCallback(() => {
    updatePosition();
    setIsVisible(true);
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current);
    }
    // Automatically close after 5 seconds
    autoHideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  }, [updatePosition]);

  const hide = useCallback(() => {
    clearTimers();
    setIsVisible(false);
  }, [clearTimers]);

  // Touch & Pointer Long Press Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    clearTimers();
    const touch = e.touches[0];
    if (touch) {
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
    longPressTimerRef.current = setTimeout(() => {
      show();
      // Optional subtle haptic feedback on supported mobile devices
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          /* ignore */
        }
      }
    }, longPressDelay);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
      // Cancel long press if user is scrolling/swiping
      if (dx > 8 || dy > 8) {
        if (longPressTimerRef.current) {
          clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // Desktop Hover Handlers
  const handleMouseEnter = () => {
    // Only trigger hover on pointer devices (not simulated touch hover)
    if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      show();
    }
  };

  const handleMouseLeave = () => {
    hide();
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();

      const handleGlobalPointerDown = (event: MouseEvent | TouchEvent | PointerEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          hide();
        }
      };

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      document.addEventListener('mousedown', handleGlobalPointerDown);
      document.addEventListener('touchstart', handleGlobalPointerDown);
      document.addEventListener('pointerdown', handleGlobalPointerDown);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('mousedown', handleGlobalPointerDown);
        document.removeEventListener('touchstart', handleGlobalPointerDown);
        document.removeEventListener('pointerdown', handleGlobalPointerDown);
      };
    }
  }, [isVisible, updatePosition, hide]);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
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
                  className={`pointer-events-none fixed -translate-x-1/2 ${bubblePlacement} z-[99999] whitespace-nowrap rounded-md bg-[var(--color-foreground)] text-[var(--color-background)] text-xs font-medium px-2.5 py-1.5 shadow-lg select-none`}
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
