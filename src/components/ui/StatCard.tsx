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

const colorConfig = {
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
    blur: 'bg-[var(--info-light)]',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
    blur: 'bg-[var(--success-light)]',
  },
  warning: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
    blur: 'bg-[var(--warning-light)]',
  },
  error: {
    bg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
    blur: 'bg-[var(--error-light)]',
  },
  student: {
    bg: 'bg-[var(--student-soft)]',
    text: 'text-[var(--student-primary)]',
    blur: 'bg-[var(--student-soft)]',
  },
  teacher: {
    bg: 'bg-[var(--teacher-soft)]',
    text: 'text-[var(--teacher-primary)]',
    blur: 'bg-[var(--teacher-soft)]',
  },
  admin: {
    bg: 'bg-[var(--admin-soft)]',
    text: 'text-[var(--admin-primary)]',
    blur: 'bg-[var(--admin-soft)]',
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
      className="group relative overflow-hidden rounded-2xl bg-[var(--card-solid)] p-4 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 ${config.blur} rounded-full blur-2xl -translate-y-1/2 translate-x-1/2`} />
      <div className="relative">
        <div className={`p-2 sm:p-3 rounded-xl ${config.bg} ${config.text} w-fit mb-4`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-[var(--color-foreground)] mb-1">
          {value}{suffix}
        </div>
        <div className="text-sm text-[var(--color-muted-foreground)] mb-2">{label}</div>
        {description && (
          <div className="text-xs text-[var(--color-muted-foreground)]">{description}</div>
        )}
        {showProgress && progress !== undefined && (
          <div className="w-full bg-[var(--border)] rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full transition-all ${config.text.replace('text-', 'bg-')}`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}
