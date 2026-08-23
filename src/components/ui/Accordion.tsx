'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export type AccordionProps = {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  index?: number;
  className?: string;
};

export function Accordion({ title, children, defaultOpen = false, index = 0, className = '' }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 ${
        isOpen
          ? 'bg-white/60 dark:bg-[#101319]/80 shadow-[0_10px_40px_-15px_rgba(var(--primary-rgb),0.2)]'
          : 'bg-white/30 dark:bg-[#101319]/40 hover:bg-white/50 dark:hover:bg-[#101319]/60 shadow-sm'
      } backdrop-blur-xl border ${
        isOpen ? 'border-[var(--primary)]/40' : 'border-white/20 dark:border-white/5 hover:border-[var(--primary)]/20'
      } ${className}`}
    >
      {/* Active glow gradient behind card content */}
      {isOpen && (
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full relative z-10 flex items-center justify-between p-5 sm:p-6 text-left transition-colors outline-none"
        aria-expanded={isOpen}
      >
        <span className={`text-sm sm:text-base font-bold pr-4 transition-colors duration-300 ${isOpen ? 'text-[var(--primary)]' : 'text-[var(--color-foreground)] group-hover:text-[var(--primary)]'}`}>
          {title}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className={`flex-shrink-0 p-1.5 rounded-full transition-colors duration-300 ${
            isOpen ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--color-muted-foreground)] group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]'
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="relative z-10 p-5 sm:p-6 pt-0 text-sm sm:text-base text-[var(--color-muted-foreground)] leading-relaxed font-medium">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
