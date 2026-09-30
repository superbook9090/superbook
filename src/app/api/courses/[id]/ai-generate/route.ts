import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { isSuperAdmin } from '@/lib/roles';
import { logApiError, logInfo } from '@/lib/logger';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import Course from '@/models/Course';
import Chapter from '@/models/Chapter';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import {
  generateLessonContent,
  generateLessonQuizQuestions,
  suggestNextChapter,
  suggestNextLesson,
  QuotaExhaustedError,
} from '@/lib/courses/courseAiGenerator';
import { UP_PET_SYLLABUS_ROADMAP } from '@/lib/courses/upPetSyllabus';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface GenerateRequestBody {
  action?: 'add-chapter' | 'add-lesson' | 'add-quiz';
  type?: 'lesson' | 'chapter'; // backward compatibility
  chapterId?: string;
  lessonId?: string;
  title?: string;
  numQuestions?: number;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext = { method: 'POST', path: '/api/courses/[id]/ai-generate' };

  try {
    // 1. Superadmin Authorization Check
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role;
    const isAuthorized = isSuperAdmin(userRole) || userRole === 'superadmin';

    if (!session?.user || !isAuthorized) {
      return NextResponse.json(
        { message: 'Forbidden: Superadmin access required.' },
        { status: 403 }
      );
    }

    const { id: courseId } = await params;
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return NextResponse.json({ message: 'Invalid course ID' }, { status: 400 });
    }

    const body = (await req.json().catch(() => ({}))) as GenerateRequestBody;
    const action = body.action || (body.type === 'lesson' ? 'add-lesson' : body.type === 'chapter' ? 'add-chapter' : null);
    const { chapterId, lessonId, title, numQuestions = 5 } = body;

    if (!action || !['add-chapter', 'add-lesson', 'add-quiz'].includes(action)) {
      return NextResponse.json(
        { message: 'Invalid action. Expected "add-chapter", "add-lesson", or "add-quiz".' },
        { status: 400 }
      );
    }

    await dbConnect();

    // 2. Fetch Course
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const instructorId = course.instructor || session.user.id;
    const isPetCourse =
      course.title.toLowerCase().includes('pet') ||
      course.title.toLowerCase().includes('upsssc');

    // =============================================================
    // ACTION 1: ADD CHAPTER USING AI
    // =============================================================
    if (action === 'add-chapter') {
      const existingChapters = await Chapter.find({ course: courseId }).sort({ order: 1 });
      const nextOrder = existingChapters.length > 0
        ? Math.max(...existingChapters.map((c) => c.order)) + 1
        : 0;

      let chapterTitle = title?.trim() || '';
      let chapterSummary = '';

      if (!chapterTitle) {
        if (isPetCourse) {
          const createdTitles = new Set(existingChapters.map((c) => c.title));
          const nextBlueprint = UP_PET_SYLLABUS_ROADMAP.find(
            (bp) => !createdTitles.has(bp.title) && !existingChapters.some((c) => c.order === bp.order)
          );
          if (nextBlueprint) {
            chapterTitle = nextBlueprint.title;
            chapterSummary = nextBlueprint.summary;
          }
        }

        if (!chapterTitle) {
          const suggestion = await suggestNextChapter({
            courseTitle: course.title,
            courseCategory: course.category,
            courseDescription: course.description,
            existingChapterTitles: existingChapters.map((c) => c.title),
            locale: course.locale || 'hi',
          });
          chapterTitle = suggestion.title;
          chapterSummary = suggestion.summary;
        }
      } else {
        chapterSummary = `${course.title} के अंतर्गत ${chapterTitle} का संपूर्ण पाठ्यक्रम।`;
      }

      const createdChapter = await Chapter.create({
        course: courseId,
        title: chapterTitle,
        summary: chapterSummary,
        order: nextOrder,
        lessonCount: 0,
      });

      await Course.findByIdAndUpdate(courseId, {
        $inc: { chapterCount: 1 },
      });

      try {
        await invalidatePattern('courses:*');
        revalidateTag('courses:public');
      } catch {
        // Redis optional
      }

      logInfo(`[AI Add Chapter] Superadmin created chapter: "${createdChapter.title}" in course: "${course.title}"`, logContext);

      return NextResponse.json({
        success: true,
        message: `Successfully added chapter "${createdChapter.title}" using course context!`,
        chapter: {
          _id: createdChapter._id,
          title: createdChapter.title,
          summary: createdChapter.summary,
          order: createdChapter.order,
          lessonCount: 0,
        },
      });
    }

    // =============================================================
    // ACTIONS 2 & 3: Require Chapter Context
    // =============================================================
    if (!chapterId || !mongoose.Types.ObjectId.isValid(chapterId)) {
      return NextResponse.json({ message: 'chapterId is required for this action.' }, { status: 400 });
    }

    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return NextResponse.json({ message: 'Chapter not found' }, { status: 404 });
    }

    const blueprintChapter = isPetCourse
      ? UP_PET_SYLLABUS_ROADMAP.find(
          (c) => c.order === chapter.order || c.title.includes(chapter.title) || chapter.title.includes(c.title)
        )
      : null;

    // =============================================================
    // ACTION 2: ADD LESSON USING AI
    // =============================================================
    if (action === 'add-lesson') {
      let targetLessonDoc = lessonId && mongoose.Types.ObjectId.isValid(lessonId)
        ? await Lesson.findById(lessonId)
        : null;

      let lessonTitle = title?.trim() || '';
      let subtopics: string[] = [];
      let examTips = '';

      if (targetLessonDoc) {
        // Regenerating or filling existing lesson
        const targetTitle = targetLessonDoc.title;
        lessonTitle = targetTitle;
        const bpLesson = blueprintChapter?.lessons.find(
          (l) => l.order === targetLessonDoc?.order || (targetTitle && (l.title.includes(targetTitle) || targetTitle.includes(l.title)))
        );
        subtopics = bpLesson?.focusSubtopics || [];
        examTips = bpLesson?.examTips || '';
      } else {
        // Creating a new lesson in this chapter
        const existingLessons = await Lesson.find({ chapter: chapterId }).sort({ order: 1 });
        const nextOrder = existingLessons.length > 0
          ? Math.max(...existingLessons.map((l) => l.order)) + 1
          : 0;

        if (!lessonTitle) {
          if (blueprintChapter) {
            const existingTitles = new Set(existingLessons.map((l) => l.title));
            const nextBpLesson = blueprintChapter.lessons.find(
              (l) => !existingTitles.has(l.title) && !existingLessons.some((el) => el.order === l.order)
            );
            if (nextBpLesson) {
              lessonTitle = nextBpLesson.title;
              subtopics = nextBpLesson.focusSubtopics || [];
              examTips = nextBpLesson.examTips || '';
            }
          }

          if (!lessonTitle) {
            const suggestion = await suggestNextLesson({
              courseTitle: course.title,
              chapterTitle: chapter.title,
              chapterSummary: chapter.summary,
              existingLessonTitles: existingLessons.map((l) => l.title),
              locale: course.locale || 'hi',
            });
            lessonTitle = suggestion.title;
          }
        }

        targetLessonDoc = await Lesson.create({
          title: lessonTitle,
          description: lessonTitle,
          course: courseId,
          chapter: chapterId,
          order: nextOrder,
          duration: 20,
          isPublished: false,
          uploadedBy: instructorId,
          uploadedAt: new Date(),
        });

        await Chapter.findByIdAndUpdate(chapterId, { $inc: { lessonCount: 1 } });
        await Course.findByIdAndUpdate(courseId, { $inc: { lessonCount: 1 } });
      }

      // Generate in-depth educational notes and 5 practice quiz questions concurrently
      const [notesResult, quizQuestions] = await Promise.all([
        generateLessonContent({
          courseTitle: course.title,
          courseCategory: course.category,
          courseDescription: course.description,
          locale: course.locale || 'hi',
          chapterTitle: chapter.title,
          lessonTitle: targetLessonDoc.title,
          subtopics,
          examTips,
        }),
        generateLessonQuizQuestions({
          courseTitle: course.title,
          courseCategory: course.category,
          locale: course.locale || 'hi',
          chapterTitle: chapter.title,
          lessonTitle: targetLessonDoc.title,
          quizTitle: `${targetLessonDoc.title} - अभ्यास प्रश्न`,
          numQuestions: 5,
        }),
      ]);

      // Save lesson content
      targetLessonDoc.content = notesResult.content;
      targetLessonDoc.description = notesResult.summary || targetLessonDoc.description;
      targetLessonDoc.isPublished = true;
      await targetLessonDoc.save();

      // Create or update linked practice quiz
      let quiz = await Quiz.findOne({ lesson: targetLessonDoc._id });
      if (!quiz) {
        quiz = await Quiz.create({
          title: `${targetLessonDoc.title} - अभ्यास प्रश्न`,
          description: `${targetLessonDoc.title} पर आधारित अभ्यास क्विज।`,
          course: courseId,
          chapter: chapter._id,
          lesson: targetLessonDoc._id,
          instructor: instructorId,
          questionCount: quizQuestions.length,
          timeLimit: Math.max(5, quizQuestions.length * 2),
          isPublished: true,
          enableNegativeMarking: true,
          negativeMarks: 0.25,
        });
      } else {
        quiz.questionCount = quizQuestions.length;
        quiz.timeLimit = Math.max(5, quizQuestions.length * 2);
        quiz.isPublished = true;
        await quiz.save();
        await QuizQuestion.deleteMany({ quiz: quiz._id });
      }

      if (quizQuestions.length > 0) {
        const questionDocs = quizQuestions.map((q, idx) => ({
          quiz: quiz._id,
          order: idx + 1,
          prompt: q.question,
          options: q.options,
          correctOption: q.correctAnswer,
          points: 1,
          negativePoints: 0.25,
        }));
        await QuizQuestion.insertMany(questionDocs);
      }

      try {
        await invalidatePattern('courses:*');
        await invalidatePattern('quizzes:*');
        revalidateTag('courses:public');
      } catch {
        // Redis optional
      }

      logInfo(`[AI Add Lesson] Superadmin added lesson: "${targetLessonDoc.title}" to chapter: "${chapter.title}"`, logContext);

      return NextResponse.json({
        success: true,
        message: `Successfully added lesson "${targetLessonDoc.title}" with notes & quiz!`,
        lesson: {
          _id: targetLessonDoc._id,
          title: targetLessonDoc.title,
          order: targetLessonDoc.order,
          duration: targetLessonDoc.duration,
        },
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          questionCount: quiz.questionCount,
        },
      });
    }

    // =============================================================
    // ACTION 3: ADD QUIZ USING AI
    // =============================================================
    if (action === 'add-quiz') {
      let linkedLesson = null;
      if (lessonId && mongoose.Types.ObjectId.isValid(lessonId)) {
        linkedLesson = await Lesson.findById(lessonId);
      }

      const quizTitle = title?.trim() || (linkedLesson
        ? `${linkedLesson.title} - अभ्यास प्रश्न`
        : `${chapter.title} - अध्याय अभ्यास क्विज`);

      const quizQuestions = await generateLessonQuizQuestions({
        courseTitle: course.title,
        courseCategory: course.category,
        locale: course.locale || 'hi',
        chapterTitle: chapter.title,
        lessonTitle: linkedLesson ? linkedLesson.title : chapter.title,
        quizTitle,
        numQuestions: Math.max(3, Math.min(15, numQuestions)),
      });

      const createdQuiz = await Quiz.create({
        title: quizTitle,
        description: `${course.title}: ${chapter.title} पर आधारित AI-जनरेटेड अभ्यास प्रश्न।`,
        course: courseId,
        chapter: chapter._id,
        lesson: linkedLesson?._id,
        instructor: instructorId,
        questionCount: quizQuestions.length,
        timeLimit: Math.max(5, quizQuestions.length * 2),
        isPublished: true,
        enableNegativeMarking: true,
        negativeMarks: 0.25,
      });

      if (quizQuestions.length > 0) {
        const questionDocs = quizQuestions.map((q, idx) => ({
          quiz: createdQuiz._id,
          order: idx + 1,
          prompt: q.question,
          options: q.options,
          correctOption: q.correctAnswer,
          points: 1,
          negativePoints: 0.25,
        }));
        await QuizQuestion.insertMany(questionDocs);
      }

      try {
        await invalidatePattern('courses:*');
        await invalidatePattern('quizzes:*');
        revalidateTag('courses:public');
      } catch {
        // Redis optional
      }

      logInfo(`[AI Add Quiz] Superadmin added quiz: "${createdQuiz.title}" with ${quizQuestions.length} questions`, logContext);

      return NextResponse.json({
        success: true,
        message: `Successfully added quiz "${createdQuiz.title}" with ${quizQuestions.length} questions!`,
        quiz: {
          _id: createdQuiz._id,
          title: createdQuiz.title,
          questionCount: createdQuiz.questionCount,
        },
      });
    }

    return NextResponse.json({ message: 'Unhandled action' }, { status: 400 });
  } catch (error) {
    if (error instanceof QuotaExhaustedError) {
      return NextResponse.json(
        {
          success: false,
          quotaLimitHit: true,
          message: error.message,
        },
        { status: 429 }
      );
    }

    logApiError(error as Error, 'POST', '/api/courses/[id]/ai-generate', logContext);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
