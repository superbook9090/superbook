export type SettingsTab = 'all' | 'features' | 'teacher_limits' | 'notes_limits' | 'platform' | 'jobs';

export interface AppSettings {
  teacherLimits: {
    courses: number;
    quizzes: number;
    blogs: number;
    aiQuizGenerations: number;
    aiQuizMaxQuestions?: number;
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
    enableGoogleAdsense?: boolean;
    enableCourseDoubts?: boolean;
    enableContests?: boolean;
    enableContestMarketingPopup?: boolean;
    enableDownloadAppPopup?: boolean;
    enableQuizChallenges?: boolean;
    enableAutoDailyAiContestCreation?: boolean;
    enableAutoDeclareResults?: boolean;
    enableUpPetCourseCron?: boolean;
  };
  challengeConfig?: {
    allowGuestChallenges: boolean;
    guestQuestionLimit?: number;
    challengeExpiryDays: number;
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

