'use client';

import React from 'react';
import { ShieldCheck, Sliders, Video, Globe, Trophy, Sparkles } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { OrganizationFormData, OrganizationTeacherLimitsForm } from './types';

interface OrganizationPolicyFieldsProps {
  formData: OrganizationFormData;
  setFormData: React.Dispatch<React.SetStateAction<OrganizationFormData>>;
}

export function OrganizationPolicyFields({
  formData,
  setFormData,
}: OrganizationPolicyFieldsProps) {
  const { t } = useTranslation();

  const permissionItems = [
    {
      key: 'canUploadVideos' as const,
      icon: <Video className="w-3.5 h-3.5" />,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
      label: t('adminUsers.videoUploadPermission'),
    },
    {
      key: 'canCreatePublicCourses' as const,
      icon: <Globe className="w-3.5 h-3.5" />,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
      label: t('adminUsers.canCreatePublicCourses'),
    },
    {
      key: 'canCreateContests' as const,
      icon: <Trophy className="w-3.5 h-3.5" />,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      label: t('adminUsers.canCreateContests'),
    },
    {
      key: 'canGenerateAiQuizzes' as const,
      icon: <Sparkles className="w-3.5 h-3.5" />,
      iconBg: 'bg-[var(--primary-soft)] text-[var(--primary)]',
      label: t('adminUsers.canGenerateAiQuizzes'),
    },
  ];

  const limitItems: Array<{
    key: keyof OrganizationTeacherLimitsForm;
    label: string;
    max?: number;
  }> = [
    { key: 'courses', label: t('adminUsers.courses') },
    { key: 'quizzes', label: t('adminUsers.quizzes') },
    { key: 'blogs', label: t('adminUsers.blogs') },
    { key: 'aiQuizGenerations', label: t('adminUsers.aiQuizGenerations') },
    { key: 'aiQuizMaxQuestions', label: t('adminUsers.aiQuizMaxQuestions'), max: 50 },
  ];

  const togglePermission = (key: keyof OrganizationFormData['permissions']) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [key]: !prev.permissions[key],
      },
    }));
  };

  const updateLimit = (key: keyof OrganizationTeacherLimitsForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      teacherLimits: {
        ...prev.teacherLimits,
        [key]: value,
      },
    }));
  };

  return (
    <div className="flex flex-col gap-3.5 p-3.5 rounded-xl bg-[var(--color-surface-muted)]/45 border border-[var(--border)]">
      {/* Feature Access Delegated to Org Admin */}
      <div className="flex flex-col gap-2">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{t('organizations.featureAccessTitle')}</span>
          </span>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
            {t('organizations.featureAccessDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {permissionItems.map((item) => {
            const checked = Boolean(formData.permissions[item.key]);
            return (
              <label
                key={item.key}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-[var(--card-solid)] border border-[var(--border)] cursor-pointer hover:border-[var(--primary)]/40 transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <span className={`p-1.5 rounded-md shrink-0 ${item.iconBg}`}>{item.icon}</span>
                  <span className="text-xs font-semibold text-[var(--color-foreground)] truncate">
                    {item.label}
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePermission(item.key)}
                  className="w-4 h-4 accent-[var(--primary)] rounded cursor-pointer shrink-0"
                />
              </label>
            );
          })}
        </div>
      </div>

      {/* Teacher Quota Ceilings Delegated to Org Admin */}
      <div className="flex flex-col gap-2 pt-2.5 border-t border-[var(--border)]/70">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-foreground)] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[var(--teacher-primary)]" />
            <span>{t('organizations.teacherQuotaCeilingsTitle')}</span>
          </span>
          <p className="text-[11px] text-[var(--color-muted-foreground)] mt-0.5">
            {t('organizations.teacherQuotaCeilingsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {limitItems.map((item) => (
            <div key={item.key} className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-[var(--color-muted-foreground)] truncate">
                {item.label}
              </label>
              <input
                type="number"
                min="1"
                max={item.max}
                value={formData.teacherLimits[item.key]}
                onChange={(e) => updateLimit(item.key, e.target.value)}
                placeholder={t('organizations.notGrantedPlaceholder')}
                className="w-full px-3 py-1.5 min-h-[38px] bg-[var(--card-solid)] border border-[var(--border)] text-[var(--color-foreground)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-xs font-semibold"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
