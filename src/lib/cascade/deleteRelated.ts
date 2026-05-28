import type { Types } from 'mongoose';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import QuizAttempt from '@/models/QuizAttempt';
import Lesson from '@/models/Lesson';
import Chapter from '@/models/Chapter';
import LessonCompletion from '@/models/LessonCompletion';
import VideoProgress from '@/models/VideoProgress';
import Enrollment from '@/models/Enrollment';
import CourseBookmark from '@/models/CourseBookmark';

type Id = Types.ObjectId | string;

async function getQuizIds(filter: Record<string, unknown>): Promise<Types.ObjectId[]> {
  const quizzes = await Quiz.find(filter).select('_id').lean();
  return quizzes.map((q) => q._id as Types.ObjectId);
}

/** Delete quiz attempts, questions, then quizzes. */
export async function deleteQuizzesAndQuestions(quizIds: Id[]): Promise<void> {
  if (!quizIds.length) return;
  await QuizAttempt.deleteMany({ quiz: { $in: quizIds } });
  await QuizQuestion.deleteMany({ quiz: { $in: quizIds } });
  await Quiz.deleteMany({ _id: { $in: quizIds } });
}

/** Lesson-scoped quizzes, completions, and watch progress. */
export async function deleteLessonRelatedData(lessonIds: Id[]): Promise<void> {
  if (!lessonIds.length) return;

  const quizIds = await getQuizIds({ lesson: { $in: lessonIds } });
  await deleteQuizzesAndQuestions(quizIds);

  await Promise.all([
    LessonCompletion.deleteMany({ lesson: { $in: lessonIds } }),
    VideoProgress.deleteMany({ lesson: { $in: lessonIds } }),
  ]);
}

/** Chapter/subtopic lessons + chapter-scoped quizzes. */
export async function deleteChapterRelatedData(chapterIds: Id[]): Promise<void> {
  if (!chapterIds.length) return;

  const lessons = await Lesson.find({ chapter: { $in: chapterIds } }).select('_id').lean();
  const lessonIds = lessons.map((l) => l._id as Types.ObjectId);

  await deleteLessonRelatedData(lessonIds);

  const chapterQuizIds = await getQuizIds({ chapter: { $in: chapterIds } });
  await deleteQuizzesAndQuestions(chapterQuizIds);

  await Lesson.deleteMany({ chapter: { $in: chapterIds } });
}

/** All curriculum, quiz, enrollment, and progress data for a course. */
export async function deleteCourseRelatedData(courseId: Id): Promise<void> {
  const quizIds = await getQuizIds({ course: courseId });
  await deleteQuizzesAndQuestions(quizIds);

  await Promise.all([
    LessonCompletion.deleteMany({ course: courseId }),
    VideoProgress.deleteMany({ course: courseId }),
    Enrollment.deleteMany({ course: courseId }),
    CourseBookmark.deleteMany({ course: courseId }),
    Lesson.deleteMany({ course: courseId }),
    Chapter.deleteMany({ course: courseId }),
  ]);
}
