'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Building2, CheckCircle2, Mail, Send, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { ROUTES } from '@/constants/routes';
import { apiJsonData, getApiErrorMessage } from '@/lib/api/http';

interface OrgFormState {
  name: string;
  email: string;
  orgName: string;
  orgType: string;
  teamSize: string;
  phone: string;
  notes: string;
}

const INITIAL_FORM: OrgFormState = {
  name: '',
  email: '',
  orgName: '',
  orgType: 'Coaching / Test Prep Institute',
  teamSize: '100 – 500 members',
  phone: '',
  notes: '',
};

export function OrganizationRequestForm() {
  const { t } = useTranslation();
  const [form, setForm] = useState<OrgFormState>(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketId, setTicketId] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const subject = `[Organization Request] ${form.orgName.trim()}`.slice(0, 150);
    const messageLines = [
      `Organization Name: ${form.orgName.trim()}`,
      `Organization Type: ${form.orgType}`,
      `Estimated Size: ${form.teamSize}`,
      form.phone.trim() ? `Phone / WhatsApp: ${form.phone.trim()}` : null,
      '',
      'Requirements / Notes:',
      form.notes.trim() || 'Interested in creating a new organization workspace on Quiz Do.',
    ].filter((line): line is string => line !== null);

    try {
      const { data } = await apiJsonData<{ ticketId?: string }>('/api/contact', {
        method: 'POST',
        body: {
          name: form.name.trim(),
          email: form.email.trim(),
          subject,
          message: messageLines.join('\n'),
        },
      });
      setTicketId(data?.ticketId || 'ORG-REQ');
      setForm(INITIAL_FORM);
    } catch (err) {
      setError(getApiErrorMessage(err, t('orgLanding.errorGeneric')));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="request-organization"
      className="scroll-mt-24 bg-[var(--card-solid)] border border-[var(--border)] rounded-3xl p-6 sm:p-10 shadow-xl"
    >
      <div className="max-w-2xl mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
          <Building2 className="w-3.5 h-3.5" />
          <span>{t('orgLanding.formBadge')}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)]">
          {t('orgLanding.formHeading')}
        </h2>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('orgLanding.formSubheading')}
        </p>
      </div>

      {ticketId ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">
                {t('orgLanding.successTitle')}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {t('orgLanding.successDesc')}
              </p>
              <p className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 pt-1">
                {t('orgLanding.ticketLabel')}: {ticketId}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTicketId(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-xl bg-[var(--card-solid)] border border-[var(--border)] text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--surface-muted)] transition-colors cursor-pointer"
          >
            {t('orgLanding.submitAnother')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error-light)] px-4 py-3 text-sm font-medium text-[var(--error)]">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldName')} *
              </span>
              <input
                type="text"
                name="name"
                required
                minLength={2}
                maxLength={100}
                value={form.name}
                onChange={handleChange}
                placeholder={t('orgLanding.fieldNamePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldEmail')} *
              </span>
              <input
                type="email"
                name="email"
                required
                maxLength={100}
                value={form.email}
                onChange={handleChange}
                placeholder={t('orgLanding.fieldEmailPlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldOrgName')} *
              </span>
              <input
                type="text"
                name="orgName"
                required
                minLength={2}
                maxLength={120}
                value={form.orgName}
                onChange={handleChange}
                placeholder={t('orgLanding.fieldOrgNamePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldPhone')}
              </span>
              <input
                type="tel"
                name="phone"
                maxLength={30}
                value={form.phone}
                onChange={handleChange}
                placeholder={t('orgLanding.fieldPhonePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldOrgType')}
              </span>
              <select
                name="orgType"
                value={form.orgType}
                onChange={handleChange}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              >
                <option value="School (K-12)">{t('orgLanding.typeSchool')}</option>
                <option value="Coaching / Test Prep Institute">{t('orgLanding.typeCoaching')}</option>
                <option value="College / University">{t('orgLanding.typeCollege')}</option>
                <option value="Corporate / Training Team">{t('orgLanding.typeCorporate')}</option>
                <option value="Other">{t('orgLanding.typeOther')}</option>
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-semibold text-[var(--color-foreground)]">
                {t('orgLanding.fieldSize')}
              </span>
              <select
                name="teamSize"
                value={form.teamSize}
                onChange={handleChange}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35"
              >
                <option value="Up to 100 members">{t('orgLanding.sizeSmall')}</option>
                <option value="100 – 500 members">{t('orgLanding.sizeMedium')}</option>
                <option value="500 – 2,000 members">{t('orgLanding.sizeLarge')}</option>
                <option value="2,000+ members">{t('orgLanding.sizeEnterprise')}</option>
              </select>
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-[var(--color-foreground)]">
              {t('orgLanding.fieldNotes')} *
            </span>
            <textarea
              name="notes"
              required
              minLength={10}
              maxLength={1500}
              rows={4}
              value={form.notes}
              onChange={handleChange}
              placeholder={t('orgLanding.fieldNotesPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--surface-muted)] border border-[var(--border)] text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/35 resize-y"
            />
          </label>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 rounded-xl gradient-bg text-white font-bold text-sm shadow-md hover:opacity-95 disabled:opacity-60 transition-opacity cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? t('orgLanding.submittingBtn') : t('orgLanding.submitBtn')}</span>
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-muted-foreground)]">
              <Mail className="w-4 h-4 shrink-0" />
              <span>{t('orgLanding.preferDirectContact')}</span>
              <Link
                href={ROUTES.contact}
                className="inline-flex items-center gap-1 font-semibold text-[var(--primary)] hover:underline"
              >
                <span>{t('orgLanding.openContactPage')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
