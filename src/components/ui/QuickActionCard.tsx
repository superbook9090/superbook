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

  const cardClassName = `flex items-center justify-start w-full min-h-[48px] p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 group antigravity-card ${
    disabled
      ? 'bg-[var(--surface-muted)]/50 border-[var(--border)] cursor-not-allowed opacity-60'
      : 'antigravity-glass border-[var(--border)] hover:border-[var(--primary)]/40 hover:shadow-lg'
  }`;

  const motionProps = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
    whileHover: { y: disabled ? 0 : -3, scale: disabled ? 1 : 1.01 },
    whileTap: { scale: disabled ? 1 : 0.98 },
  };

  const cardContent = (
    <>
      <div
        className={`p-2.5 rounded-xl transition-all duration-300 shrink-0 group-hover:scale-105 shadow-sm border border-black/5 dark:border-white/10 ${
          disabled
            ? 'bg-[var(--surface-muted-strong)] text-[var(--color-muted-foreground)]'
            : `${config.iconBg} ${config.text}`
        }`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="ml-3 sm:ml-3.5 text-left min-w-0 flex-1">
        <div
          className={`font-bold text-xs sm:text-sm truncate transition-colors group-hover:text-[var(--primary)] ${
            disabled ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
          }`}
        >
          {title}
        </div>
        {description && <div className="text-xs text-[var(--color-muted-foreground)] truncate mt-0.5 font-medium">{description}</div>}
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
