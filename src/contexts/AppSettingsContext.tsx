'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
}

interface TeacherLimits {
  courses: number;
  quizzes: number;
  blogs: number;
}

interface PlatformConfig {
  maintenanceMode: boolean;
  allowRegistration: boolean;
  defaultLanguage: 'en' | 'hi';
}

interface AppSettings {
  teacherLimits: TeacherLimits;
  featureToggles: FeatureToggles;
  platformConfig: PlatformConfig;
}

interface AppSettingsContextType {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
  isFeatureEnabled: (feature: keyof FeatureToggles) => boolean;
  canCreateContent: (type: 'courses' | 'quizzes' | 'blogs', currentCount: number) => boolean;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

const defaultSettings: AppSettings = {
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
};

export function AppSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const refetchSettings = async () => {
    setIsLoading(true);
    await fetchSettings();
  };

  useEffect(() => {
    fetchSettings();

    // Listen for settings changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'settingsTimestamp') {
        fetchSettings();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isFeatureEnabled = (feature: keyof FeatureToggles): boolean => {
    return settings?.featureToggles?.[feature] ?? true;
  };

  const canCreateContent = (type: 'courses' | 'quizzes' | 'blogs', currentCount: number): boolean => {
    const limit = settings?.teacherLimits?.[type] ?? 10;
    return currentCount < limit;
  };

  return (
    <AppSettingsContext.Provider
      value={{
        settings,
        isLoading,
        error,
        refetchSettings,
        isFeatureEnabled,
        canCreateContent,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
}

export function useFeature(feature: keyof FeatureToggles) {
  const { isFeatureEnabled } = useAppSettings();
  return isFeatureEnabled(feature);
}
