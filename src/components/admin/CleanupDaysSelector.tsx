'use client';

import React, { useEffect, useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

const PRESET_DAYS = [3, 7, 10, 15, 30, 60, 90] as const;

interface CleanupDaysSelectorProps {
  days: number;
  cutoffDate?: string | null;
  disabled?: boolean;
  onApplyDays: (nextDays: number) => void;
}

export function CleanupDaysSelector({
  days,
  cutoffDate,
  disabled = false,
  onApplyDays,
}: CleanupDaysSelectorProps) {
  const [inputValue, setInputValue] = useState(String(days));

  useEffect(() => {
    setInputValue(String(days));
  }, [days]);

  const parsedInput = Number(inputValue.trim());
  const isValidCustom =
    Number.isInteger(parsedInput) && parsedInput >= 1 && parsedInput <= 3650;
  const hasUnappliedChange = isValidCustom && parsedInput !== days;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidCustom || disabled) return;
    onApplyDays(parsedInput);
  };

  return (
    <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface-muted)]/40 space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-foreground)]">
          <Calendar className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>Created older than (days before today)</span>
        </div>
        {cutoffDate && (
          <span className="text-[11px] text-[var(--color-muted-foreground)]">
            Cutoff: before <strong className="text-[var(--color-foreground)]">{new Date(cutoffDate).toLocaleDateString()}</strong>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {PRESET_DAYS.map((preset) => {
            const active = days === preset;
            return (
              <button
                key={preset}
                type="button"
                disabled={disabled}
                onClick={() => onApplyDays(preset)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                  active
                    ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-xs'
                    : 'bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border-[var(--border)] hover:text-[var(--color-foreground)] hover:border-[var(--primary)]/40'
                }`}
              >
                {preset}d
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-1.5">
          <input
            type="number"
            min={1}
            max={3650}
            step={1}
            value={inputValue}
            disabled={disabled}
            onChange={(e) => setInputValue(e.target.value)}
            aria-label="Custom days before today"
            className="w-20 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          />
          <span className="text-[11px] text-[var(--color-muted-foreground)]">days</span>
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={disabled || !isValidCustom}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs min-h-[30px]"
          >
            <RefreshCw className="w-3 h-3" />
            <span>{hasUnappliedChange ? 'Apply' : 'Scan'}</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

export default CleanupDaysSelector;
