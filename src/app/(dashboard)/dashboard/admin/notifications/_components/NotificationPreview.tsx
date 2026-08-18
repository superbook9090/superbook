'use client';

import { Smartphone, Bell, Eye, ExternalLink } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { NOTIFICATION_CATEGORIES, type DevicePreviewMode, type PreviewLang, type BroadcastTargetAudience } from './types';
import type { NotificationCategory } from '@/lib/notifications/push/notificationPayload';

interface NotificationPreviewProps {
  titleEn: string;
  titleHi: string;
  bodyEn: string;
  bodyHi: string;
  category: NotificationCategory | '';
  targetAudience?: BroadcastTargetAudience;
  deepLink: string;
  previewDevice: DevicePreviewMode;
  setPreviewDevice: (mode: DevicePreviewMode) => void;
  previewLang: PreviewLang;
  setPreviewLang: (lang: PreviewLang) => void;
}

export function NotificationPreview({
  titleEn,
  titleHi,
  bodyEn,
  bodyHi,
  category,
  targetAudience = 'all',
  deepLink,
  previewDevice,
  setPreviewDevice,
  previewLang,
  setPreviewLang,
}: NotificationPreviewProps) {
  const { t } = useTranslation();

  const activeCategoryMeta = NOTIFICATION_CATEGORIES.find((c) => c.key === category) || NOTIFICATION_CATEGORIES[0];
  const CategoryIcon = activeCategoryMeta.icon;

  const displayTitle =
    previewLang === 'hi' && titleHi.trim()
      ? titleHi.trim()
      : titleEn.trim() || 'Notification Title Preview';

  const displayBody =
    previewLang === 'hi' && bodyHi.trim()
      ? bodyHi.trim()
      : bodyEn.trim() || 'This is a real-time preview of how your broadcast message will appear on user devices.';

  return (
    <div className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-4 sm:p-5 shadow-[var(--shadow-sm)] space-y-4">
      {/* Header with Mode Switches */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--color-border)]">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[var(--color-foreground)] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[var(--primary)]" />
            <span>{t('admin.notifications.livePreview')}</span>
          </h3>
          <p className="text-[11px] text-[var(--color-muted-foreground)]">
            {t('admin.notifications.previewSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Language Toggle */}
          <div className="flex items-center bg-[var(--color-surface-muted)] p-0.5 rounded-lg border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPreviewLang('en')}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer touch-target ${
                previewLang === 'en'
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setPreviewLang('hi')}
              className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all cursor-pointer touch-target ${
                previewLang === 'hi'
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              HI
            </button>
          </div>

          {/* Device Frame Switcher */}
          <div className="flex items-center bg-[var(--color-surface-muted)] p-0.5 rounded-lg border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => setPreviewDevice('ios')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer touch-target ${
                previewDevice === 'ios'
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs font-bold'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              iOS
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('android')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer touch-target ${
                previewDevice === 'android'
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs font-bold'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              Android
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice('inbox')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer touch-target ${
                previewDevice === 'inbox'
                  ? 'bg-[var(--card-solid)] text-[var(--primary)] shadow-xs font-bold'
                  : 'text-[var(--color-muted-foreground)]'
              }`}
            >
              Inbox
            </button>
          </div>
        </div>
      </div>

      {/* Device Frame Viewport Container */}
      <div className="p-4 sm:p-6 bg-gradient-to-b from-[var(--color-surface-muted)]/60 to-[var(--color-surface-muted)] rounded-xl border border-[var(--color-border)] flex items-center justify-center min-h-[220px]">
        {/* iOS Lock Screen Card Simulation */}
        {previewDevice === 'ios' && (
          <div className="w-full max-w-sm bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-3.5 shadow-2xl text-white space-y-2">
            <div className="flex items-center justify-between text-[11px] text-white/80">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-xs">
                  Q
                </div>
                <span className="font-semibold tracking-wide">QUIZ-DO</span>
                <span className="text-white/40">•</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded capitalize">
                  {t(activeCategoryMeta.labelKey)}
                </span>
              </div>
              <span className="text-[10px] text-white/60">now</span>
            </div>

            <div className="space-y-1">
              <div className="font-semibold text-xs text-white leading-tight break-words">
                {displayTitle}
              </div>
              <div className="text-[11px] text-white/80 line-clamp-3 leading-relaxed break-words">
                {displayBody}
              </div>
            </div>

            {deepLink && (
              <div className="pt-1 flex items-center gap-1 text-[10px] text-indigo-300 font-medium">
                <ExternalLink className="w-3 h-3" />
                <span className="truncate">{deepLink}</span>
              </div>
            )}
          </div>
        )}

        {/* Android Tray Simulation */}
        {previewDevice === 'android' && (
          <div className="w-full max-w-sm bg-[var(--card-solid)] border border-[var(--color-border)] rounded-2xl p-3.5 shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className={`p-1 rounded-full ${activeCategoryMeta.bgColor} ${activeCategoryMeta.color}`}>
                  <CategoryIcon className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-[var(--color-foreground)] text-xs">Quiz-Do</span>
                <span className="text-[var(--color-muted)] text-[10px]">•</span>
                <span className="text-[10px] text-[var(--color-muted)]">now</span>
              </div>
              <span className="text-[10px] font-semibold text-[var(--primary)] uppercase tracking-wider">
                {t(activeCategoryMeta.labelKey)}
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="font-bold text-xs text-[var(--color-foreground)] break-words">
                {displayTitle}
              </div>
              <div className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-3 break-words">
                {displayBody}
              </div>
            </div>

            {deepLink && (
              <div className="pt-1 border-t border-[var(--color-border)] flex items-center justify-between text-[11px]">
                <span className="text-[var(--primary)] font-semibold flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Open Link
                </span>
                <span className="text-[10px] text-[var(--color-muted)] truncate max-w-[150px]">
                  {deepLink}
                </span>
              </div>
            )}
          </div>
        )}

        {/* In-App Inbox Card Simulation */}
        {previewDevice === 'inbox' && (
          <div className="w-full max-w-sm bg-[var(--card-solid)] border border-[var(--color-border)] rounded-xl p-3.5 shadow-sm space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-[var(--primary)] shrink-0 animate-pulse" />
                <div className={`p-1.5 rounded-lg ${activeCategoryMeta.bgColor} ${activeCategoryMeta.color} shrink-0`}>
                  <CategoryIcon className="w-3.5 h-3.5" />
                </div>
                <span className="text-[11px] font-bold text-[var(--color-foreground)] uppercase tracking-wider truncate">
                  {t(activeCategoryMeta.labelKey)}
                </span>
              </div>
              <span className="text-[10px] text-[var(--color-muted)] shrink-0 font-medium">Just now</span>
            </div>

            <div className="pl-4 space-y-1">
              <h4 className="font-bold text-xs text-[var(--color-foreground)] break-words">
                {displayTitle}
              </h4>
              <p className="text-[11px] text-[var(--color-muted-foreground)] line-clamp-3 leading-relaxed break-words">
                {displayBody}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[var(--color-muted-foreground)] pt-1 border-t border-[var(--color-border)]/50">
        <span className="flex items-center gap-1 font-medium text-[var(--primary)] bg-[var(--primary-soft)] px-2 py-0.5 rounded-md">
          <span>🎯 {
            targetAudience === 'students'
              ? t('admin.notifications.audienceStudents')
              : targetAudience === 'teachers'
              ? t('admin.notifications.audienceTeachers')
              : targetAudience === 'course_enrolled'
              ? t('admin.notifications.audienceCourseEnrolled')
              : t('admin.notifications.audienceAll')
          }</span>
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <Smartphone className="w-3.5 h-3.5" />
            <span>FCM + In-App</span>
          </span>
          <span className="flex items-center gap-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Live Rendering</span>
          </span>
        </div>
      </div>
    </div>
  );
}
