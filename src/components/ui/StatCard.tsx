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
      transition={{ delay }}
      className="rounded-xl bg-[var(--card-solid)] border border-[var(--color-border)] card-body shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-2.5 mb-2">
        <div className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)] pt-0.5">
          {label}
        </div>
        <div className={`p-1.5 sm:p-2 rounded-lg ${config.bg} ${config.text} shrink-0`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-xl sm:text-2xl font-bold tracking-tight tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
        {value}{suffix}
      </div>
      {description && (
        <div className="text-xs text-[var(--color-muted-foreground)] mt-0.5">{description}</div>
      )}
      {showProgress && progress !== undefined && (
        <div className="w-full bg-[var(--color-surface-muted-strong)] rounded-full h-1.5 mt-2">
          <div
            className="h-1.5 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%`, background: config.bar }}
          />
        </div>
      )}
    </motion.div>
  );
}
