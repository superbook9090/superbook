'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  Settings,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Users,
  BarChart3,
  GraduationCap,
  FileText,
  BookOpen,
  Power,
  UserPlus,
  ToggleLeft,
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import Alert from '@/components/ui/Alert';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
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
  }, [status, session]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      setMessage({ type: 'error', text: t('adminSettings.failedLoadSettings') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save settings');
      }

      setMessage({ type: 'success', text: t('adminSettings.settingsSaved') });

      // Force refresh of settings across the app by updating localStorage timestamp
      localStorage.setItem('settingsTimestamp', Date.now().toString());
    } catch (error) {
      setMessage({ type: 'error', text: t('adminSettings.failedSaveSettings') });
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return <Loader variant="inline" size="lg" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('adminSettings.title')}</h1>
          <p className="text-gray-500 mt-1">{t('adminSettings.description')}</p>
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
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
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
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <ToggleLeft className="w-5 h-5" />
          {t('adminSettings.featureToggles')}
        </h2>

        <div className="space-y-4">
          {/* Enable Blogs */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <BookOpen className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.enableBlogs')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.enableBlogsDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.featureToggles.enableBlogs ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <FileText className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.enableQuizzes')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.enableQuizzesDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.featureToggles.enableQuizzes ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <GraduationCap className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.enableCourses')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.enableCoursesDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.featureToggles.enableCourses ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Settings className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.enableAnalytics')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.enableAnalyticsDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.featureToggles.enableAnalytics ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t('adminSettings.platformConfig')}
        </h2>

        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Power className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.maintenanceMode')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.maintenanceModeDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.platformConfig.maintenanceMode ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <UserPlus className={`w-5 h-5 ${theme.text}`} />
              <div>
                <p className="font-medium text-gray-900">{t('adminSettings.allowRegistration')}</p>
                <p className="text-sm text-gray-500">{t('adminSettings.allowRegistrationDesc')}</p>
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.platformConfig.allowRegistration ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-300'
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
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isSaving ? (
            <>
              <Loader variant="button" size="sm" />
              {t('adminSettings.saving')}
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              {t('adminSettings.saveSettings')}
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
