'use client';

import { useState } from 'react';
import {
  Send,
  Link2,
  Sparkles,
  Building2,
  Users,
  GraduationCap,
  UserCheck,
  BookOpenCheck,
  Info,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { TextField } from '@/components/ui/TextField';
import { Dropdown } from '@/components/ui/Dropdown';
import Button from '@/components/ui/Button';
import { NOTIFICATION_CATEGORIES, type BroadcastTargetAudience } from './types';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

interface NotificationComposerProps {
  titleEn: string;
  setTitleEn: (v: string) => void;
  titleHi: string;
  setTitleHi: (v: string) => void;
  bodyEn: string;
  setBodyEn: (v: string) => void;
  bodyHi: string;
  setBodyHi: (v: string) => void;
  category: NotificationCategory | '';
  setCategory: (c: NotificationCategory) => void;
  targetAudience: BroadcastTargetAudience;
  setTargetAudience: (a: BroadcastTargetAudience) => void;
  targetCourseId: string;
  setTargetCourseId: (c: string) => void;
  organizationId: string;
  setOrganizationId: (v: string) => void;
  deepLink: string;
  setDeepLink: (v: string) => void;
  isSending: boolean;
  isSuperAdmin: boolean;
  organizations: Array<{ id: string; name: string; inviteCode?: string }>;
  courses: Array<{ id: string; title: string; enrolledCount?: number; organizationId?: string }>;
  onSend: (e: React.FormEvent) => void;
}

export function NotificationComposer({
  titleEn,
  setTitleEn,
  titleHi,
  setTitleHi,
  bodyEn,
  setBodyEn,
  bodyHi,
  setBodyHi,
  category,
  setCategory,
  targetAudience,
  setTargetAudience,
  targetCourseId,
  setTargetCourseId,
  organizationId,
  setOrganizationId,
  deepLink,
  setDeepLink,
  isSending,
  isSuperAdmin,
  organizations,
  courses,
  onSend,
}: NotificationComposerProps) {
  const { t } = useTranslation();
  const [langTab, setLangTab] = useState<'en' | 'hi'>('en');

  const orgOptions = [
    { value: '', label: t('admin.notifications.allOrganizations') },
    ...organizations.map((org) => ({
      value: org.id,
      label: `${org.name}${org.inviteCode ? ` (${org.inviteCode})` : ''}`,
    })),
  ];

  const filteredCourses = courses.filter((c) =>
    !organizationId || !c.organizationId || c.organizationId === organizationId
  );

  const courseOptions = [
    { value: '', label: t('admin.notifications.selectCoursePlaceholder') },
    ...filteredCourses.map((course) => ({
      value: course.id,
      label: `${course.title} ${course.enrolledCount ? `(${course.enrolledCount} enrolled)` : ''}`,
    })),
  ];

  const AUDIENCE_OPTIONS: Array<{ key: BroadcastTargetAudience; labelKey: string; icon: typeof Users }> = [
    { key: 'all', labelKey: 'admin.notifications.audienceAll', icon: Users },
    { key: 'students', labelKey: 'admin.notifications.audienceStudents', icon: GraduationCap },
    { key: 'teachers', labelKey: 'admin.notifications.audienceTeachers', icon: UserCheck },
    { key: 'course_enrolled', labelKey: 'admin.notifications.audienceCourseEnrolled', icon: BookOpenCheck },
  ];

  return (
    <form
      onSubmit={onSend}
      className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-6 shadow-[var(--shadow-sm)] space-y-5"
    >
      {/* Header & Language Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('admin.notifications.title')}</span>
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {t('admin.notifications.targetAudienceDesc')}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-[var(--color-surface-muted)] p-1 rounded-xl border border-[var(--color-border)] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setLangTab('en')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
              langTab === 'en'
                ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs font-bold'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            🇬🇧 {t('admin.notifications.langEnglish')} *
          </button>
          <button
            type="button"
            onClick={() => setLangTab('hi')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer touch-target ${
              langTab === 'hi'
                ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs font-bold'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'
            }`}
          >
            🇮🇳 {t('admin.notifications.langHindi')}
          </button>
        </div>
      </div>

      {/* Target Audience Selector */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] block">
          {t('admin.notifications.audienceSelectorLabel')} *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AUDIENCE_OPTIONS.map(({ key, labelKey, icon: Icon }) => {
            const isSelected = targetAudience === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTargetAudience(key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer touch-target ${
                  isSelected
                    ? 'bg-[var(--primary-soft)] border-[var(--primary)] text-[var(--primary)] ring-2 ring-[var(--primary)]/30 font-bold shadow-xs'
                    : 'bg-[var(--color-surface-muted)]/50 border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--card-solid)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional Course Dropdown if targeting enrolled students */}
      {targetAudience === 'course_enrolled' && (
        <div className="p-3.5 rounded-xl bg-[var(--primary-soft)]/40 border border-[var(--primary)]/30 space-y-1.5">
          <label className="text-xs font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            <BookOpenCheck className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('admin.notifications.selectCourse')} *</span>
          </label>
          <Dropdown
            id="targetCourseDropdown"
            value={targetCourseId}
            onChange={(val) => setTargetCourseId(val)}
            options={courseOptions}
            placeholder={t('admin.notifications.selectCoursePlaceholder')}
            required
          />
        </div>
      )}

      {/* Category Selection Chips */}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] block">
          {t('admin.notifications.category')} *
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {NOTIFICATION_CATEGORIES.map((cat) => {
            const isSelected = category === cat.key;
            const Icon = cat.icon;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer touch-target ${
                  isSelected
                    ? `${cat.bgColor} ${cat.borderColor} ${cat.color} ring-2 ring-[var(--primary)] shadow-xs font-bold`
                    : 'bg-[var(--color-surface-muted)]/50 border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:bg-[var(--card-solid)]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="truncate">{t(cat.labelKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bilingual Content Editor */}
      {langTab === 'en' ? (
        <div className="space-y-4">
          <div className="space-y-1">
            <TextField
              id="titleEn"
              label={`${t('admin.notifications.titleEn')} *`}
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              placeholder="e.g. 📢 Campus Exam Schedule Published"
              required
              fullWidth
            />
            <div className="flex justify-between text-[11px] text-[var(--color-muted-foreground)] px-1">
              <span>{t('admin.notifications.recommendedTitleLength')}</span>
              <span>{t('admin.notifications.charCount', { count: titleEn.length })}</span>
            </div>
          </div>

          <div className="space-y-1">
            <TextField
              id="bodyEn"
              label={`${t('admin.notifications.bodyEn')} *`}
              multiline
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              placeholder="Write your broadcast message here..."
              required
              rows={3}
              fullWidth
            />
            <div className="flex justify-between text-[11px] text-[var(--color-muted-foreground)] px-1">
              <span>{t('admin.notifications.recommendedBodyLength')}</span>
              <span>{t('admin.notifications.charCount', { count: bodyEn.length })}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1">
            <TextField
              id="titleHi"
              label={t('admin.notifications.titleHi')}
              type="text"
              value={titleHi}
              onChange={(e) => setTitleHi(e.target.value)}
              placeholder="उदा. 📢 परीक्षा समय सारणी जारी कर दी गई है"
              fullWidth
            />
            <div className="flex justify-end text-[11px] text-[var(--color-muted-foreground)] px-1">
              <span>{t('admin.notifications.charCount', { count: titleHi.length })}</span>
            </div>
          </div>

          <div className="space-y-1">
            <TextField
              id="bodyHi"
              label={t('admin.notifications.bodyHi')}
              multiline
              value={bodyHi}
              onChange={(e) => setBodyHi(e.target.value)}
              placeholder="अपना हिंदी संदेश यहां लिखें..."
              rows={3}
              fullWidth
            />
            <div className="flex justify-end text-[11px] text-[var(--color-muted-foreground)] px-1">
              <span>{t('admin.notifications.charCount', { count: bodyHi.length })}</span>
            </div>
          </div>
        </div>
      )}

      {/* Target Organization & Deep Link */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--color-border)]">
        {isSuperAdmin ? (
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('admin.notifications.organizationId')}</span>
            </label>
            <Dropdown
              id="organizationDropdown"
              value={organizationId}
              onChange={(val) => setOrganizationId(val)}
              options={orgOptions}
              placeholder={t('admin.notifications.selectOrgPlaceholder')}
            />
          </div>
        ) : (
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t('admin.notifications.targetAudience')}</span>
            </label>
            <div className="p-2.5 rounded-xl bg-[var(--color-surface-muted)] border border-[var(--color-border)] text-xs text-[var(--color-muted-foreground)]">
              {t('admin.notifications.targetAudienceDesc')}
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)] flex items-center gap-1.5">
            <Link2 className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>{t('admin.notifications.deepLinkOptional')}</span>
          </label>
          <TextField
            id="deepLink"
            type="text"
            value={deepLink}
            onChange={(e) => setDeepLink(e.target.value)}
            placeholder={t('admin.notifications.deepLinkPlaceholder')}
            fullWidth
          />
        </div>
      </div>

      {/* Tip Banner */}
      <div className="flex items-start gap-2.5 p-3 bg-[var(--primary-soft)] rounded-xl border border-[var(--primary)]/20 text-xs text-[var(--color-foreground)]">
        <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">{t('admin.notifications.composeTip')}: </span>
          <span className="text-[var(--color-muted-foreground)]">
            {t('admin.notifications.composeTipDesc')}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSending || !titleEn.trim() || !bodyEn.trim() || (targetAudience === 'course_enrolled' && !targetCourseId)}
        isLoading={isSending}
        className="w-full py-2.5 sm:py-3 text-sm sm:text-base font-bold shadow-md flex items-center justify-center gap-2 touch-target"
      >
        <Send className="w-4 h-4" />
        <span>
          {isSending
            ? t('admin.notifications.sendingBroadcast')
            : t('admin.notifications.sendBroadcast')}
        </span>
      </Button>
    </form>
  );
}
