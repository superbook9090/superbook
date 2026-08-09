'use client';
import { ROUTES } from '@/constants/routes';

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
  Sparkles,
  Shield,
  Users,
  Phone,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import ToggleSwitch from '@/components/ui/ToggleSwitch';
import { PageSkeleton } from '@/components/ui/Skeleton';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { TextField } from '@/components/ui/TextField';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchAdminSettings, patchAdminSettings } from '@/lib/api/adminSettings';
import { ApiClientError } from '@/lib/api/http';
import { isSuperAdmin } from '@/lib/roles';
import { useSettingsStore } from '@/store/useSettingsStore';

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
    enableClarity: boolean;
    enableQuizSolutionAnalysis: boolean;
    restrictPublicCourseCreation?: boolean;
    enableEnrollmentManagement?: boolean;
    enablePhoneAuth?: boolean;
  };
  platformConfig: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    allowTeacherRegistration: boolean;
    defaultLanguage: 'en' | 'hi';
  };
}

export default function AdminSettingsPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const { setValue } = useLocalStorage('settingsTimestamp', '');
  const fetchPublicSettings = useSettingsStore((s) => s.fetchSettings);
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
      enableClarity: true,
      enableQuizSolutionAnalysis: false,
      restrictPublicCourseCreation: false,
      enableEnrollmentManagement: true,
      enablePhoneAuth: true,
    },
    platformConfig: {
      maintenanceMode: false,
      allowRegistration: true,
      allowTeacherRegistration: true,
      defaultLanguage: 'en',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const canManageSolutionAnalysis = isSuperAdmin(session?.user?.role);

  const fetchSettings = useCallback(async () => {
    try {
      const data = (await fetchAdminSettings()) as AppSettings;
      setSettings({
        ...data,
        featureToggles: {
          ...data.featureToggles,
          enableClarity: data.featureToggles.enableClarity ?? true,
          enableQuizSolutionAnalysis: data.featureToggles.enableQuizSolutionAnalysis ?? false,
          restrictPublicCourseCreation: data.featureToggles.restrictPublicCourseCreation ?? false,
          enableEnrollmentManagement: data.featureToggles.enableEnrollmentManagement ?? true,
          enablePhoneAuth: data.featureToggles.enablePhoneAuth ?? true,
        },
        platformConfig: {
          ...{
            maintenanceMode: false,
            allowRegistration: true,
            allowTeacherRegistration: true,
            defaultLanguage: 'en' as const,
          },
          ...data.platformConfig,
        },
      });
    } catch {
      setMessage({ type: 'error', text: t('adminSettings.failedLoadSettings') });
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
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
      await fetchPublicSettings(true);
      window.dispatchEvent(new Event('settingsUpdated'));
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
              <TextField
                label={t('adminSettings.coursesLimit')}
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
                helperText={t('adminSettings.coursesLimitDesc')}
                fullWidth
              />
            </div>
          </div>

          {/* Quizzes Limit */}
          <div className="flex items-start gap-4">
            <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
              <FileText className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div className="flex-1">
              <TextField
                label={t('adminSettings.quizzesLimit')}
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
                helperText={t('adminSettings.quizzesLimitDesc')}
                fullWidth
              />
            </div>
          </div>

          {/* Blogs Limit */}
          <div className="flex items-start gap-4">
            <div className={`p-3 ${theme.activeBg} rounded-xl flex-shrink-0`}>
              <BookOpen className={`w-5 h-5 ${theme.text}`} />
            </div>
            <div className="flex-1">
              <TextField
                label={t('adminSettings.blogsLimit')}
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
                helperText={t('adminSettings.blogsLimitDesc')}
                fullWidth
              />
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
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <BookOpen className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableBlogs')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableBlogsDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.featureToggles.enableBlogs}
              onChange={(enableBlogs) =>
                setSettings({
                  ...settings,
                  featureToggles: { ...settings.featureToggles, enableBlogs },
                })
              }
              label={t('adminSettings.enableBlogs')}
            />
          </div>

          {/* Enable Quizzes */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableQuizzes')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableQuizzesDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.featureToggles.enableQuizzes}
              onChange={(enableQuizzes) =>
                setSettings({
                  ...settings,
                  featureToggles: { ...settings.featureToggles, enableQuizzes },
                })
              }
              label={t('adminSettings.enableQuizzes')}
            />
          </div>

          {/* Enable Courses */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <GraduationCap className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableCourses')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableCoursesDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.featureToggles.enableCourses}
              onChange={(enableCourses) =>
                setSettings({
                  ...settings,
                  featureToggles: { ...settings.featureToggles, enableCourses },
                })
              }
              label={t('adminSettings.enableCourses')}
            />
          </div>

          {/* Enable Analytics */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Settings className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableAnalytics')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableAnalyticsDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.featureToggles.enableAnalytics}
              onChange={(enableAnalytics) =>
                setSettings({
                  ...settings,
                  featureToggles: { ...settings.featureToggles, enableAnalytics },
                })
              }
              label={t('adminSettings.enableAnalytics')}
            />
          </div>

          {/* Enable Microsoft Clarity */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Settings className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.enableClarity')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.enableClarityDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.featureToggles.enableClarity}
              onChange={(enableClarity) =>
                setSettings({
                  ...settings,
                  featureToggles: { ...settings.featureToggles, enableClarity },
                })
              }
              label={t('adminSettings.enableClarity')}
            />
          </div>

          {canManageSolutionAnalysis && (
            <>
              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Sparkles className={`w-5 h-5 shrink-0 ${theme.text}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {t('adminSettings.enableQuizSolutionAnalysis')}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t('adminSettings.enableQuizSolutionAnalysisDesc')}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.featureToggles.enableQuizSolutionAnalysis}
                  onChange={(enableQuizSolutionAnalysis) =>
                    setSettings({
                      ...settings,
                      featureToggles: { ...settings.featureToggles, enableQuizSolutionAnalysis },
                    })
                  }
                  label={t('adminSettings.enableQuizSolutionAnalysis')}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Shield className={`w-5 h-5 shrink-0 ${theme.text}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {t('adminSettings.restrictPublicCourseCreation')}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t('adminSettings.restrictPublicCourseCreationDesc')}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.featureToggles.restrictPublicCourseCreation ?? false}
                  onChange={(restrictPublicCourseCreation) =>
                    setSettings({
                      ...settings,
                      featureToggles: { ...settings.featureToggles, restrictPublicCourseCreation },
                    })
                  }
                  label={t('adminSettings.restrictPublicCourseCreation')}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Users className={`w-5 h-5 shrink-0 ${theme.text}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {t('adminSettings.enableEnrollmentManagement')}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t('adminSettings.enableEnrollmentManagementDesc')}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.featureToggles.enableEnrollmentManagement ?? true}
                  onChange={(enableEnrollmentManagement) =>
                    setSettings({
                      ...settings,
                      featureToggles: { ...settings.featureToggles, enableEnrollmentManagement },
                    })
                  }
                  label={t('adminSettings.enableEnrollmentManagement')}
                />
              </div>

              <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Phone className={`w-5 h-5 shrink-0 ${theme.text}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {t('adminSettings.enablePhoneAuth')}
                    </p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      {t('adminSettings.enablePhoneAuthDesc')}
                    </p>
                  </div>
                </div>
                <ToggleSwitch
                  checked={settings.featureToggles.enablePhoneAuth ?? true}
                  onChange={(enablePhoneAuth) =>
                    setSettings({
                      ...settings,
                      featureToggles: { ...settings.featureToggles, enablePhoneAuth },
                    })
                  }
                  label={t('adminSettings.enablePhoneAuth')}
                />
              </div>
            </>
          )}
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
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Power className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.maintenanceMode')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.maintenanceModeDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.platformConfig.maintenanceMode}
              onChange={(maintenanceMode) =>
                setSettings({
                  ...settings,
                  platformConfig: { ...settings.platformConfig, maintenanceMode },
                })
              }
              label={t('adminSettings.maintenanceMode')}
            />
          </div>

          {/* Allow Registration */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <UserPlus className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.allowRegistration')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.allowRegistrationDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.platformConfig.allowRegistration}
              onChange={(allowRegistration) =>
                setSettings({
                  ...settings,
                  platformConfig: { ...settings.platformConfig, allowRegistration },
                })
              }
              label={t('adminSettings.allowRegistration')}
            />
          </div>

          {/* Allow Teacher Registration */}
          <div className="flex items-center justify-between gap-4 p-4 bg-[var(--color-surface-muted)] rounded-xl">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <GraduationCap className={`w-5 h-5 shrink-0 ${theme.text}`} />
              <div className="min-w-0">
                <p className="font-medium text-[var(--color-foreground)]">{t('adminSettings.allowTeacherRegistration')}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{t('adminSettings.allowTeacherRegistrationDesc')}</p>
              </div>
            </div>
            <ToggleSwitch
              checked={settings.platformConfig.allowTeacherRegistration}
              onChange={(allowTeacherRegistration) =>
                setSettings({
                  ...settings,
                  platformConfig: { ...settings.platformConfig, allowTeacherRegistration },
                })
              }
              label={t('adminSettings.allowTeacherRegistration')}
              disabled={!settings.platformConfig.allowRegistration}
            />
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
