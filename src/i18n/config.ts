export const supportedLanguages = ['en', 'hi'] as const;

export type Language = (typeof supportedLanguages)[number];

export const languageLabelKeys = {
  en: 'common.english',
  hi: 'common.hindi',
} as const;

export const blogTopicKeys = [
  'mathematics',
  'science',
  'english',
  'history',
  'geography',
  'computerScience',
  'physics',
  'chemistry',
  'biology',
  'literature',
  'other',
] as const;

export type BlogTopicKey = (typeof blogTopicKeys)[number];

export const blogTopicValues: Record<BlogTopicKey, string> = {
  mathematics: 'Mathematics',
  science: 'Science',
  english: 'English',
  history: 'History',
  geography: 'Geography',
  computerScience: 'Computer Science',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  literature: 'Literature',
  other: 'Other',
};
