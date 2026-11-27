// src/app/api/quizzes/[id]/route.ts — greenfield: questions via QuizQuestion + ?include=
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { Course } from '@/models';
import Contest from '@/models/Contest';
import Enrollment from '@/models/Enrollment';
import { updateQuizSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import mongoose from 'mongoose';
import { validateContentAccess, canManageOrgContent, type AccessUser } from '@/lib/accessControl';
import { listQuestionsForQuiz, setQuizQuestions } from '@/domain/learning/quizContent';
import { deleteQuizzesAndQuestions } from '@/lib/cascade/deleteRelated';
import { resolveQuizPlacement } from '@/lib/quiz/quizPlacement';
import { invalidatePattern } from '@/lib/redis';
import { requireFeature } from '@/lib/settingsHelpers';
import { isStaffRole } from '@/lib/roles';

function toAccessUser(user: { id: string; organizationId?: string | null; role: string }): AccessUser {
  return {
    _id: new mongoose.Types.ObjectId(user.id),
    organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
    role: user.role as AccessUser['role'],
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logContext: LogContext = { method: 'GET', path: '/api/quizzes/[id]' };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid quiz ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const quiz = (await Quiz.findById(id)
      .populate('course', 'title description')
      .populate('chapter', 'title')
      .populate('lesson', 'title')
      .lean()) as {
      _id: mongoose.Types.ObjectId;
      isPublished: boolean;
      instructor?: mongoose.Types.ObjectId;
      organizationId?: mongoose.Types.ObjectId | null;
      course?: { _id: mongoose.Types.ObjectId } | mongoose.Types.ObjectId | null;
      [key: string]: unknown;
    } | null;
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const authUser = toAccessUser(
      session.user as { id: string; organizationId?: string | null; role: string }
    );

    try {
      validateContentAccess(quiz.organizationId, authUser, 'quiz');
    } catch {
      return NextResponse.json(
        { message: 'You do not have permission to access this quiz' },
        { status: 403 }
      );
    }

    const canManage = canManageOrgContent(quiz.organizationId, quiz.instructor, authUser);

    if (!quiz.isPublished && !canManage) {
      return NextResponse.json({ message: 'Quiz not available' }, { status: 403 });
    }

    if (!canManage) {
      const blockedContest = await Contest.findOne({
        'quizzes.quiz': quiz._id,
        $or: [{ startTime: { $gt: new Date() } }, { status: 'draft' }],
      })
        .select('_id')
        .lean();
      if (blockedContest) {
        return NextResponse.json(
          { message: 'Contest quiz is not available before the contest starts' },
          { status: 403 }
        );
      }

      if (authUser.role === 'student' && quiz.course) {
        const courseId =
          typeof quiz.course === 'object' && '_id' in quiz.course ? quiz.course._id : quiz.course;
        if (courseId && mongoose.Types.ObjectId.isValid(String(courseId))) {
          const courseDoc = await Course.findById(courseId)
            .select('courseCode')
            .lean<{ courseCode?: string | null }>();
          if (courseDoc?.courseCode) {
            const enrollment = await Enrollment.findOne({
              student: session.user.id,
              course: courseId,
            }).lean();
            if (!enrollment) {
              return NextResponse.json(
                { message: 'You must be enrolled in this private course to access this quiz' },
                { status: 403 }
              );
            }
          }
        }
      }
    }

    const { searchParams } = new URL(request.url);
    const include = searchParams.get('include')?.split(',').map((s) => s.trim()) ?? [];

    const payload: Record<string, unknown> = { quiz };
    if (include.includes('questions')) {
      const rows = await listQuestionsForQuiz(quiz._id);
      payload.questions = rows.map((q) => ({
        _id: q._id,
        order: q.order,
        question: q.prompt,
        options: q.options,
        points: (q as unknown as { points?: number }).points ?? 1,
        negativePoints: (q as unknown as { negativePoints?: number }).negativePoints ?? 0,
        ...(include.includes('answers') && canManage
          ? { correctAnswer: (q as unknown as { correctOption: number }).correctOption }
          : {}),
      }));
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/quizzes/[id]', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/quizzes/[id]' };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid quiz ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!isStaffRole(session.user?.role)) {
      return NextResponse.json({ message: 'Only teachers and admins can update quizzes' }, { status: 403 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const body = await request.json();
    const validationResult = updateQuizSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid input', errors: validationResult.error.issues }, { status: 400 });
    }

    const {
      title,
      description,
      chapter,
      lesson,
      questions,
      timeLimit,
      isPublished,
      enableNegativeMarking,
      negativeMarks,
    } = validationResult.data;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const authUser = toAccessUser(
      session.user as { id: string; organizationId?: string | null; role: string }
    );

    if (!canManageOrgContent(quiz.organizationId, quiz.instructor, authUser)) {
      return NextResponse.json({ message: 'Not authorized to update this quiz' }, { status: 403 });
    }

    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (isPublished !== undefined) quiz.isPublished = isPublished;
    if (enableNegativeMarking !== undefined) quiz.enableNegativeMarking = enableNegativeMarking;
    if (negativeMarks !== undefined) quiz.negativeMarks = negativeMarks;

    if (chapter !== undefined || lesson !== undefined) {
      const nextChapter =
        chapter !== undefined
          ? chapter
          : lesson !== undefined
            ? null
            : quiz.chapter?.toString() ?? null;
      const nextLesson =
        lesson !== undefined
          ? lesson
          : chapter !== undefined
            ? null
            : quiz.lesson?.toString() ?? null;

      const placementResult = await resolveQuizPlacement(quiz.course.toString(), {
        chapter: nextChapter,
        lesson: nextLesson,
      });
      if (!placementResult.ok) {
        return NextResponse.json({ message: placementResult.message }, { status: 400 });
      }
      quiz.chapter = placementResult.chapterId;
      quiz.lesson = placementResult.lessonId;
    }

    if (questions !== undefined) {
      if (!questions.length) {
        return NextResponse.json({ message: 'At least one question is required' }, { status: 400 });
      }
      for (const q of questions) {
        if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
          return NextResponse.json(
            { message: 'Each question must have text, at least 2 options, and a correct answer' },
            { status: 400 }
          );
        }
      }

      await setQuizQuestions(
        quiz._id as mongoose.Types.ObjectId,
        questions.map((q) => ({
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          points: q.points,
          negativePoints: q.negativePoints,
        })),
        { bumpVersion: true }
      );
    }

    await quiz.save();

    const orgId = quiz.organizationId?.toString() || 'public';
    await invalidatePattern(`quizzes:${orgId}:*`);
    await invalidatePattern('quizzes:superadmin:*');

    return NextResponse.json({ message: 'Quiz updated successfully', quiz }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/quizzes/[id]', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/quizzes/[id]' };

  try {
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid quiz ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    if (!isStaffRole(session.user?.role)) {
      return NextResponse.json({ message: 'Only teachers and admins can delete quizzes' }, { status: 403 });
    }
    logContext.userId = session.user.id;

    await dbConnect();

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    const authUser = toAccessUser(
      session.user as { id: string; organizationId?: string | null; role: string }
    );

    if (!canManageOrgContent(quiz.organizationId, quiz.instructor, authUser)) {
      return NextResponse.json({ message: 'Not authorized to delete this quiz' }, { status: 403 });
    }

    await deleteQuizzesAndQuestions([quiz._id]);

    const orgId = quiz.organizationId?.toString() || 'public';
    await invalidatePattern(`quizzes:${orgId}:*`);
    await invalidatePattern('quizzes:superadmin:*');

    return NextResponse.json({ message: 'Quiz deleted successfully' }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/quizzes/[id]', logContext);
    return NextResponse.json({ message: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
