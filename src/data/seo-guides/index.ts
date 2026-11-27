import type { SeoToolGuide } from './types';
import {
  UPTET_GUIDE,
  CTET_GUIDE,
  PAT_GUIDE,
  GENERAL_QUIZ_GUIDE,
} from './examGuides';
import {
  AI_QUIZ_GUIDE,
  QUIZ_MAKER_GUIDE,
  EXAM_MAKER_GUIDE,
  COURSE_LMS_GUIDE,
} from './creatorGuides';

export type { SeoToolGuide, SampleQuizQuestion, GuideTable, GuideBlock } from './types';

const SLUG_TO_GUIDE: Record<string, SeoToolGuide> = {
  'uptet-quiz': UPTET_GUIDE,
  'ctet-quiz': CTET_GUIDE,
  'free-test-series-for-pat-exam-2026': PAT_GUIDE,
  quiz: GENERAL_QUIZ_GUIDE,
  quizzes: GENERAL_QUIZ_GUIDE,
  'practice-test-generator': GENERAL_QUIZ_GUIDE,
  'ai-quiz-maker-free': AI_QUIZ_GUIDE,
  'ai-quiz-generator-for-teachers': AI_QUIZ_GUIDE,
  'quiz-generator-from-pdf': AI_QUIZ_GUIDE,
  'quiz-maker-free': QUIZ_MAKER_GUIDE,
  'online-quiz-maker': QUIZ_MAKER_GUIDE,
  'mcq-generator-free': QUIZ_MAKER_GUIDE,
  'quiz-creator-for-teachers': QUIZ_MAKER_GUIDE,
  'mock-test-maker': EXAM_MAKER_GUIDE,
  'question-paper-maker': EXAM_MAKER_GUIDE,
  'online-exam-maker': EXAM_MAKER_GUIDE,
  'test-series-maker-free': EXAM_MAKER_GUIDE,
  'course-maker-free': COURSE_LMS_GUIDE,
  'ai-course-maker': COURSE_LMS_GUIDE,
  'course-builder-online': COURSE_LMS_GUIDE,
  'lms-course-creator': COURSE_LMS_GUIDE,
};

export function getSeoToolGuide(toolSlug: string): SeoToolGuide {
  return SLUG_TO_GUIDE[toolSlug] ?? QUIZ_MAKER_GUIDE;
}
