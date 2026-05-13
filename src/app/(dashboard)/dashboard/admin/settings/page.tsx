'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  Globe,
  GraduationCap,
  FileText,
  BookOpen,
  Power,
  UserPlus,
  ToggleLeft,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchAdminSettings, patchAdminSettings } from '@/lib/api/adminSettings';
import { ApiClientError } from '@/lib/api/http';

interface AppSettings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  featureToggles: {
    enableBlogs: boolean;
    enableQuizzes: boolean;
    enableCourses: boolean;
    enableAnalytics: boolean;
  };
  platformConfig: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    defaultLanguage: 'en' | 'hi';
  };
}

export default function AdminSettingsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const {setValue} = useLocalStorage('settingsTimestamp', '')
  const [settings, setSettings] = useState<AppSettings>({
    teacherLimits: {
      courses: 5,
      quizzes: 10,
      blogs: 2,
    },
    featureToggles: {
      enableBlogs: true,
      enableQuizzes: true,
      enableCourses: true,
      enableAnalytics: true,
    },
    platformConfig: {
      maintenanceMode: false,
      allowRegistration: true,
      defaultLanguage: 'en',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const data = (await fetchAdminSettings()) as AppSettings;
      setSettings(data);
    } catch {
      setMessage({ type: 'error', text: t('adminSettings.failedLoadSettings') });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      // Role-based redirect handled in /dashboard/page.tsx
      fetchSettings();
    }
  }, [status, session, fetchSettings, router]);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      await patchAdminSettings(settings);
      setMessage({ type: 'success', text: t('adminSettings.settingsSaved') });

      setValue(Date.now().toString());
      // Force refresh of settings across the app by updating localStorage timestamp
    } catch (err) {
      setMessage({
        type: 'error',
        text:
          err instanceof ApiClientError
            ? err.message
            : t('adminSettings.failedSaveSettings'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className={`p-3 ${theme.activeBg} rounded-xl`}>
          <Settings className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('adminSettings.title')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('adminSettings.description')}</p>
        </div>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

      {/* Teacher Content Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
          <GraduationCap className="w-5 h-5" />
          {t('adminSettings.teacherLimits')}
        </h2>

        <div className="space-y-6">
          {/* Courses Limit */}
          <div className="flex items-start gap-4">
            <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
              <GraduationCap className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                {t('adminSettings.coursesLimit')}
              </label>
              <input
                type="number"
                min="1"
                value={settings.teacherLimits.courses}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    teacherLimits: {
                      ...settings.teacherLimits,
                      courses: parseInt(e.target.value) || 1,
                    },
                  })
                }
                className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {t('adminSettings.coursesLimitDesc')}
              </p>
            </div>
          </div>

          {/* Quizzes Limit */}
          <div className="flex items-start gap-4">
            <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
              <FileText className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                {t('adminSettings.quizzesLimit')}
              </label>
              <input
                type="number"
                min="1"
                value={settings.teacherLimits.quizzes}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    teacherLimits: {
                      ...settings.teacherLimits,
                      quizzes: parseInt(e.target.value) || 1,
                    },
                  })
                }
                className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {t('adminSettings.quizzesLimitDesc')}
              </p>
            </div>
          </div>

          {/* Blogs Limit */}
          <div className="flex items-start gap-4">
            <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[var(--color-foreground)] mb-2">
                {t('adminSettings.blogsLimit')}
              </label>
              <input
                type="number"
                min="1"
                value={settings.teacherLimits.blogs}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    teacherLimits: {
                      ...settings.teacherLimits,
                      blogs: parseInt(e.target.value) || 1,
                    },
                  })
                }
                className="w-full px-4 py-2.5 min-h-[44px] bg-[var(--color-surface-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]"
              />
              <p className="text-xs text-[var(--color-muted-foreground)] mt-1">
                {t('adminSettings.blogsLimitDesc')}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature Toggles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
          <ToggleLeft className="w-5 h-5" />
          {t('adminSettings.featureToggles')}
        </h2>

        <div className="space-y-4">
          {/* Enable Blogs */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <BookOpen className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableBlogs')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableBlogsDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  featureToggles: {
                    ...settings.featureToggles,
                    enableBlogs: !settings.featureToggles.enableBlogs,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.featureToggles.enableBlogs ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.featureToggles.enableBlogs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Quizzes */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableQuizzes')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableQuizzesDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  featureToggles: {
                    ...settings.featureToggles,
                    enableQuizzes: !settings.featureToggles.enableQuizzes,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.featureToggles.enableQuizzes ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.featureToggles.enableQuizzes ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Courses */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <GraduationCap className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableCourses')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableCoursesDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  featureToggles: {
                    ...settings.featureToggles,
                    enableCourses: !settings.featureToggles.enableCourses,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.featureToggles.enableCourses ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.featureToggles.enableCourses ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Enable Analytics */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableAnalytics')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableAnalyticsDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  featureToggles: {
                    ...settings.featureToggles,
                    enableAnalytics: !settings.featureToggles.enableAnalytics,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.featureToggles.enableAnalytics ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.featureToggles.enableAnalytics ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Platform Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-[var(--color-foreground)] mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('adminSettings.platformConfig')}
        </h2>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.maintenanceMode')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.maintenanceModeDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  platformConfig: {
                    ...settings.platformConfig,
                    maintenanceMode: !settings.platformConfig.maintenanceMode,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.platformConfig.maintenanceMode ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.platformConfig.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Allow Registration */}
          <div className="flex items-center justify-between p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3">
              <UserPlus className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.allowRegistration')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.allowRegistrationDesc')}</p>
              </div>
            </div>
            <button
              onClick={() =>
                setSettings({
                  ...settings,
                  platformConfig: {
                    ...settings.platformConfig,
                    allowRegistration: !settings.platformConfig.allowRegistration,
                  },
                })
              }
              className={`relative inline-flex h-6 w-11 min-h-[44px] sm:min-h-0 items-center rounded-full transition-colors ${
                settings.platformConfig.allowRegistration ? `bg-gradient-to-r ${theme.gradient}` : 'bg-[var(--color-surface-muted)]'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.platformConfig.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          onClick={handleSave}
          disabled={isSaving}
          isLoading={isSaving}
          size="lg"
          className="w-full sm:w-auto min-h-[44px]"
        >
          {!isSaving && <Save className="w-5 h-5 mr-2" />}
          {isSaving ? t('adminSettings.saving') : t('adminSettings.saveSettings')}
        </Button>
      </motion.div>
    </div>
  );
}
