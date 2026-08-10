'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';

import { ContactHero } from './ContactHero';
import { ContactForm } from './ContactForm';
import { ContactInfo } from './ContactInfo';
import { ContactFaq } from './ContactFaq';
import { ContactCta } from './ContactCta';
import type { FormState, FormErrors } from './types';

export default function ContactPageClient() {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const role = (session?.user?.role || 'student').toLowerCase();

  // Form fields state
  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  // Validation errors state
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    email: false,
    subject: false,
    message: false,
  });

  // Submission & alert state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Input change handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when typing
    if (errors[name as keyof FormState]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Blur handler for styling
  const handleBlur = (field: keyof FormState) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  // Field validation logic
  const validateField = (field: keyof FormState): boolean => {
    const val = form[field].trim();
    let errorMsg = '';

    if (field === 'name') {
      if (!val) {
        errorMsg = t('contact.form.validation.nameRequired');
      } else if (val.length > 100) {
        errorMsg = t('contact.form.validation.nameLimit');
      }
    } else if (field === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!val) {
        errorMsg = t('contact.form.validation.emailRequired');
      } else if (!emailRegex.test(val)) {
        errorMsg = t('contact.form.validation.emailInvalid');
      } else if (val.length > 100) {
        errorMsg = t('contact.form.validation.emailLimit');
      }
    } else if (field === 'subject') {
      if (!val) {
        errorMsg = t('contact.form.validation.subjectRequired');
      } else if (val.length > 150) {
        errorMsg = t('contact.form.validation.subjectLimit');
      }
    } else if (field === 'message') {
      if (!val) {
        errorMsg = t('contact.form.validation.messageRequired');
      } else if (val.length > 2000) {
        errorMsg = t('contact.form.validation.messageLimit');
      }
    }

    setErrors((prev) => ({ ...prev, [field]: errorMsg ? errorMsg : undefined }));
    return !errorMsg;
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true,
    });

    // Validate all fields
    const isNameValid = validateField('name');
    const isEmailValid = validateField('email');
    const isSubjectValid = validateField('subject');
    const isMessageValid = validateField('message');

    if (!isNameValid || !isEmailValid || !isSubjectValid || !isMessageValid) {
      setAlertState({ type: 'error', message: t('contact.form.error') });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAlertState({ type: 'success', message: t('contact.form.success') });
        // Reset form
        setForm({
          name: '',
          email: '',
          subject: '',
          message: '',
        });
        setTouched({
          name: false,
          email: false,
          subject: false,
          message: false,
        });
      } else {
        setAlertState({ type: 'error', message: data.error?.message || t('contact.form.error') });
      }
    } catch {
      setAlertState({ type: 'error', message: t('contact.form.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-role={role} className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--color-foreground)] overflow-x-hidden selection:bg-[var(--primary)] selection:text-white">
      <Header />

      <ContactHero />

      <section className="relative -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 z-20 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7 glass border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary-gradient)]" />
            <h2 className="text-2xl font-black mb-2 text-[var(--color-foreground)] uppercase tracking-tight flex items-center gap-2">
              {t('contact.heroSubtitle')}
            </h2>
            <p className="text-[var(--color-muted)] text-sm mb-8 font-medium">
              {t('contact.responseTime')}
            </p>
            <ContactForm
              form={form}
              errors={errors}
              touched={touched}
              isSubmitting={isSubmitting}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleSubmit={handleSubmit}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            <ContactInfo />
          </motion.div>
        </div>
      </section>

      <ContactFaq />
      <ContactCta />
      <Footer />

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}
    </div>
  );
}
