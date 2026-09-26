'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color?: 'info' | 'success' | 'warning' | 'error' | 'student' | 'teacher' | 'admin';
  progress?: number;
  showProgress?: boolean;
  delay?: number;
  suffix?: string;
  description?: string;
}

/* Role keys resolve through --primary* so the [data-role] scope picks the
   right palette; status keys use the status tokens. `bar` is a CSS value. */
const colorConfig = {
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
    bar: 'var(--info)',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
    bar: 'var(--success)',
  },
  warning: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
    bar: 'var(--warning)',
  },
  error: {
    bg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
    bar: 'var(--error)',
  },
  student: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
    bar: 'var(--primary-gradient)',
  },
  teacher: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
    bar: 'var(--primary-gradient)',
  },
  admin: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
    bar: 'var(--primary-gradient)',
  },
};

export default function StatCard({
  icon: Icon,
  value,
  label,
  color = 'info',
  progress,
  showProgress = false,
  delay = 0,
  suffix = '',
  description,
}: StatCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative rounded-2xl antigravity-glass antigravity-card border border-[var(--border)] p-3 hover:border-[var(--primary)]/40 overflow-hidden flex flex-col justify-center"
    >
      <div className="flex items-center gap-3.5">
        <div className={`p-2 rounded-2xl ${config.bg} ${config.text} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-sm border border-black/5 dark:border-white/10 flex items-center justify-center`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] truncate mb-0.5">
            {label}
          </div>
          <div className="text-xl font-bold tracking-tight tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)] flex items-baseline gap-2">
            {value}{suffix}
            {description && (
              <span className="text-[10px] sm:text-xs text-[var(--color-muted-foreground)] font-medium truncate tracking-normal font-sans">
                {description}
              </span>
            )}
          </div>
        </div>
      </div>

      {showProgress && progress !== undefined && (
        <div className="w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 mt-3.5 overflow-hidden relative">
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(progress, 100)}%`, background: config.bar }}
          />
        </div>
      )}
    </motion.div>
  );
}
