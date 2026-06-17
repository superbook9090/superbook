/** Site-wide SEO configuration and education-domain keywords. */

export const SITE_NAME = 'Quiz-Do';
export const SITE_NAME_FULL = 'Quiz-Do — Free Online Quizzes & Learning Management System';

/** Primary education / EdTech keywords for meta tags and structured data. */
export const EDUCATION_KEYWORDS = [
  'free online quizzes',
  'take quizzes online',
  'quiz builder',
  'interactive quizzes',
  'practice quizzes',
  'online assessments',
  'mock tests',
  'exam preparation',
  'quiz platform',
  'online tests',
  'learning management system',
  'LMS platform',
  'online learning',
  'e-learning platform',
  'online education',
  'digital learning',
  'EdTech',
  'educational technology',
  'online courses',
  'course management',
  'student progress tracking',
  'teacher tools',
  'curriculum management',
  'blended learning',
  'distance learning',
  'virtual classroom',
  'skill development',
  'interactive learning',
  'education platform India',
  'Hindi English LMS',
] as const;

export const DEFAULT_DESCRIPTION =
  'Quiz-Do is a free online quiz platform and learning management system (LMS). Create and take interactive quizzes, build online courses, track student progress, and practice tests in Hindi & English.';

export const DEFAULT_TITLE =
  'Quiz-Do | Free Online Quizzes, Courses & Student Progress';

/** Resolve canonical site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return url.replace(/\/$/, '');
}

export const TWITTER_HANDLE = '@quizdo';
