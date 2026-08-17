'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  Settings,
  Save
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSessionStore } from '@/store/useSessionStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { fetchAdminSettings, patchAdminSettings } from '@/lib/api/adminSettings';
import { ApiClientError } from '@/lib/api/http';
import { isSuperAdmin } from '@/lib/roles';
import { useSettingsStore } from '@/store/useSettingsStore';

import { TeacherLimitsSection } from './_components/TeacherLimitsSection';
import { NotesLimitsSection } from './_components/NotesLimitsSection';
import { FeatureTogglesSection } from './_components/FeatureTogglesSection';
import { PlatformConfigSection } from './_components/PlatformConfigSection';
import type { AppSettings } from './_components/types';
import { PageWrapper, PageHeader } from '@/components/layout';

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
  const { addAlert } = useAlert();
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
      addAlert({ type: 'error', message: t('adminSettings.failedLoadSettings') });
    } finally {
      setIsLoading(false);
    }
  }, [t, addAlert]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push(ROUTES.login);
      return;
    }

    if (!isSuperAdmin(session.user?.role) && session.user?.role !== 'admin') {
      router.push(ROUTES.dashboard);
      return;
    }

    fetchSettings();
  }, [session, status, router, fetchSettings]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      await patchAdminSettings(settings);
      setValue(new Date().toISOString());
      await fetchPublicSettings();
      addAlert({ type: 'success', message: t('adminSettings.settingsSaved') });
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err) {
      addAlert({
        type: 'error',
        message:
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
    <PageWrapper className="max-w-4xl">
      {/* Header */}
      <PageHeader
        title={
          <span className="flex items-center gap-3">
            <span className={`p-2.5 ${theme.activeBg} rounded-xl shrink-0 inline-flex`}>
              <Settings className={`w-6 h-6 ${theme.text}`} />
            </span>
            <span>{t('adminSettings.title')}</span>
          </span>
        }
        description={t('adminSettings.description')}
      />

      
      {/* Teacher Content Limits */}
      <TeacherLimitsSection 
        settings={settings} 
        setSettings={setSettings} 
        theme={theme} 
      />

      {/* Notes Limits */}
      <NotesLimitsSection
        settings={settings}
        setSettings={setSettings}
        theme={theme}
      />

      {/* Feature Toggles */}
      <FeatureTogglesSection 
        settings={settings} 
        setSettings={setSettings} 
        theme={theme} 
        canManageSolutionAnalysis={canManageSolutionAnalysis}
      />

      {/* Platform Configuration */}
      <PlatformConfigSection 
        settings={settings} 
        setSettings={setSettings} 
        theme={theme} 
      />

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
    </PageWrapper>
  );
}
