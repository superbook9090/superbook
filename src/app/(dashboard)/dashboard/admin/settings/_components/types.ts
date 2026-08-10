export interface AppSettings {
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
