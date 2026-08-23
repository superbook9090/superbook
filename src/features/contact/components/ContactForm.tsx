import { motion } from 'framer-motion';
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
    <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8" noValidate>
      <div className="space-y-6">
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
          className="bg-white/50 dark:bg-black/20 backdrop-blur-md focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-all duration-300"
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
          className="bg-white/50 dark:bg-black/20 backdrop-blur-md focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-all duration-300"
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
          className="bg-white/50 dark:bg-black/20 backdrop-blur-md focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-all duration-300"
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
          className="bg-white/50 dark:bg-black/20 backdrop-blur-md focus-within:ring-2 focus-within:ring-[var(--primary)]/50 transition-all duration-300"
        />
      </div>

      <div className="pt-4">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
          <Button
            type="submit"
            fullWidth
            isLoading={isSubmitting}
            className="group relative overflow-hidden py-4 text-sm font-black tracking-widest uppercase shadow-[0_10px_30px_rgba(var(--primary-rgb),0.3)] bg-[var(--primary-gradient)] text-white rounded-2xl hover:brightness-110 active:brightness-95 transition-all duration-300 border border-white/20"
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:200%_0,0_0] bg-no-repeat group-hover:bg-[position:-20%_0,0_0] transition-[background-position] duration-700 ease-in-out" />
            <span className="relative z-10 flex items-center justify-center">
              <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300" />
              {isSubmitting ? t('contact.form.sending') : t('contact.form.submit')}
            </span>
          </Button>
        </motion.div>
      </div>
    </form>
  );
}
