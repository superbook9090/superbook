import { create } from 'zustand';
import { fetchPublicSettings } from '@/lib/api/settings';

export type FeatureToggleKey =
  | 'enableBlogs'
  | 'enableQuizzes'
  | 'enableCourses'
  | 'enableAnalytics'
  | 'enableQuizSolutionAnalysis';

export type TeacherLimitKey = 'courses' | 'quizzes' | 'blogs';

export interface PublicAppSettings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
  };
  featureToggles: Record<FeatureToggleKey, boolean>;
  platformConfig: {
    maintenanceMode: boolean;
    allowRegistration: boolean;
    allowTeacherRegistration: boolean;
    defaultLanguage: 'en' | 'hi';
  };
}

export const defaultPublicAppSettings: PublicAppSettings = {
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
    enableQuizSolutionAnalysis: false,
  },
  platformConfig: {
    maintenanceMode: false,
    allowRegistration: true,
    allowTeacherRegistration: true,
    defaultLanguage: 'en',
  },
};

const CACHE_TIME = 5 * 60 * 1000;

let inflightFetch: Promise<void> | null = null;

interface SettingsState {
  settings: PublicAppSettings;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchSettings: (force?: boolean) => Promise<void>;
  setSettings: (settings: PublicAppSettings) => void;
  isFeatureEnabled: (feature: FeatureToggleKey) => boolean;
  canCreateContent: (type: TeacherLimitKey, currentCount: number) => boolean;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultPublicAppSettings,
  isLoading: true,
  error: null,
  lastFetched: null,

  fetchSettings: async (force = false) => {
    const state = get();
    const now = Date.now();

    if (
      !force &&
      state.lastFetched &&
      now - state.lastFetched < CACHE_TIME
    ) {
      set({ isLoading: false });
      return;
    }

    if (inflightFetch && !force) {
      return inflightFetch;
    }

    const hasCachedSettings = state.lastFetched != null;
    set({ isLoading: !hasCachedSettings, error: null });

    inflightFetch = (async () => {
      try {
        const data = await fetchPublicSettings<PublicAppSettings>();
        set({
          settings: {
            ...defaultPublicAppSettings,
            ...data,
            featureToggles: {
              ...defaultPublicAppSettings.featureToggles,
              ...data.featureToggles,
            },
            platformConfig: {
              ...defaultPublicAppSettings.platformConfig,
              ...data.platformConfig,
            },
          },
          error: null,
          lastFetched: Date.now(),
          isLoading: false,
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
        set({
          error: err instanceof Error ? err.message : 'Failed to fetch settings',
          isLoading: false,
        });
      } finally {
        inflightFetch = null;
      }
    })();

    return inflightFetch;
  },

  setSettings: (settings) => {
    set({ settings, lastFetched: Date.now(), isLoading: false, error: null });
  },

  isFeatureEnabled: (feature) =>
    get().settings.featureToggles[feature] ?? defaultPublicAppSettings.featureToggles[feature],

  canCreateContent: (type, currentCount) => {
    const limit = get().settings.teacherLimits[type] ?? 10;
    return currentCount < limit;
  },
}));
