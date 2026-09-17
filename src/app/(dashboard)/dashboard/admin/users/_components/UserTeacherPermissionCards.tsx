'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface PermissionToggleCardProps {
  icon: React.ReactNode;
  iconBgClass: string;
  title: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  checkedBgClass?: string;
}

export function PermissionToggleCard({
  icon,
  iconBgClass,
  title,
  description,
  checked,
  onChange,
  checkedBgClass = 'peer-checked:bg-[var(--teacher-primary)]',
}: PermissionToggleCardProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] hover:border-[var(--color-border-hover)] transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2 rounded-lg ${iconBgClass} shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
            {title}
          </p>
          <p className="text-[11px] text-[var(--color-muted-foreground)] truncate">
            {description}
          </p>
        </div>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div
          className={`w-11 h-6 bg-[var(--color-surface-muted-strong)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[var(--color-border)] after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${checkedBgClass}`}
        />
      </label>
    </div>
  );
}

interface ContentQuotaCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  globalValue: number;
  onChange: (val: string) => void;
  customLabel: string;
  globalLabel: string;
  resetTitle: string;
}

export function ContentQuotaCard({
  icon,
  title,
  value,
  globalValue,
  onChange,
  customLabel,
  globalLabel,
  resetTitle,
}: ContentQuotaCardProps) {
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl bg-[var(--color-surface-muted)]/40 border border-[var(--border)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
          {icon}
          {title}
        </span>
        {value ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {customLabel}
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
            {globalLabel}: {globalValue}
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="number"
          min="1"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${globalLabel}: ${globalValue}`}
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title={resetTitle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

interface AiQuotaCardProps {
  icon: React.ReactNode;
  title: string;
  subLabel: string;
  value: string;
  globalValue: number;
  onChange: (val: string) => void;
  presets: number[];
  customLabel: string;
  globalLabel: string;
  resetTitle: string;
  presetLabel: string;
  hintText?: string;
  max?: number;
}

export function AiQuotaCard({
  icon,
  title,
  subLabel,
  value,
  globalValue,
  onChange,
  presets,
  customLabel,
  globalLabel,
  resetTitle,
  presetLabel,
  hintText,
  max,
}: AiQuotaCardProps) {
  return (
    <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-[var(--color-surface)]/70 border border-[var(--border)]">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            {icon}
            {title}
          </span>
          <p className="text-[10px] text-[var(--color-muted-foreground)]">{subLabel}</p>
        </div>
        {value ? (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {value} {customLabel}
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]">
            {globalLabel}: {globalValue}
          </span>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          min="1"
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`${globalLabel}: ${globalValue}`}
          className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg bg-[var(--color-surface)] border border-[var(--border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-primary)] transition-colors"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            title={resetTitle}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] transition-colors text-[11px]"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[10px] text-[var(--color-muted-foreground)] mr-0.5">{presetLabel}:</span>
        <button
          type="button"
          onClick={() => onChange('')}
          className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
            !value
              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
              : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
          }`}
        >
          {globalLabel} ({globalValue})
        </button>
        {presets.map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(String(num))}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors border ${
              value === String(num)
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'bg-[var(--color-surface-muted)] hover:bg-[var(--color-surface-muted-strong)] text-[var(--color-foreground)] border-[var(--border)]'
            }`}
          >
            {num}
          </button>
        ))}
      </div>

      {hintText && (
        <p className="text-[10px] text-[var(--color-muted-foreground)] italic pt-0.5">{hintText}</p>
      )}
    </div>
  );
}
