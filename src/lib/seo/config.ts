/** Site-wide SEO configuration and education-domain keywords. */

export const SITE_NAME = 'Quiz Do';
export const SITE_NAME_FULL = 'Quiz Do — Free Online Quizzes & Learning Management System';

/** Primary education / EdTech keywords for meta tags and structured data. */
export const EDUCATION_KEYWORDS = [
  'quiz',
  'free quiz maker',
  'quiz maker',
  'quiz maker free',
  'online quiz maker',
  'quiz creator',
  'create quiz online',
  'free online quiz',
  'online quiz',
  'quiz platform',
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
  'online testing platform',
  'exam creation software',
  'test maker',
  'online assessment tool',
  'free exam builder',
  'create mock tests online',
  'MCQ generator',
  'test series platform',
  'teacher assessment tools',
  'student evaluation software',
  'custom quiz builder',
  'online exam system',
  'digital assessment platform',
] as const;

export const DEFAULT_DESCRIPTION =
  'Quiz Do is a free quiz maker online. Create quizzes, MCQ tests, mock exams, and courses for free. The online quiz maker trusted by teachers, students, and exam prep coaches in India.';

export const DEFAULT_TITLE =
  'Free Quiz Maker Online | Create Quizzes & Mock Tests — Quiz Do';

/** Resolve canonical site URL for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  return url.replace(/\/$/, '');
}

/** Search engine verification tokens (set in environment). */
export function getSearchVerificationMeta(): Record<string, string> {
  const meta: Record<string, string> = {};
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    meta['google-site-verification'] = process.env.GOOGLE_SITE_VERIFICATION;
  }
  if (process.env.BING_SITE_VERIFICATION) {
    meta['msvalidate.01'] = process.env.BING_SITE_VERIFICATION;
  }
  return meta;
}

export const TWITTER_HANDLE = '@quizdo';
