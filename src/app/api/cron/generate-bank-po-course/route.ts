import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { logApiError, logInfo } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { invalidatePattern } from '@/lib/redis';
import User from '@/models/User';
import Course, { ensureCourseIndexes } from '@/models/Course';
import Chapter, { ensureChapterIndexes } from '@/models/Chapter';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import CourseGenerationProgress from '@/models/CourseGenerationProgress';
import {
  BANK_PO_EXAM_KEY,
  BANK_PO_COURSE_TITLE,
  BANK_PO_COURSE_SLUG,
  BANK_PO_COURSE_CATEGORY,
  BANK_PO_SEO_DATA,
  BANK_PO_SYLLABUS_ROADMAP,
  BankPoChapterBlueprint,
  BankPoLessonBlueprint,
} from '@/lib/courses/bankPoSyllabus';
import {
  generateLessonContent,
  generateLessonQuizQuestions,
  QuotaExhaustedError,
} from '@/lib/courses/courseAiGenerator';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max serverless execution time (Vercel standard)

interface SingleLessonGenerationParams {
  courseId: mongoose.Types.ObjectId;
  chapterDoc: { _id: mongoose.Types.ObjectId };
  chapterBlueprint: BankPoChapterBlueprint;
  lessonBlueprint: BankPoLessonBlueprint;
  instructorId: mongoose.Types.ObjectId;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  logContext: any;
}

/**
 * Generates study notes and practice quiz concurrently using Promise.all,
 * persisting Lesson, Quiz, and QuizQuestion records cleanly and rapidly.
 */
async function generateSingleLessonDoc({
  courseId,
  chapterDoc,
  chapterBlueprint,
  lessonBlueprint,
  instructorId,
  logContext,
}: SingleLessonGenerationParams) {
  logInfo(
    `Generating Bank PO Lesson Concurrently: [Ch ${chapterBlueprint.order + 1}] "${lessonBlueprint.title}"`,
    logContext
  );

  // Run Notes Generation and Quiz Generation in parallel to avoid timeout
  const [notesResult, quizQuestions] = await Promise.all([
    generateLessonContent({
      chapterTitle: chapterBlueprint.title,
      lessonTitle: lessonBlueprint.title,
      subtopics: lessonBlueprint.focusSubtopics,
      examTips: lessonBlueprint.examTips,
      courseTitle: BANK_PO_COURSE_TITLE,
      courseCategory: BANK_PO_COURSE_CATEGORY,
      locale: 'hi',
    }),
    generateLessonQuizQuestions({
      chapterTitle: chapterBlueprint.title,
      lessonTitle: lessonBlueprint.title,
      quizTitle: lessonBlueprint.quizTitle,
      numQuestions: Math.min(5, lessonBlueprint.questionCount || 5),
      courseTitle: BANK_PO_COURSE_TITLE,
      courseCategory: BANK_PO_COURSE_CATEGORY,
      locale: 'hi',
    }),
  ]);

  // Save Lesson to MongoDB
  const createdLesson = await Lesson.create({
    title: lessonBlueprint.title,
    description: notesResult.summary,
    course: courseId,
    chapter: chapterDoc._id,
    content: notesResult.content,
    order: lessonBlueprint.order,
    duration: lessonBlueprint.durationMinutes,
    isPublished: true,
    uploadedBy: instructorId,
    uploadedAt: new Date(),
  });

  // Save Linked Practice Quiz
  const createdQuiz = await Quiz.create({
    title: lessonBlueprint.quizTitle,
    description: `${lessonBlueprint.title} पर आधारित Bank PO (IBPS/SBI) परीक्षा उपयोगी अभ्यास प्रश्न।`,
    course: courseId,
    chapter: chapterDoc._id,
    lesson: createdLesson._id,
    instructor: instructorId,
    questionCount: quizQuestions.length,
    timeLimit: Math.max(5, quizQuestions.length * 2),
    isPublished: true,
    enableNegativeMarking: true,
    negativeMarks: 0.25,
  });

  // Save Quiz Questions
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

  // Update Chapter and Course Counters
  await Chapter.findByIdAndUpdate(chapterDoc._id, { $inc: { lessonCount: 1 } });
  await Course.findByIdAndUpdate(courseId, {
    $inc: { lessonCount: 1 },
    $set: { lastPublishedLesson: createdLesson._id },
  });

  // Cache Invalidation
  try {
    await invalidatePattern('courses:*');
    await invalidatePattern('quizzes:*');
    revalidateTag('courses:public');
  } catch {
    // Redis is optional
  }

  return { createdLesson, createdQuiz };
}

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/generate-bank-po-course' };
  const startTime = Date.now();

  try {
    // 1. Authorization: Verify Vercel Cron Secret (if configured) or Admin trigger
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET;
    let authorized = false;

    if (!expectedSecret) {
      authorized = true;
    } else {
      authorized = authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
    }

    if (!authorized) {
      const session = await getServerSession(authOptions);
      if (session?.user?.role === 'admin' || session?.user?.role === 'superadmin') {
        authorized = true;
      }
    }

    if (!authorized && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Feature Toggle Guard
    const featureCheck = await requireFeature('enableBankPoCourseCron');
    if (featureCheck) return featureCheck;

    await dbConnect();
    await ensureCourseIndexes();
    await ensureChapterIndexes();

    // 3. Find Instructor (Superadmin or Admin)
    let instructor = await User.findOne({ role: 'superadmin' }).lean();
    if (!instructor) {
      instructor = await User.findOne({ role: 'admin' }).lean();
    }
    if (!instructor) {
      return NextResponse.json(
        { message: 'No superadmin or admin account found to assign course ownership' },
        { status: 400 }
      );
    }

    // 4. Ensure Course Record exists
    let course = await Course.findOne({ slug: BANK_PO_COURSE_SLUG });
    if (!course) {
      course = await Course.findOne({ title: BANK_PO_COURSE_TITLE });
    }

    if (!course) {
      course = await Course.create({
        title: BANK_PO_COURSE_TITLE,
        description:
          'बैंक पीओ 2026 (IBPS PO, SBI PO, RRB Scale-I) की संपूर्ण तैयारी हेतु विस्तृत कोर्स। इसमें Quantitative Aptitude, Reasoning Ability, English Language, Banking & Financial Awareness तथा Computer Aptitude के सभी अध्याय, परीक्षा-उपयोगी अध्ययन नोट्स, शॉर्ट ट्रिक्स एवं प्रत्येक पाठ के साथ अभ्यास क्विज शामिल हैं।',
        instructor: instructor._id,
        category: BANK_PO_COURSE_CATEGORY,
        slug: BANK_PO_COURSE_SLUG,
        metaTitle: BANK_PO_SEO_DATA.metaTitle,
        metaDescription: BANK_PO_SEO_DATA.metaDescription,
        keywords: BANK_PO_SEO_DATA.keywords,
        locale: 'hi',
        price: 0,
        isPublished: true,
        chapterCount: BANK_PO_SYLLABUS_ROADMAP.length,
        lessonCount: 0,
        enrolledCount: 0,
      });
      logInfo(`Created Bank PO Course: ${course._id}`, logContext);
    } else if (!course.metaTitle || !course.keywords?.length) {
      await Course.updateOne(
        { _id: course._id },
        {
          $set: {
            metaTitle: BANK_PO_SEO_DATA.metaTitle,
            metaDescription: BANK_PO_SEO_DATA.metaDescription,
            keywords: BANK_PO_SEO_DATA.keywords,
          },
        }
      );
    }

    const courseId = course._id;

    // 5. Ensure all Chapters exist and are ordered
    const existingChapters = await Chapter.find({ course: courseId }).sort({ order: 1 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chapterMap = new Map<number, any>();
    for (const ch of existingChapters) {
      chapterMap.set(ch.order, ch);
    }

    for (const blueprint of BANK_PO_SYLLABUS_ROADMAP) {
      if (!chapterMap.has(blueprint.order)) {
        const createdChapter = await Chapter.create({
          course: courseId,
          title: blueprint.title,
          summary: blueprint.summary,
          order: blueprint.order,
          lessonCount: 0,
        });
        chapterMap.set(blueprint.order, createdChapter);
      }
    }

    const totalLessonsInRoadmap = BANK_PO_SYLLABUS_ROADMAP.reduce(
      (acc, ch) => acc + ch.lessons.length,
      0
    );

    // 6. Load or Initialize CourseGenerationProgress
    let progress = await CourseGenerationProgress.findOne({ examKey: BANK_PO_EXAM_KEY });
    if (!progress) {
      const currentLessonCount = await Lesson.countDocuments({ course: courseId });
      progress = await CourseGenerationProgress.create({
        course: courseId,
        examKey: BANK_PO_EXAM_KEY,
        status: 'in_progress',
        currentChapterIndex: 0,
        currentLessonIndex: 0,
        totalLessonsCount: totalLessonsInRoadmap,
        completedLessonsCount: currentLessonCount,
        dailyRunLogs: [],
      });
    }

    // ---------------------------------------------------------
    // ACTION 1: Return Plan / Chapter Breakdown for Client
    // ---------------------------------------------------------
    const action = searchParams.get('action');
    if (action === 'plan' || action === 'status') {
      const createdLessons = await Lesson.find({ course: courseId }).select('chapter order').lean();
      const createdSet = new Set(
        createdLessons.map((l) => `${String(l.chapter)}:${l.order}`)
      );

      const limit = Math.min(
        20,
        Math.max(1, parseInt(searchParams.get('limit') || '12', 10))
      );

      const pendingLessons: Array<{
        chapterIndex: number;
        lessonIndex: number;
        order: number;
        title: string;
        chapterTitle: string;
      }> = [];

      const chaptersCovered = new Set<string>();

      for (const ch of BANK_PO_SYLLABUS_ROADMAP) {
        const chDoc = chapterMap.get(ch.order);
        if (!chDoc) continue;
        const missing = ch.lessons.filter(
          (l) => !createdSet.has(`${String(chDoc._id)}:${l.order}`)
        );

        for (const lesson of missing) {
          pendingLessons.push({
            chapterIndex: ch.order,
            lessonIndex: lesson.order,
            order: lesson.order,
            title: lesson.title,
            chapterTitle: ch.title,
          });
          chaptersCovered.add(ch.title);

          if (pendingLessons.length >= limit) {
            break;
          }
        }

        if (pendingLessons.length >= limit) {
          break;
        }
      }

      if (pendingLessons.length === 0) {
        return NextResponse.json({
          success: true,
          action: 'plan',
          isCourseCompleted: true,
          message: 'All chapters and lessons of Bank PO course are fully generated and published!',
          totalLessonsCount: totalLessonsInRoadmap,
          completedLessonsCount: createdLessons.length,
          percentComplete: 100,
        });
      }

      return NextResponse.json({
        success: true,
        action: 'plan',
        totalToGenerate: pendingLessons.length,
        chaptersCount: chaptersCovered.size,
        chaptersCovered: Array.from(chaptersCovered),
        pendingLessons,
        isCourseCompleted: false,
        totalLessonsInRoadmap,
        completedLessonsCount: createdLessons.length,
        percentComplete: Math.round(
          (createdLessons.length / totalLessonsInRoadmap) * 100
        ),
      });
    }

    // ---------------------------------------------------------
    // ACTION 2: Generate an Isolated Single Lesson Independently
    // ---------------------------------------------------------
    const targetChapterParam = searchParams.get('chapterIndex');
    const targetLessonParam = searchParams.get('lessonIndex');

    if (targetChapterParam !== null && targetLessonParam !== null) {
      const chIdx = parseInt(targetChapterParam, 10);
      const lesIdx = parseInt(targetLessonParam, 10);

      if (isNaN(chIdx) || isNaN(lesIdx) || !BANK_PO_SYLLABUS_ROADMAP[chIdx]) {
        return NextResponse.json(
          { message: 'Invalid chapterIndex or lessonIndex' },
          { status: 400 }
        );
      }

      const chapterBlueprint = BANK_PO_SYLLABUS_ROADMAP[chIdx];
      const lessonBlueprint = chapterBlueprint.lessons[lesIdx];
      if (!lessonBlueprint) {
        return NextResponse.json(
          { message: 'Invalid lessonIndex for specified chapter' },
          { status: 400 }
        );
      }

      const chapterDoc = chapterMap.get(chIdx);
      if (!chapterDoc) {
        return NextResponse.json(
          { message: 'Chapter document not found' },
          { status: 404 }
        );
      }

      // Check if already created (idempotent)
      const existingLesson = await Lesson.findOne({
        course: courseId,
        chapter: chapterDoc._id,
        order: lessonBlueprint.order,
      }).lean();

      if (existingLesson) {
        return NextResponse.json({
          success: true,
          message: `Lesson "${lessonBlueprint.title}" already exists.`,
          alreadyExists: true,
          lesson: {
            title: existingLesson.title,
            order: existingLesson.order,
          },
        });
      }

      // Generate the lesson content and practice quiz concurrently
      const { createdLesson } = await generateSingleLessonDoc({
        courseId,
        chapterDoc,
        chapterBlueprint,
        lessonBlueprint,
        instructorId: instructor._id,
        logContext,
      });

      // Update progress snapshot
      const currentLessonCount = await Lesson.countDocuments({ course: courseId });
      progress.completedLessonsCount = currentLessonCount;
      progress.lastRunAt = new Date();
      progress.lastError = null;

      if (currentLessonCount >= totalLessonsInRoadmap) {
        progress.status = 'completed';
        await Course.findByIdAndUpdate(courseId, {
          isCompleted: true,
          completedAt: new Date(),
        });
      }
      await progress.save();

      return NextResponse.json({
        success: true,
        message: `Successfully generated lesson "${lessonBlueprint.title}"`,
        lesson: {
          id: createdLesson._id,
          title: createdLesson.title,
          order: createdLesson.order,
        },
        durationMs: Date.now() - startTime,
      });
    }

    // ---------------------------------------------------------
    // ACTION 3: Fallback / Automated Cron Single-Step Run
    // ---------------------------------------------------------
    if (progress.status === 'completed') {
      return NextResponse.json({
        message: 'Bank PO course is already 100% completed and published.',
        progress,
      });
    }

    const createdLessons = await Lesson.find({ course: courseId }).select('chapter order').lean();
    const createdSet = new Set(
      createdLessons.map((l) => `${String(l.chapter)}:${l.order}`)
    );

    let nextToProcess: {
      chapterBlueprint: BankPoChapterBlueprint;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chapterDoc: any;
      lessonBlueprint: BankPoLessonBlueprint;
    } | null = null;

    for (const ch of BANK_PO_SYLLABUS_ROADMAP) {
      const chDoc = chapterMap.get(ch.order);
      if (!chDoc) continue;
      const missing = ch.lessons.filter(
        (l) => !createdSet.has(`${String(chDoc._id)}:${l.order}`)
      );
      if (missing.length > 0) {
        nextToProcess = {
          chapterBlueprint: ch,
          chapterDoc: chDoc,
          lessonBlueprint: missing[0],
        };
        break;
      }
    }

    if (!nextToProcess) {
      progress.status = 'completed';
      await Course.findByIdAndUpdate(courseId, {
        isCompleted: true,
        completedAt: new Date(),
      });
      await progress.save();

      return NextResponse.json({
        success: true,
        message: 'Course complete! All lessons are present.',
        progress,
      });
    }

    const { createdLesson } = await generateSingleLessonDoc({
      courseId,
      chapterDoc: nextToProcess.chapterDoc,
      chapterBlueprint: nextToProcess.chapterBlueprint,
      lessonBlueprint: nextToProcess.lessonBlueprint,
      instructorId: instructor._id,
      logContext,
    });

    const newCompletedCount = createdLessons.length + 1;
    progress.completedLessonsCount = newCompletedCount;
    progress.lastRunAt = new Date();
    progress.lastError = null;
    await progress.save();

    return NextResponse.json({
      success: true,
      message: `Generated next scheduled lesson: "${createdLesson.title}"`,
      lesson: {
        id: createdLesson._id,
        title: createdLesson.title,
        order: createdLesson.order,
      },
      progress: {
        completedLessonsCount: newCompletedCount,
        totalLessonsCount: totalLessonsInRoadmap,
        percentComplete: Math.round((newCompletedCount / totalLessonsInRoadmap) * 100),
      },
      durationMs: Date.now() - startTime,
    });
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

    logApiError(error as Error, 'GET', '/api/cron/generate-bank-po-course', logContext);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
