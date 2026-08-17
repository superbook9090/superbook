'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

const MotionLink = motion(Link);

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
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

  const cardClassName = `flex items-center justify-start w-full min-h-[44px] p-2.5 sm:p-3 rounded-xl border transition-all group ${
    disabled
      ? 'bg-[var(--color-surface-muted)] border-[var(--color-border)] cursor-not-allowed'
      : 'bg-[var(--card-solid)] border-[var(--color-border)] hover:border-[var(--primary-border)] hover:shadow-[var(--shadow-md)]'
  }`;

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { delay },
    whileHover: { scale: disabled ? 1 : 1.02 },
    whileTap: { scale: disabled ? 1 : 0.98 },
  };

  const cardContent = (
    <>
      <div
        className={`p-2 rounded-lg transition-colors shrink-0 ${
          disabled
            ? 'bg-[var(--color-surface-muted-strong)] text-[var(--color-muted-foreground)]'
            : `${config.iconBg} ${config.text}`
        }`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="ml-2.5 sm:ml-3 text-left min-w-0 flex-1">
        <div
          className={`font-semibold text-xs sm:text-sm truncate ${
            disabled ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'
          }`}
        >
          {title}
        </div>
        <div className="text-[11px] sm:text-xs text-[var(--color-muted-foreground)] truncate mt-0.5">{description}</div>
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
