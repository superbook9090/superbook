export type SettingsTab = 'all' | 'features' | 'teacher_limits' | 'notes_limits' | 'platform';

export interface AppSettings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
    aiQuizGenerations: number;
  };
  notesLimits?: {
    maxPagesPerUser: number;
    maxWordsPerPage: number;
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
    enablePullToRefresh?: boolean;
    enableGoogleAuthApp?: boolean;
    enableGoogleAuthWeb?: boolean;
    enableNotes?: boolean;
    enableAiQuizGen?: boolean;
  };
  platformConfig: {
    siteName?: string;
    siteDescription?: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    allowTeacherRegistration: boolean;
    defaultLanguage: 'en' | 'hi';
  };
}

export interface SettingsStats {
  totalFeatures: number;
  activeFeatures: number;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  allowTeacherRegistration: boolean;
  defaultLanguage: 'en' | 'hi';
  pendingChangesCount: number;
}

