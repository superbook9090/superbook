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
import Certificate from '@/models/Certificate';
import Course from '@/models/Course';
import Blog from '@/models/Blog';
import FileNode from '@/models/FileNode';
import Favorite from '@/models/Favorite';
import Note from '@/models/Note';
import UserNotification from '@/models/UserNotification';
import NotificationPreference from '@/models/NotificationPreference';
import NotificationToken from '@/models/NotificationToken';
import PasswordResetToken from '@/models/PasswordResetToken';

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
    Certificate.deleteMany({ course: courseId }),
    Lesson.deleteMany({ course: courseId }),
    Chapter.deleteMany({ course: courseId }),
  ]);
}

/** All user data, including their progress, auth tokens, and authored content (courses, blogs, quizzes). */
export async function deleteUserRelatedData(userId: Id): Promise<void> {
  // 1. Delete all courses authored by this user
  const courses = await Course.find({ instructor: userId }).select('_id').lean();
  const courseIds = courses.map((c) => c._id as Types.ObjectId);
  
  for (const courseId of courseIds) {
    await deleteCourseRelatedData(courseId);
  }
  await Course.deleteMany({ instructor: userId });

  // 2. Delete all standalone quizzes authored by this user
  const quizzes = await Quiz.find({ instructor: userId }).select('_id').lean();
  const quizIds = quizzes.map((q) => q._id as Types.ObjectId);
  await deleteQuizzesAndQuestions(quizIds);

  // 3. Delete other teacher-authored content
  await Promise.all([
    Blog.deleteMany({ author: userId }),
    FileNode.deleteMany({ uploadedBy: userId }),
  ]);

  // 4. Delete all student progress, enrollments, and personal data
  await Promise.all([
    Enrollment.deleteMany({ student: userId }),
    LessonCompletion.deleteMany({ student: userId }),
    VideoProgress.deleteMany({ student: userId }),
    QuizAttempt.deleteMany({ student: userId }),
    CourseBookmark.deleteMany({ user: userId }),
    Favorite.deleteMany({ user: userId }),
    Certificate.deleteMany({ student: userId }),
    Note.deleteMany({ user: userId }),
  ]);

  // 5. Delete authentication and notification metadata
  await Promise.all([
    UserNotification.deleteMany({ userId }),
    NotificationPreference.deleteOne({ userId }),
    NotificationToken.deleteMany({ userId }),
    PasswordResetToken.deleteMany({ userId }),
  ]);
}
