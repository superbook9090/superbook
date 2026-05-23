export type NotificationCategory = 'lessons' | 'quizzes' | 'assignments' | 'liveClasses' | 'announcements' | 'system';

export interface PushNotificationPayload {
  title: {
    en: string;
    hi?: string;
  };
  body: {
    en: string;
    hi?: string;
  };
  data?: {
    [key: string]: string;
  };
  category: NotificationCategory;
}

export const generateLessonPayload = (lessonName: string, courseName: string, lessonId: string, courseId: string): PushNotificationPayload => ({
  title: {
    en: '📚 New Lesson Available',
    hi: '📚 नया पाठ उपलब्ध है'
  },
  body: {
    en: `"${lessonName}" has been added to ${courseName}.`,
    hi: `"${lessonName}" को ${courseName} में जोड़ दिया गया है।`
  },
  data: {
    url: `quizdo://course/${courseId}/lesson/${lessonId}`,
    courseId,
    lessonId
  },
  category: 'lessons'
});

export const generateQuizPayload = (quizName: string, quizId: string): PushNotificationPayload => ({
  title: {
    en: '🧠 Quiz is now live',
    hi: '🧠 क्विज़ अब लाइव है'
  },
  body: {
    en: `A new quiz "${quizName}" is available to take.`,
    hi: `एक नया क्विज़ "${quizName}" देने के लिए उपलब्ध है।`
  },
  data: {
    url: `quizdo://quiz/${quizId}`,
    quizId
  },
  category: 'quizzes'
});

export const generateAnnouncementPayload = (courseName: string, courseId: string): PushNotificationPayload => ({
  title: {
    en: '📢 New Course Announcement',
    hi: '📢 नई कोर्स घोषणा'
  },
  body: {
    en: `There is a new announcement in ${courseName}.`,
    hi: `${courseName} में एक नई घोषणा है।`
  },
  data: {
    url: `quizdo://course/${courseId}`,
    courseId
  },
  category: 'announcements'
});
