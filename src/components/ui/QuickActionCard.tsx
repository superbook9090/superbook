'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color?: 'info' | 'success' | 'warning' | 'error' | 'student' | 'teacher' | 'admin';
  disabled?: boolean;
  delay?: number;
}

const colorConfig = {
  info: {
    bg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
    hoverBg: 'hover:bg-[var(--info-light)]/80',
    iconBg: 'bg-[var(--info)]/20',
    iconHoverBg: 'group-hover:bg-[var(--info)]/30',
  },
  success: {
    bg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
    hoverBg: 'hover:bg-[var(--success-light)]/80',
    iconBg: 'bg-[var(--success)]/20',
    iconHoverBg: 'group-hover:bg-[var(--success)]/30',
  },
  warning: {
    bg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
    hoverBg: 'hover:bg-[var(--warning-light)]/80',
    iconBg: 'bg-[var(--warning)]/20',
    iconHoverBg: 'group-hover:bg-[var(--warning)]/30',
  },
  error: {
    bg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
    hoverBg: 'hover:bg-[var(--error-light)]/80',
    iconBg: 'bg-[var(--error)]/20',
    iconHoverBg: 'group-hover:bg-[var(--error)]/30',
  },
  student: {
    bg: 'bg-[var(--student-soft)]',
    text: 'text-[var(--student-primary)]',
    hoverBg: 'hover:bg-[var(--student-border)]',
    iconBg: 'bg-[var(--student-primary)]/20',
    iconHoverBg: 'group-hover:bg-[var(--student-primary)]/30',
  },
  teacher: {
    bg: 'bg-[var(--teacher-soft)]',
    text: 'text-[var(--teacher-primary)]',
    hoverBg: 'hover:bg-[var(--teacher-border)]',
    iconBg: 'bg-[var(--teacher-primary)]/20',
    iconHoverBg: 'group-hover:bg-[var(--teacher-primary)]/30',
  },
  admin: {
    bg: 'bg-[var(--admin-soft)]',
    text: 'text-[var(--admin-primary)]',
    hoverBg: 'hover:bg-[var(--admin-border)]',
    iconBg: 'bg-[var(--admin-primary)]/20',
    iconHoverBg: 'group-hover:bg-[var(--admin-primary)]/30',
  },
};

export default function QuickActionCard({
  icon: Icon,
  title,
  description,
  href,
  color = 'info',
  disabled = false,
  delay = 0,
}: QuickActionCardProps) {
  const config = colorConfig[color];

  return (
    <motion.a
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      href={disabled ? '#' : href}
      onClick={(e) => {
        if (disabled) e.preventDefault();
      }}
      className={`flex items-center justify-center sm:justify-start w-full min-h-[44px] p-3 sm:p-4 rounded-xl transition-colors group ${
        disabled
          ? 'bg-[var(--color-surface-muted)] cursor-not-allowed'
          : `${config.bg} ${config.hoverBg}`
      }`}
    >
      <div className={`p-2 sm:p-3 rounded-lg transition-colors ${
        disabled
          ? 'bg-[var(--color-muted-foreground)] text-[var(--color-muted-foreground)]'
          : `${config.iconBg} ${config.text} ${config.iconHoverBg}`
      }`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="ml-3 text-left">
        <div className={`font-semibold text-sm sm:text-base ${
          disabled ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
        }`}>
          {title}
        </div>
        <div className="text-xs text-[var(--color-muted-foreground)]">{description}</div>
      </div>
    </motion.a>
  );
}
