'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAlert } from '@/components/ui/AlertContainer';
import { useSettingsStore } from '@/store/useSettingsStore';
import { fetchAdminSettings, patchAdminSettings } from '@/lib/api/adminSettings';
import { ApiClientError } from '@/lib/api/http';
import { isSuperAdmin } from '@/lib/roles';
import type { AppSettings, SettingsTab, SettingsStats } from '../_components/types';

const defaultSettings: AppSettings = {
  teacherLimits: { courses: 5, quizzes: 10, blogs: 2, aiQuizGenerations: 5 },
  notesLimits: { maxPagesPerUser: 5, maxWordsPerPage: 1000 },
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
    enablePullToRefresh: true,
    enableGoogleAuthApp: true,
    enableGoogleAuthWeb: true,
    enableNotes: true,
    enableAiQuizGen: true,
  },
  platformConfig: {
    siteName: 'Quiz Do',
    siteDescription: 'Learning Management System',
    maintenanceMode: false,
    allowRegistration: true,
    allowTeacherRegistration: true,
    defaultLanguage: 'en',
  },
};

export function useAdminSettings() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { t } = useTranslation();
  const { addAlert } = useAlert();
  const { setValue } = useLocalStorage('settingsTimestamp', '');
  const fetchPublicSettings = useSettingsStore((s) => s.fetchSettings);

  const [initialSettings, setInitialSettings] = useState<AppSettings>(defaultSettings);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Confirmation modals
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  const canManageSolutionAnalysis = isSuperAdmin(session?.user?.role);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = (await fetchAdminSettings()) as AppSettings;
      const merged: AppSettings = {
        ...data,
        teacherLimits: { ...defaultSettings.teacherLimits, ...data.teacherLimits },
        notesLimits: {
          maxPagesPerUser: data.notesLimits?.maxPagesPerUser ?? defaultSettings.notesLimits?.maxPagesPerUser ?? 5,
          maxWordsPerPage: data.notesLimits?.maxWordsPerPage ?? defaultSettings.notesLimits?.maxWordsPerPage ?? 1000,
        },
        featureToggles: { ...defaultSettings.featureToggles, ...data.featureToggles },
        platformConfig: { ...defaultSettings.platformConfig, ...data.platformConfig },
      };
      setInitialSettings(merged);
      setSettings(merged);
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

  // Dirty count computation
  const pendingChangesCount = useMemo(() => {
    let count = 0;
    // Check teacher limits
    if (settings.teacherLimits.courses !== initialSettings.teacherLimits.courses) count++;
    if (settings.teacherLimits.quizzes !== initialSettings.teacherLimits.quizzes) count++;
    if (settings.teacherLimits.blogs !== initialSettings.teacherLimits.blogs) count++;
    if (settings.teacherLimits.aiQuizGenerations !== initialSettings.teacherLimits.aiQuizGenerations) count++;

    // Check notes limits
    if (settings.notesLimits?.maxPagesPerUser !== initialSettings.notesLimits?.maxPagesPerUser) count++;
    if (settings.notesLimits?.maxWordsPerPage !== initialSettings.notesLimits?.maxWordsPerPage) count++;

    // Check platform config
    if (settings.platformConfig.maintenanceMode !== initialSettings.platformConfig.maintenanceMode) count++;
    if (settings.platformConfig.allowRegistration !== initialSettings.platformConfig.allowRegistration) count++;
    if (settings.platformConfig.allowTeacherRegistration !== initialSettings.platformConfig.allowTeacherRegistration) count++;
    if (settings.platformConfig.defaultLanguage !== initialSettings.platformConfig.defaultLanguage) count++;

    // Check feature toggles
    const keys = Object.keys(settings.featureToggles) as (keyof typeof settings.featureToggles)[];
    for (const key of keys) {
      if (settings.featureToggles[key] !== initialSettings.featureToggles[key]) {
        count++;
      }
    }
    return count;
  }, [settings, initialSettings]);

  const isDirty = pendingChangesCount > 0;

  // Stats calculation
  const stats: SettingsStats = useMemo(() => {
    const toggles = Object.values(settings.featureToggles);
    const activeCount = toggles.filter(Boolean).length;
    return {
      totalFeatures: toggles.length,
      activeFeatures: activeCount,
      maintenanceMode: settings.platformConfig.maintenanceMode,
      allowRegistration: settings.platformConfig.allowRegistration,
      allowTeacherRegistration: settings.platformConfig.allowTeacherRegistration,
      defaultLanguage: settings.platformConfig.defaultLanguage,
      pendingChangesCount,
    };
  }, [settings, pendingChangesCount]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await patchAdminSettings(settings);
      setValue(new Date().toISOString());
      await fetchPublicSettings(true);
      setInitialSettings(settings);
      addAlert({ type: 'success', message: t('adminSettings.settingsSaved') });
      window.dispatchEvent(new Event('settingsUpdated'));
    } catch (err) {
      addAlert({
        type: 'error',
        message: err instanceof ApiClientError ? err.message : t('adminSettings.failedSaveSettings'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setSettings(initialSettings);
    setShowDiscardModal(false);
  };

  const handleToggleMaintenance = (targetValue: boolean) => {
    if (targetValue) {
      setShowMaintenanceModal(true);
    } else {
      setSettings((prev) => ({
        ...prev,
        platformConfig: { ...prev.platformConfig, maintenanceMode: false },
      }));
    }
  };

  const confirmEnableMaintenance = () => {
    setSettings((prev) => ({
      ...prev,
      platformConfig: { ...prev.platformConfig, maintenanceMode: true },
    }));
    setShowMaintenanceModal(false);
  };

  return {
    status,
    settings,
    setSettings,
    initialSettings,
    stats,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSaving,
    isDirty,
    pendingChangesCount,
    canManageSolutionAnalysis,
    showMaintenanceModal,
    setShowMaintenanceModal,
    showDiscardModal,
    setShowDiscardModal,
    fetchSettings,
    handleSave,
    handleDiscard,
    handleToggleMaintenance,
    confirmEnableMaintenance,
  };
}
