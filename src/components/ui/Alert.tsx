'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Tooltip from '@/components/ui/Tooltip';

interface AlertProps {
  type?: 'error' | 'success' | 'info';
  message: string;
  onClose?: () => void;
  duration?: number;
  index?: number;
  showProgressBar?: boolean;
  className?: string;
}

export default function Alert({
  type = 'info',
  message,
  onClose,
  duration = 4000,
  index = 0,
  showProgressBar = true,
  className
}: AlertProps) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState(100);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (duration && showProgressBar) {
      const startTime = Date.now();
      const interval = 16;

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, duration - elapsed);
        setProgress((remaining / duration) * 100);

        if (remaining <= 0) {
          clearInterval(progressIntervalRef.current!);
        }
      }, interval);
    }

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [duration, showProgressBar]);

  useEffect(() => {
    if (duration) {
      timeoutRef.current = setTimeout(() => {
        onClose?.();
      }, duration);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [duration, onClose]);

  const icons = {
    error: AlertCircle,
    success: CheckCircle,
    info: Info,
  };

  const styles = {
    error: 'bg-[var(--error-light)] text-[var(--error)] border-[var(--error)]/20',
    success: 'bg-[var(--success-light)] text-[var(--success)] border-[var(--success)]/20',
    info: 'bg-[var(--info-light)] text-[var(--info)] border-[var(--info)]/20',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 60, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{
          duration: 0.3,
          delay: index * 0.1,
        }}
        className={cn(
          "fixed right-4 sm:right-6 left-4 sm:left-auto sm:max-w-md",
          "z-[999999] flex flex-col gap-2 px-3 py-2 sm:px-4 sm:py-3 rounded-xl border shadow-2xl backdrop-blur-sm",
          styles[type],
          className
        )}
        role="alert"
        aria-live="assertive"
        style={{
          top: `calc(${16 + index * 88}px)`,
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 flex-shrink-0" />
          <p className="flex-1 text-sm font-medium line-clamp-3">{message}</p>
          {onClose && (
            <Tooltip label="Close alert" className="flex-shrink-0">
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1 hover:bg-[var(--color-foreground)]/5 rounded transition-colors"
                aria-label="Close alert"
              >
                <X className="w-4 h-4" />
              </button>
            </Tooltip>
          )}
        </div>
        {showProgressBar && duration && (
          <div className="w-full h-1 bg-[var(--color-foreground)]/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-full bg-current opacity-50"
            />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
