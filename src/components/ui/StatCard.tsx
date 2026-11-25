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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="group student-card p-4 sm:p-5 overflow-hidden flex flex-col justify-center"
    >
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] truncate mb-1">
            {label}
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums font-[family-name:var(--font-display)] text-[var(--color-foreground)] flex items-baseline gap-1">
            <span>{value}</span>
            {suffix && <span className="text-base sm:text-lg font-bold">{suffix}</span>}
            {description && (
              <span className="text-xs text-[var(--color-muted-foreground)] font-medium truncate tracking-normal font-sans ml-1">
                {description}
              </span>
            )}
          </div>
        </div>

        <div className={`w-11 h-11 rounded-xl ${config.bg} ${config.text} shrink-0 group-hover:scale-105 transition-transform duration-200 flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {showProgress && progress !== undefined && (
        <div className="relative z-10 w-full bg-[var(--surface-muted-strong)] rounded-full h-1.5 mt-3.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: delay + 0.1 }}
            className="h-full rounded-full"
            style={{ background: config.bar }}
          />
        </div>
      )}
    </motion.div>
  );
}
