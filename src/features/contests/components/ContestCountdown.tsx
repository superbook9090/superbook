'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Flame } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface ContestCountdownProps {
  targetDate: string | Date;
  label?: string;
  onExpire?: () => void;
  compact?: boolean;
  type?: 'starts_in' | 'ends_in' | 'solutions_in';
  urgent?: boolean;
}

export function ContestCountdown({
  targetDate,
  label,
  onExpire,
  compact = false,
  type = 'ends_in',
  urgent = false,
}: ContestCountdownProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const targetMs = new Date(targetDate).getTime();
      const nowMs = Date.now();
      const diffMs = Math.max(0, targetMs - nowMs);
      const totalSeconds = Math.floor(diffMs / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds });

      if (totalSeconds <= 0 && onExpire) {
        onExpire();
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onExpire]);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const isUrgent = urgent || timeLeft.totalSeconds < 300; // < 5 mins

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold tracking-wide ${
          isUrgent
            ? 'bg-[var(--error-light)] text-[var(--error)] border border-[var(--error)]/30 animate-pulse'
            : 'bg-[var(--card-solid)] text-[var(--color-foreground)] border border-[var(--border)]'
        }`}
      >
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <span>
          {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
          {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)] flex items-center gap-1.5">
          {type === 'ends_in' && <Flame className="w-3.5 h-3.5 text-[var(--error)] animate-pulse" />}
          {label}
        </span>
      )}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {timeLeft.days > 0 && (
          <div className="flex flex-col items-center">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex items-center justify-center font-mono text-base sm:text-lg font-bold text-[var(--color-foreground)]">
              {pad(timeLeft.days)}
            </div>
            <span className="text-[10px] text-[var(--color-muted)] mt-1 uppercase font-medium">
              {t('common.days') || 'Days'}
            </span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex items-center justify-center font-mono text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {pad(timeLeft.hours)}
          </div>
          <span className="text-[10px] text-[var(--color-muted)] mt-1 uppercase font-medium">
            {t('common.hours') || 'Hours'}
          </span>
        </div>

        <span className="font-bold text-lg text-[var(--color-muted)] -mt-4">:</span>

        <div className="flex flex-col items-center">
          <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] shadow-xs flex items-center justify-center font-mono text-base sm:text-lg font-bold text-[var(--color-foreground)]">
            {pad(timeLeft.minutes)}
          </div>
          <span className="text-[10px] text-[var(--color-muted)] mt-1 uppercase font-medium">
            {t('common.mins') || 'Mins'}
          </span>
        </div>

        <span className="font-bold text-lg text-[var(--color-muted)] -mt-4">:</span>

        <div className="flex flex-col items-center">
          <div
            className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl border shadow-xs flex items-center justify-center font-mono text-base sm:text-lg font-bold transition-colors ${
              isUrgent
                ? 'bg-[var(--error-light)] border-[var(--error)]/40 text-[var(--error)]'
                : 'bg-[var(--card-solid)] border-[var(--border)] text-[var(--color-foreground)]'
            }`}
          >
            {pad(timeLeft.seconds)}
          </div>
          <span className="text-[10px] text-[var(--color-muted)] mt-1 uppercase font-medium">
            {t('common.secs') || 'Secs'}
          </span>
        </div>
      </div>
    </div>
  );
}
