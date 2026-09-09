'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Send, User, Mail, Tag, MessageSquare } from 'lucide-react';
import { TextField } from '@/components/ui/TextField';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';
import type { FormState, FormErrors } from './types';

type Props = {
  form: FormState;
  errors: FormErrors;
  touched: Record<keyof FormState, boolean>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleBlur: (field: keyof FormState) => void;
  handleSubmit: (e: React.FormEvent) => void;
};

export function ContactForm({
  form,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6" noValidate>
      <div className="space-y-4 sm:space-y-5">
        <TextField
          id="name"
          name="name"
          label={
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              <User className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('contact.form.name')}</span>
              <span className="text-[var(--color-error)]">*</span>
            </span>
          }
          type="text"
          value={form.name}
          onChange={handleChange}
          onBlur={() => handleBlur('name')}
          placeholder={t('contact.form.namePlaceholder')}
          disabled={isSubmitting}
          error={touched.name && errors.name ? errors.name : undefined}
          fullWidth
          className="antigravity-glass rounded-xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--primary)]/40 focus-within:border-[var(--primary)] transition-all duration-200"
        />

        <TextField
          id="email"
          name="email"
          label={
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              <Mail className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('contact.form.email')}</span>
              <span className="text-[var(--color-error)]">*</span>
            </span>
          }
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={() => handleBlur('email')}
          placeholder={t('contact.form.emailPlaceholder')}
          disabled={isSubmitting}
          error={touched.email && errors.email ? errors.email : undefined}
          fullWidth
          className="antigravity-glass rounded-xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--primary)]/40 focus-within:border-[var(--primary)] transition-all duration-200"
        />

        <TextField
          id="subject"
          name="subject"
          label={
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              <Tag className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('contact.form.subject')}</span>
              <span className="text-[var(--color-error)]">*</span>
            </span>
          }
          type="text"
          value={form.subject}
          onChange={handleChange}
          onBlur={() => handleBlur('subject')}
          placeholder={t('contact.form.subjectPlaceholder')}
          disabled={isSubmitting}
          error={touched.subject && errors.subject ? errors.subject : undefined}
          fullWidth
          className="antigravity-glass rounded-xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--primary)]/40 focus-within:border-[var(--primary)] transition-all duration-200"
        />

        <TextField
          id="message"
          name="message"
          label={
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)]">
              <MessageSquare className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('contact.form.message')}</span>
              <span className="text-[var(--color-error)]">*</span>
            </span>
          }
          multiline
          rows={5}
          value={form.message}
          onChange={handleChange}
          onBlur={() => handleBlur('message')}
          placeholder={t('contact.form.messagePlaceholder')}
          disabled={isSubmitting}
          error={touched.message && errors.message ? errors.message : undefined}
          fullWidth
          className="antigravity-glass rounded-xl border border-[var(--border)] focus-within:ring-2 focus-within:ring-[var(--primary)]/40 focus-within:border-[var(--primary)] transition-all duration-200"
        />
      </div>

      <div className="pt-2">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            className="btn-premium group relative overflow-hidden py-3.5 text-xs sm:text-sm font-black tracking-wider uppercase rounded-2xl shadow-lg shadow-[var(--primary)]/25"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-200" />
              <span>{isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}</span>
            </span>
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
