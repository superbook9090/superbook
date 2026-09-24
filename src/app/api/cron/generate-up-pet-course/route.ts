import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import dbConnect from '@/lib/db';
import { logApiError, logError, logInfo } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { invalidatePattern } from '@/lib/redis';
import { sendAdminBroadcast } from '@/lib/server/services/notifications-service';
import User from '@/models/User';
import Course, { ensureCourseIndexes } from '@/models/Course';
import Chapter, { ensureChapterIndexes } from '@/models/Chapter';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import QuizQuestion from '@/models/QuizQuestion';
import CourseGenerationProgress from '@/models/CourseGenerationProgress';
import {
  UP_PET_EXAM_KEY,
  UP_PET_COURSE_TITLE,
  UP_PET_COURSE_SLUG,
  UP_PET_COURSE_CATEGORY,
  UP_PET_SYLLABUS_ROADMAP,
} from '@/lib/courses/upPetSyllabus';
import {
  generateLessonContent,
  generateLessonQuizQuestions,
  QuotaExhaustedError,
} from '@/lib/courses/courseAiGenerator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Max serverless execution time (Vercel standard)

// Max execution budget per single cron invocation (leave 12s safety cushion for DB & final response)
const MAX_RUN_TIME_MS = 46000;

export async function GET(req: NextRequest) {
  const logContext = { method: 'GET', path: '/api/cron/generate-up-pet-course' };
  const startTime = Date.now();

  try {
    // 1. Authorization: Verify Vercel Cron Secret (if configured) or Admin trigger
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET;
    if (expectedSecret) {
      const authorized =
        authHeader === `Bearer ${expectedSecret}` || querySecret === expectedSecret;
      if (!authorized && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    // 2. Feature Toggle Guard
    const featureCheck = await requireFeature('enableUpPetCourseCron');
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
    let course = await Course.findOne({ slug: UP_PET_COURSE_SLUG });
    if (!course) {
      // Check if maybe titled without slug
      course = await Course.findOne({ title: UP_PET_COURSE_TITLE });
    }

    if (!course) {
      course = await Course.create({
        title: UP_PET_COURSE_TITLE,
        description:
          'उत्तर प्रदेश प्रारंभिक अहर्ता परीक्षा (UPSSSC PET 2026) का संपूर्ण एवं नवीनतम पाठ्यक्रम आधारित कोर्स। इसमें सभी 15 विषयों के अध्याय, परीक्षा-उपयोगी अध्ययन नोट्स, विगत वर्षों के महत्वपूर्ण तथ्य एवं प्रत्येक पाठ के साथ अभ्यास क्विज शामिल हैं।',
        instructor: instructor._id,
        category: UP_PET_COURSE_CATEGORY,
        slug: UP_PET_COURSE_SLUG,
        locale: 'hi',
        price: 0,
        isPublished: true,
        chapterCount: UP_PET_SYLLABUS_ROADMAP.length,
        lessonCount: 0,
        enrolledCount: 0,
      });
      logInfo(`Created UPSSSC PET Course: ${course._id}`, logContext);
    }

    const courseId = course._id;

    // 5. Ensure all 15 Chapters exist and are ordered
    const existingChapters = await Chapter.find({ course: courseId }).sort({ order: 1 });
    const chapterMap = new Map<number, (typeof existingChapters)[0]>();
    for (const ch of existingChapters) {
      chapterMap.set(ch.order, ch);
    }

    for (const blueprint of UP_PET_SYLLABUS_ROADMAP) {
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

    // Calculate total lessons in the entire syllabus blueprint
    const totalLessonsInRoadmap = UP_PET_SYLLABUS_ROADMAP.reduce(
      (acc, ch) => acc + ch.lessons.length,
      0
    );

    // 6. Load or Initialize CourseGenerationProgress
    let progress = await CourseGenerationProgress.findOne({ examKey: UP_PET_EXAM_KEY });
    if (!progress) {
      // Count any already created lessons in case DB had partial lessons
      const currentLessonCount = await Lesson.countDocuments({ course: courseId });
      progress = await CourseGenerationProgress.create({
        course: courseId,
        examKey: UP_PET_EXAM_KEY,
        status: 'in_progress',
        currentChapterIndex: 0,
        currentLessonIndex: 0,
        totalLessonsCount: totalLessonsInRoadmap,
        completedLessonsCount: currentLessonCount,
        dailyRunLogs: [],
      });
    }

    // Check if course is already completed
    if (progress.status === 'completed') {
      return NextResponse.json({
        message: 'UPSSSC PET course is already 100% completed and published.',
        progress,
      });
    }

    // 7. Generation Loop (Processes lessons within safe execution window)
    const todayDateString = new Date().toISOString().split('T')[0];
    let lessonsCreatedThisRun = 0;
    let quotaLimitHit = false;
    let quotaMessage = '';

    while (Date.now() - startTime < MAX_RUN_TIME_MS) {
      const chapterIdx = progress.currentChapterIndex;
      if (chapterIdx >= UP_PET_SYLLABUS_ROADMAP.length) {
        // All chapters reached!
        progress.status = 'completed';
        break;
      }

      const chapterBlueprint = UP_PET_SYLLABUS_ROADMAP[chapterIdx];
      const lessonIdx = progress.currentLessonIndex;

      if (lessonIdx >= chapterBlueprint.lessons.length) {
        // Current chapter finished, advance to next chapter
        progress.currentChapterIndex += 1;
        progress.currentLessonIndex = 0;
        continue;
      }

      const lessonBlueprint = chapterBlueprint.lessons[lessonIdx];
      const chapterDoc = chapterMap.get(chapterIdx);
      if (!chapterDoc) {
        throw new Error(`Chapter doc for order ${chapterIdx} not found`);
      }

      // Check if this lesson already exists in database
      const existingLesson = await Lesson.findOne({
        course: courseId,
        chapter: chapterDoc._id,
        order: lessonBlueprint.order,
      }).lean();

      if (existingLesson) {
        // Already created, advance pointer
        progress.currentLessonIndex += 1;
        continue;
      }

      // Attempt AI Generation for Lesson & Practice Quiz
      try {
        logInfo(
          `Generating Lesson: [Ch ${chapterIdx + 1}/${UP_PET_SYLLABUS_ROADMAP.length}] "${lessonBlueprint.title}"`,
          logContext
        );

        // 1. Generate Lesson Notes
        const { content, summary } = await generateLessonContent({
          chapterTitle: chapterBlueprint.title,
          lessonTitle: lessonBlueprint.title,
          subtopics: lessonBlueprint.focusSubtopics,
          examTips: lessonBlueprint.examTips,
        });

        // 2. Generate Practice Quiz Questions
        const questions = await generateLessonQuizQuestions({
          chapterTitle: chapterBlueprint.title,
          lessonTitle: lessonBlueprint.title,
          quizTitle: lessonBlueprint.quizTitle,
          numQuestions: lessonBlueprint.questionCount,
        });

        // 3. Save Lesson to MongoDB
        const createdLesson = await Lesson.create({
          title: lessonBlueprint.title,
          description: summary,
          course: courseId,
          chapter: chapterDoc._id,
          content,
          order: lessonBlueprint.order,
          duration: lessonBlueprint.durationMinutes,
          isPublished: true,
          uploadedBy: instructor._id,
          uploadedAt: new Date(),
        });

        // 4. Save Linked Practice Quiz
        const createdQuiz = await Quiz.create({
          title: lessonBlueprint.quizTitle,
          description: `${lessonBlueprint.title} पर आधारित UPSSSC PET परीक्षा उपयोगी अभ्यास प्रश्न।`,
          course: courseId,
          chapter: chapterDoc._id,
          lesson: createdLesson._id,
          instructor: instructor._id,
          questionCount: questions.length,
          timeLimit: Math.max(5, questions.length * 2), // 2 minutes per question
          isPublished: true,
        });

        // 5. Save Quiz Questions
        const questionDocs = questions.map((q, idx) => ({
          quiz: createdQuiz._id,
          order: idx + 1,
          prompt: q.question,
          options: q.options,
          correctOption: q.correctAnswer,
          points: 1,
        }));
        await QuizQuestion.insertMany(questionDocs);

        // 6. Update Chapter and Course Counters
        await Chapter.findByIdAndUpdate(chapterDoc._id, { $inc: { lessonCount: 1 } });
        await Course.findByIdAndUpdate(courseId, {
          $inc: { lessonCount: 1 },
          $set: { lastPublishedLesson: createdLesson._id },
        });

        // 7. Update Progress State
        lessonsCreatedThisRun += 1;
        progress.completedLessonsCount += 1;
        progress.lastRunAt = new Date();
        progress.lastError = null;
        progress.status = 'in_progress';

        // Advance to next lesson
        if (lessonIdx + 1 < chapterBlueprint.lessons.length) {
          progress.currentLessonIndex = lessonIdx + 1;
        } else {
          progress.currentChapterIndex = chapterIdx + 1;
          progress.currentLessonIndex = 0;
        }

        // Limit per run: To avoid server timeouts and maximize reliability,
        // create up to 1-2 full lessons per daily cron run.
        if (lessonsCreatedThisRun >= 1) {
          break;
        }
      } catch (genErr) {
        if (genErr instanceof QuotaExhaustedError) {
          quotaLimitHit = true;
          quotaMessage = genErr.message;
          progress.status = 'quota_exhausted';
          progress.lastError = quotaMessage;
          logError(`AI Quota reached: ${quotaMessage}. Saved checkpoint for next renewal.`, logContext);
          break;
        }

        // Check if message indicates rate limit/quota
        const errMsg = genErr instanceof Error ? genErr.message : String(genErr);
        if (
          errMsg.toLowerCase().includes('quota') ||
          errMsg.toLowerCase().includes('rate limit') ||
          errMsg.toLowerCase().includes('429') ||
          errMsg.toLowerCase().includes('402')
        ) {
          quotaLimitHit = true;
          quotaMessage = errMsg;
          progress.status = 'quota_exhausted';
          progress.lastError = quotaMessage;
          logError(`Rate limit detected: ${errMsg}. Saved checkpoint for next renewal.`, logContext);
          break;
        }

        // Other unexpected error: record and break
        progress.lastError = errMsg;
        logError(`Unexpected generation error: ${errMsg}`, logContext, { error: genErr });
        break;
      }
    }

    // Check if course has reached 100% completion
    if (progress.currentChapterIndex >= UP_PET_SYLLABUS_ROADMAP.length) {
      progress.status = 'completed';
      await Course.findByIdAndUpdate(courseId, {
        isCompleted: true,
        completedAt: new Date(),
      });

      // Broadcast completion announcement to students
      try {
        const students = await User.find({ role: 'student' }).select('_id').lean();
        const studentIds = students.map((s) => String(s._id));
        if (studentIds.length > 0) {
          await sendAdminBroadcast(studentIds, {
            title: {
              en: '🎉 UPSSSC PET Complete Course is Now Live!',
              hi: '🎉 यूपी पीईटी संपूर्ण तैयारी कोर्स अब उपलब्ध है!',
            },
            body: {
              en: 'Full 15-subject syllabus notes and practice quizzes are ready. Start learning today!',
              hi: 'सभी 15 विषयों के नोट्स और अभ्यास क्विज तैयार हैं। आज ही अपनी तैयारी शुरू करें!',
            },
            category: 'announcements',
            data: {
              url: `/courses/${UP_PET_COURSE_SLUG}`,
              courseId: String(courseId),
            },
          });
        }
      } catch (notifyErr) {
        logError('Failed to broadcast course completion notification', logContext, { error: notifyErr });
      }
    }

    // 8. Record Daily Run Log
    const runDurationMs = Date.now() - startTime;
    progress.lastRunAt = new Date();
    progress.dailyRunLogs.push({
      date: todayDateString,
      lessonsCreated: lessonsCreatedThisRun,
      status: quotaLimitHit ? 'quota_exhausted' : progress.status,
      error: quotaLimitHit ? quotaMessage : progress.lastError || undefined,
      runDurationMs,
      timestamp: new Date(),
    });

    await progress.save();

    // 9. Cache Invalidation
    try {
      await invalidatePattern('courses:*');
      await invalidatePattern('quizzes:*');
      revalidateTag('courses:public');
    } catch {
      // Redis is optional, ignore cache failures
    }

    return NextResponse.json({
      success: true,
      message: quotaLimitHit
        ? 'AI quota limit hit for today. Saved checkpoint and will automatically resume at next scheduled renewal.'
        : `Successfully processed UP PET course generator. ${lessonsCreatedThisRun} lesson(s) created.`,
      status: progress.status,
      quotaLimitHit,
      quotaMessage: quotaLimitHit ? quotaMessage : undefined,
      progress: {
        currentChapterIndex: progress.currentChapterIndex,
        currentLessonIndex: progress.currentLessonIndex,
        completedLessonsCount: progress.completedLessonsCount,
        totalLessonsCount: progress.totalLessonsCount,
        percentComplete: Math.round(
          (progress.completedLessonsCount / progress.totalLessonsCount) * 100
        ),
      },
      durationMs: runDurationMs,
    });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/cron/generate-up-pet-course', logContext);
    return NextResponse.json(
      { message: 'Internal Server Error', error: (error as Error).message },
      { status: 500 }
    );
  }
}
