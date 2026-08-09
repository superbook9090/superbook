'use client';
import { ROUTES } from '@/constants/routes';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronDown
} from 'lucide-react';
import Header from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { useTranslation } from '@/hooks/useTranslation';
import Button from '@/components/ui/Button';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { TextField } from '@/components/ui/TextField';

// Custom SVG Brand Icons since Lucide v1.x has removed brand icons
const Github = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Twitter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const Linkedin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const Facebook = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

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

  // FAQ Accordion state
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

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

  // FAQ helper list
  const faqs = [
    { q: t('contact.faq.q1'), a: t('contact.faq.a1') },
    { q: t('contact.faq.q2'), a: t('contact.faq.a2') },
    { q: t('contact.faq.q3'), a: t('contact.faq.a3') },
    { q: t('contact.faq.q4'), a: t('contact.faq.a4') },
  ];

  return (
    <div data-role={role} className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--color-foreground)] overflow-x-hidden selection:bg-[var(--primary)] selection:text-white">
      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-40 lg:pb-36 bg-gradient-to-br from-slate-900 via-[var(--primary-dark)]/40 to-slate-900 text-white flex items-center justify-center overflow-hidden">
        {/* Subtle decorative floating circle lights */}
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-[var(--primary)]/10 blur-[80px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-[var(--primary-accent)]/10 blur-[100px]" />

        {/* Particle Grid Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-25" />

        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--primary)]/15 border border-[var(--primary-border)]/20 text-[var(--primary-accent)] mb-6">
              {t('contact.title')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-xl tracking-tight text-white mb-6 lg:text-5xl"
          >
            {t('contact.heroTitle')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t('contact.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* --- FORM & INFO GRID SECTION --- */}
      <section className="relative -mt-10 sm:-mt-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 z-20 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: THE CONTACT FORM CARD */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-7 glass border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Elegant glass accent line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-[var(--primary-gradient)]" />

            <h2 className="text-2xl font-black mb-2 text-[var(--color-foreground)] uppercase tracking-tight flex items-center gap-2">
              {t('contact.heroSubtitle')}
            </h2>
            <p className="text-[var(--color-muted)] text-sm mb-8 font-medium">
              {t('contact.responseTime')}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6" noValidate>

              {/* Name Field */}
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

              {/* Email Field */}
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

              {/* Subject Field */}
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

              {/* Message Field */}
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

              {/* Submit Button */}
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
          </motion.div>

          {/* RIGHT COLUMN: ORGANIZATION DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Information Block */}
            <div className="glass border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-xl">
              <h3 className="text-lg font-black uppercase tracking-tight text-[var(--color-foreground)] mb-6">
                {t('contact.info.title')}
              </h3>

              <div className="space-y-6">
                {/* Email Address */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                      {t('contact.info.email')}
                    </h4>
                    <a href="mailto:quizdo9090@gmail.com" className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] hover:underline transition-all">
                      quizdo9090@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                      {t('contact.info.phone')}
                    </h4>
                    <a href="tel:+15551234567" className="text-sm font-bold text-[var(--color-foreground)] hover:text-[var(--primary)] transition-colors">
                      7052836069
                    </a>
                  </div>
                </div>

                {/* Office Location */}
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-2xl bg-[var(--primary-soft)] border border-[var(--primary-border)] text-[var(--primary)] shadow-sm flex-shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-muted)] mb-1">
                      {t('contact.info.office')}
                    </h4>
                    <p className="text-sm font-bold text-[var(--color-foreground)] leading-relaxed">
                      {t('contact.info.officeValue')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Channels */}
              <div className="pt-8 mt-8 border-t border-[var(--color-border)]">
                <h4 className="text-xs font-black uppercase tracking-widest text-[var(--color-muted)] mb-4">
                  {t('contact.info.socials')}
                </h4>
                <div className="flex items-center gap-3">
                  {[
                    { icon: Instagram, href: 'https://www.instagram.com/quiz_do__/?hl=en', name: 'Instagram' },
                    { icon: Github, href: 'https://github.', name: 'GitHub' },
                    { icon: Twitter, href: 'https://twitter.', name: 'Twitter' },
                    { icon: Linkedin, href: 'https://linkedin.', name: 'LinkedIn' },
                    { icon: Facebook, href: 'https://facebook.', name: 'Facebook' },
                  ].map((soc, idx) => (
                    <motion.a
                      key={idx}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit our ${soc.name}`}
                      whileHover={{ y: -3, scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-3 rounded-2xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary-border)] text-[var(--color-muted-foreground)] hover:text-[var(--primary)] transition-all shadow-sm"
                    >
                      <soc.icon className="w-4 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Embedded interactive map block mock */}
            <div className="glass border border-[var(--color-border)] rounded-3xl p-4 shadow-md backdrop-blur-xl relative h-[220px] overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-[var(--color-surface-muted)] flex flex-col items-center justify-center p-6 text-center">
                <MapPin className="w-8 h-8 text-[var(--primary)] mb-2 animate-bounce" />
                <span className="text-xs font-black text-[var(--color-foreground)] uppercase tracking-widest mb-1">{t('contact.info.mapMock')}</span>
                <span className="text-[11px] text-[var(--color-muted-foreground)] font-semibold">{t('contact.info.officeValue')}</span>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section className="py-20 bg-[var(--color-surface-muted)] border-t border-b border-[var(--color-border)] w-full">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[var(--color-foreground)] mb-3">
              {t('contact.faq.title')}
            </h2>
            <p className="text-[var(--color-muted)] text-sm font-semibold max-w-lg mx-auto">
              {t('contact.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow transition-shadow"
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-[var(--color-surface-muted)] outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-[var(--color-foreground)] pr-4">
                      {faq.q}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="text-[var(--color-muted-foreground)] p-1"
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
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                      >
                        <div className="p-5 pt-0 border-t border-[var(--color-border)] text-xs sm:text-sm text-[var(--color-muted)] leading-relaxed font-medium bg-[var(--color-surface-muted)]/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 text-white relative overflow-hidden bg-gradient-to-br from-slate-900 via-[var(--primary-dark)]/40 to-slate-900 text-center w-full">
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[var(--primary)]/10 blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[var(--primary-accent)]/10 blur-[80px]" />

        <div className="relative max-w-4xl mx-auto px-4 z-10 flex flex-col items-center">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-4">
            {t('contact.cta.title')}
          </h2>
          <p className="text-sm sm:text-base text-[var(--primary-border)]/90 font-medium max-w-xl mb-8 leading-relaxed">
            {t('contact.cta.subtitle')}
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              href={ROUTES.register}
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest text-[var(--primary-hover)] bg-white hover:bg-slate-100 hover:shadow-2xl transition-all duration-300 shadow-lg"
            >
              {t('contact.cta.button')}
            </Link>
          </motion.div>
        </div>
      </section>

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
