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
      className={`relative px-4 py-3 sm:px-6 sm:py-4 flex items-center space-x-3 sm:space-x-4 hover:bg-[var(--primary)]/5 transition-colors group overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Glow on hover */}
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-12 h-12 ${config.bg} rounded-full blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none`} />

      {/* Icon */}
      <div className={`relative z-10 flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-[1rem] flex items-center justify-center ${config.bg} ${config.text} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm border border-[var(--border)]/30`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex-1 min-w-0">
        <p className="text-xs sm:text-sm font-bold text-[var(--color-foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
          {title}
        </p>
        <p className="text-[10px] sm:text-xs font-medium text-[var(--color-muted-foreground)] mt-0.5 truncate">
          {description}
        </p>
      </div>
      
      {/* Date */}
      {date && (
        <div className="relative z-10 flex-shrink-0 text-[10px] sm:text-xs font-semibold text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors">
          {date}
        </div>
      )}
    </motion.div>
  );
}
