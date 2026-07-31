'use client';

import { useEffect, useRef, useState } from 'react';

import { usePointerFine, useReducedMotion } from '@/hooks/useMediaQuery';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, summary';

/**
 * A dot that tracks the cursor exactly, plus a ring that lags behind it.
 * Position is written straight to the DOM inside a rAF loop, so this never
 * re-renders React. Rendered only for fine pointers without reduced motion.
 * Colors come from the .cursor-dot/.cursor-ring classes in globals.css.
 */
export function AnimatedCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const fine = usePointerFine();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!fine || reduced) {
      setEnabled(false);
      return;
    }

    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { ...target };
    let frame = 0;
    let visible = false;

    const onMove = (event: PointerEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;

      if (!visible) {
        visible = true;
        if (dotRef.current) dotRef.current.style.opacity = '1';
        if (ringRef.current) ringRef.current.style.opacity = '1';
      }

      const hovering = (event.target as Element | null)?.closest?.(INTERACTIVE);
      ringRef.current?.classList.toggle('cursor-ring--active', Boolean(hovering));
    };

    const onLeave = () => {
      visible = false;
      if (dotRef.current) dotRef.current.style.opacity = '0';
      if (ringRef.current) ringRef.current.style.opacity = '0';
    };

    const tick = () => {
      // Exponential smoothing gives the ring its trailing feel.
      ring.x += (target.x - ring.x) * 0.16;
      ring.y += (target.y - ring.y) * 0.16;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${target.x}px, ${target.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
    };
  }, [fine, reduced]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70]">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}
