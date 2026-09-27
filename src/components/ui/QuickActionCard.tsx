'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

const MotionLink = motion(Link);

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  href: string;
  color?: 'info' | 'success' | 'warning' | 'error' | 'student' | 'teacher' | 'admin';
  disabled?: boolean;
  delay?: number;
}

/* Quiet cards: color lives only in the icon chip. Role keys resolve through
   --primary* so the [data-role] scope picks the right palette. */
const colorConfig = {
  info: {
    iconBg: 'bg-[var(--info-light)]',
    text: 'text-[var(--info)]',
  },
  success: {
    iconBg: 'bg-[var(--success-light)]',
    text: 'text-[var(--success)]',
  },
  warning: {
    iconBg: 'bg-[var(--warning-light)]',
    text: 'text-[var(--warning)]',
  },
  error: {
    iconBg: 'bg-[var(--error-light)]',
    text: 'text-[var(--error)]',
  },
  student: {
    iconBg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
  },
  teacher: {
    iconBg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
  },
  admin: {
    iconBg: 'bg-[var(--primary-soft)]',
    text: 'text-[var(--primary)]',
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

  const cardClassName = `relative flex items-center justify-start w-full min-h-[48px] p-3 sm:p-4 rounded-2xl border transition-all duration-300 group overflow-hidden ${
    disabled
      ? 'bg-[var(--surface-muted)]/50 border-[var(--border)] cursor-not-allowed opacity-60'
      : 'bg-[var(--card-solid)]/40 backdrop-blur-xl border-[var(--border)]/50 hover:border-[var(--primary)]/50 hover:shadow-lg hover:-translate-y-1'
  }`;

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    whileTap: { scale: disabled ? 1 : 0.98 },
  };

  const cardContent = (
    <>
      {/* Background flare on hover */}
      {!disabled && (
        <div className={`absolute -right-8 -top-8 w-24 h-24 ${config.iconBg} rounded-full blur-2xl opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`} />
      )}
      
      <div
        className={`relative z-10 p-3 rounded-xl transition-all duration-300 shrink-0 group-hover:scale-110 shadow-sm border border-black/5 dark:border-white/10 ${
          disabled
            ? 'bg-[var(--surface-muted-strong)] text-[var(--color-muted-foreground)]'
            : `${config.iconBg} ${config.text}`
        }`}
      >
        <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
      </div>
      <div className="relative z-10 ml-3 sm:ml-4 text-left min-w-0 flex-1">
        <div
          className={`font-bold text-sm sm:text-base truncate transition-colors group-hover:text-[var(--primary)] ${
            disabled ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
          }`}
        >
          {title}
        </div>
        {description && <div className="text-xs sm:text-sm text-[var(--color-muted-foreground)] truncate mt-0.5 font-medium">{description}</div>}
      </div>
    </>
  );

  if (disabled) {
    return (
      <motion.div {...motionProps} role="presentation" className={cardClassName}>
        {cardContent}
      </motion.div>
    );
  }

  return (
    <MotionLink {...motionProps} href={href} className={cardClassName}>
      {cardContent}
    </MotionLink>
  );
}
