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

  const cardClassName = `relative flex items-center justify-start w-full min-h-[60px] p-3.5 sm:p-4 rounded-2xl transition-all duration-200 group overflow-hidden focus-ring ${
    disabled
      ? 'bg-[var(--surface-muted)]/60 border border-[var(--border)] cursor-not-allowed opacity-60'
      : 'student-card'
  }`;

  const motionProps = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, duration: 0.28, ease: [0.16, 1, 0.3, 1] as const },
    whileTap: { scale: disabled ? 1 : 0.985 },
  };

  const cardContent = (
    <>
      <div
        className={`relative z-10 w-11 h-11 rounded-xl transition-transform duration-200 shrink-0 group-hover:scale-105 flex items-center justify-center ${
          disabled
            ? 'bg-[var(--surface-muted-strong)] text-[var(--color-muted-foreground)]'
            : `${config.iconBg} ${config.text}`
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div className="relative z-10 ml-3 text-left min-w-0 flex-1">
        <div
          className={`font-bold text-sm truncate transition-colors group-hover:text-[var(--primary)] ${
            disabled ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
          }`}
        >
          {title}
        </div>
        {description && <div className="text-xs text-[var(--color-muted-foreground)] truncate mt-0.5">{description}</div>}
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
