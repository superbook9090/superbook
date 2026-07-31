'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActivityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  date?: string;
  color?: 'info' | 'success' | 'warning' | 'error' | 'student' | 'teacher' | 'admin';
  delay?: number;
  onClick?: () => void;
}

const colorConfig = {
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
  },
  warning: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
  },
  error: {
    bg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
  },
  student: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
  },
  teacher: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
  },
  admin: {
    bg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
  },
};

export default function ActivityCard({
  icon: Icon,
  title,
  description,
  date,
  color = 'info',
  delay = 0,
  onClick,
}: ActivityCardProps) {
  const config = colorConfig[color];

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`px-3 py-2 sm:px-6 sm:py-4 flex items-center space-x-3 sm:space-x-4 hover:bg-[var(--background)]/50 transition-colors cursor-pointer ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-semibold text-[var(--color-foreground)] truncate">
          {title}
        </p>
        <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5 truncate">
          {description}
        </p>
      </div>
      
      {/* Date */}
      {date && (
        <div className="flex-shrink-0 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
          {date}
        </div>
      )}
    </motion.div>
  );
}
