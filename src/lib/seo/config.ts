/** Site-wide SEO configuration and education-domain keywords. */

export const SITE_NAME = 'Quiz-Do';
export const SITE_NAME_FULL = 'Quiz-Do — Learning Management System';

/** Primary education / EdTech keywords for meta tags and structured data. */
export const EDUCATION_KEYWORDS = [
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
  'quiz platform',
  'online assessments',
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
  'Quiz-Do is a modern learning management system (LMS) for students, teachers, and schools. Create online courses, deliver quizzes, track learner progress, and manage education in one platform.';

export const DEFAULT_TITLE =
  'Quiz-Do | Online LMS for Courses, Quizzes & Student Progress';

/** Resolve canonical site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return url.replace(/\/$/, '');
}

export const TWITTER_HANDLE = '@quizdo';
