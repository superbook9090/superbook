'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export interface FaqItem {
  question: string;
  answer: string;
}

interface Props {
  faqs: FaqItem[];
  courseTitle: string;
}

export default function PublicCourseFaq({ faqs, courseTitle }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIdx((prev) => (prev === idx ? null : idx));
  };

  if (!faqs.length) return null;

  return (
    <section className="space-y-4 pt-6 border-t border-[var(--border)]">
      <div className="flex items-start gap-2.5">
        <HelpCircle className="w-5 h-5 text-[var(--color-primary)] mt-1 flex-shrink-0" />
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)]">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] mt-0.5">
            Key questions and details about {courseTitle || 'this course'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className="rounded-xl border border-[var(--border)] bg-[var(--color-surface)] overflow-hidden transition-all shadow-sm"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface-hover)] transition-colors gap-3"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base font-semibold text-[var(--color-foreground)]">
                  {faq.question}
                </span>
                <span className="flex-shrink-0 text-[var(--color-muted-foreground)]">
                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-[var(--border)] bg-[var(--color-surface-muted)]/30 p-4 text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
