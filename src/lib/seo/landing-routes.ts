/** Canonical public SEO landing paths (root-level URLs for keyword targeting). */

export type SeoLandingRoute = {
  /** Public URL path, e.g. `/quiz-maker-free` */
  path: string;
  /** Key in `SEO_TOOLS_DATA` */
  toolSlug: string;
  label: string;
};

/** Primary keyword landing pages at root paths (highest SEO priority). */
export const PRIMARY_SEO_LANDINGS: SeoLandingRoute[] = [
  { path: '/quiz-maker-free', toolSlug: 'quiz-maker-free', label: 'Free Quiz Maker' },
  { path: '/course-maker-free', toolSlug: 'course-maker-free', label: 'Free Course Maker' },
  { path: '/test-series-maker-free', toolSlug: 'test-series-maker-free', label: 'Free Test Series Maker' },
  { path: '/ai-quiz-generator', toolSlug: 'ai-quiz-maker-free', label: 'AI Quiz Generator' },
  { path: '/mcq-generator', toolSlug: 'mcq-generator-free', label: 'MCQ Generator' },
  { path: '/online-exam-creator', toolSlug: 'online-exam-maker', label: 'Online Exam Creator' },
  { path: '/practice-test-generator', toolSlug: 'practice-test-generator', label: 'Practice Test Generator' },
  { path: '/quiz-creator-for-teachers', toolSlug: 'quiz-creator-for-teachers', label: 'Quiz Creator for Teachers' },
  { path: '/lms-platform', toolSlug: 'lms-course-creator', label: 'LMS Platform' },
  { path: '/online-learning-platform', toolSlug: 'course-builder-online', label: 'Online Learning Platform' },
  { path: '/uptet-quiz', toolSlug: 'uptet-quiz', label: 'UPTET Quiz' },
  { path: '/ctet-quiz', toolSlug: 'ctet-quiz', label: 'CTET Quiz' },
];

const pathToRoute = new Map(PRIMARY_SEO_LANDINGS.map((r) => [r.path, r]));
const toolSlugToPath = new Map(PRIMARY_SEO_LANDINGS.map((r) => [r.toolSlug, r.path]));

export function getSeoLandingByPath(path: string): SeoLandingRoute | undefined {
  return pathToRoute.get(path);
}

export function getCanonicalSeoPath(toolSlug: string): string | undefined {
  return toolSlugToPath.get(toolSlug);
}

export function getAllSeoLandingPaths(): string[] {
  return PRIMARY_SEO_LANDINGS.map((r) => r.path);
}
