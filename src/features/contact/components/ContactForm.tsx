import React from 'react';
import { Send } from 'lucide-react';
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
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <TextField
        id="name"
        name="name"
        label={
          <>
            {t('contact.form.name')} <span className="text-[var(--color-error)]">*</span>
          </>
        }
        type="text"
        value={form.name}
        onChange={handleChange}
        onBlur={() => handleBlur('name')}
        placeholder={t('contact.form.namePlaceholder')}
        disabled={isSubmitting}
        error={touched.name && errors.name ? errors.name : undefined}
        fullWidth
      />

      <TextField
        id="email"
        name="email"
        label={
          <>
            {t('contact.form.email')} <span className="text-[var(--color-error)]">*</span>
          </>
        }
        type="email"
        value={form.email}
        onChange={handleChange}
        onBlur={() => handleBlur('email')}
        placeholder={t('contact.form.emailPlaceholder')}
        disabled={isSubmitting}
        error={touched.email && errors.email ? errors.email : undefined}
        fullWidth
      />

      <TextField
        id="subject"
        name="subject"
        label={
          <>
            {t('contact.form.subject')} <span className="text-[var(--color-error)]">*</span>
          </>
        }
        type="text"
        value={form.subject}
        onChange={handleChange}
        onBlur={() => handleBlur('subject')}
        placeholder={t('contact.form.subjectPlaceholder')}
        disabled={isSubmitting}
        error={touched.subject && errors.subject ? errors.subject : undefined}
        fullWidth
      />

      <TextField
        id="message"
        name="message"
        label={
          <>
            {t('contact.form.message')} <span className="text-[var(--color-error)]">*</span>
          </>
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
      />

      <div className="pt-2">
        <Button
          type="submit"
          fullWidth
          isLoading={isSubmitting}
          className="py-3.5 text-xs font-bold tracking-widest uppercase shadow-[var(--primary-shadow)] bg-[var(--primary-gradient)] text-white rounded-xl hover:brightness-110 active:brightness-95 hover:shadow-xl transition-all duration-300"
        >
          <Send className="w-4 h-4 mr-2" />
          {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
        </Button>
      </div>
    </form>
  );
}
