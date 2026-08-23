'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import { useAlert } from '@/components/ui/AlertContainer';
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
  const { addAlert } = useAlert();

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
      addAlert({ type: 'error', message: t('contact.form.error') });
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
        addAlert({ type: 'success', message: t('contact.form.success') });
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
        addAlert({ type: 'error', message: data.error?.message || t('contact.form.error') });
      }
    } catch {
      addAlert({ type: 'error', message: t('contact.form.error') });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div data-role={role} className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--color-foreground)] overflow-x-hidden selection:bg-[var(--primary)] selection:text-white relative">
      {/* Global Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--primary)]/10 blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--primary-accent)]/10 blur-[150px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-[var(--primary-light)]/5 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <Header />

        <ContactHero />

        <section className="relative -mt-16 sm:-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 z-20 w-full">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 glass border border-white/10 dark:border-white/5 rounded-[2rem] p-6 sm:p-10 lg:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-2xl relative overflow-hidden bg-white/40 dark:bg-[#101319]/60"
            >
              <div className="absolute top-0 inset-x-0 h-1.5 bg-[var(--primary-gradient)] opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent dark:from-white/5 opacity-50 pointer-events-none" />
              
              <div className="relative z-10">
                <h2 className="text-2xl sm:text-3xl font-black mb-3 text-[var(--color-foreground)] uppercase tracking-tight">
                  {t('contact.heroSubtitle')}
                </h2>
                <p className="text-[var(--color-muted-foreground)] text-sm sm:text-base mb-10 font-medium">
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
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 space-y-6 lg:space-y-8"
            >
              <ContactInfo />
            </motion.div>
          </div>
        </section>

        <ContactFaq />
        <ContactCta />
        <Footer />
      </div>
    </div>
  );
}
