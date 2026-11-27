import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Lesson, Chapter } from '@/models';
import { updateLessonSchema } from '@/lib/validation';
import { deleteLessonRelatedData } from '@/lib/cascade/deleteRelated';
import { canManageOrgContent, validateContentAccess, type AccessUser } from '@/lib/accessControl';
import { isPrivateCourse, isStudentEnrolled } from '@/lib/courseAccess';
import { requireFeature } from '@/lib/settingsHelpers';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

function buildAccessUser(sessionUser: unknown): AccessUser {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = sessionUser as any;
  return {
    _id: new mongoose.Types.ObjectId(user.id),
    organizationId: user.organizationId
      ? new mongoose.Types.ObjectId(user.organizationId)
      : null,
    role: (user.role || 'student') as AccessUser['role'],
  };
}

// GET /api/lessons/[id] - Get lesson details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/lessons/[id]' };
  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const lesson = await Lesson.findById(id).lean<{
      _id: mongoose.Types.ObjectId;
      course?: mongoose.Types.ObjectId;
      chapter?: mongoose.Types.ObjectId;
      isPublished?: boolean;
    }>();
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    let courseId = lesson.course?.toString();
    if (!courseId && lesson.chapter) {
      const chapter = await Chapter.findById(lesson.chapter)
        .select('course')
        .lean<{ course?: mongoose.Types.ObjectId }>();
      courseId = chapter?.course?.toString();
    }

    if (!courseId) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const course = await Course.findById(courseId)
      .select('organizationId isPublished courseCode instructor')
      .lean<{
        _id: mongoose.Types.ObjectId;
        organizationId?: mongoose.Types.ObjectId | null;
        isPublished?: boolean;
        courseCode?: string | null;
        instructor?: mongoose.Types.ObjectId | string;
      }>();
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const authUser = buildAccessUser(session.user);
    try {
      validateContentAccess(course.organizationId, authUser, 'course');
    } catch {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const canManage = canManageOrgContent(course.organizationId, course.instructor, authUser);

    if (!canManage) {
      if (!course.isPublished || !lesson.isPublished) {
        return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
      }

      if (isPrivateCourse(course) || Boolean(course.organizationId)) {
        const enrolled = await isStudentEnrolled(session.user.id, String(course._id));
        if (!enrolled) {
          return NextResponse.json(
            { message: 'You must be enrolled in this course to access this lesson' },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.json(serialize(lesson));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error fetching lesson' }, { status: 500 });
  }
}

// PATCH /api/lessons/[id] - Update lesson
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/lessons/[id]' };
  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const course = await Course.findById(lesson.course);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    const authUser = buildAccessUser(session.user);
    if (!canManageOrgContent(course.organizationId, course.instructor, authUser)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validation = updateLessonSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });

    const previousChapterId = lesson.chapter.toString();
    const nextChapterId = validation.data.chapter;

    if (nextChapterId && nextChapterId !== previousChapterId) {
      const targetChapter = await Chapter.findOne({ _id: nextChapterId, course: lesson.course });
      if (!targetChapter) {
        return NextResponse.json({ message: 'Target topic not found' }, { status: 400 });
      }
      lesson.chapter = targetChapter._id;
    }

    const { chapter: _, ...rest } = validation.data;
    void _;
    Object.assign(lesson, rest);
    await lesson.save();

    if (nextChapterId && nextChapterId !== previousChapterId) {
      const [prevCount, nextCount] = await Promise.all([
        Lesson.countDocuments({ chapter: previousChapterId }),
        Lesson.countDocuments({ chapter: nextChapterId }),
      ]);
      await Promise.all([
        Chapter.findByIdAndUpdate(previousChapterId, { lessonCount: prevCount }),
        Chapter.findByIdAndUpdate(nextChapterId, { lessonCount: nextCount }),
      ]);
    }

    return NextResponse.json(serialize(lesson));
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error updating lesson' }, { status: 500 });
  }
}

// DELETE /api/lessons/[id] - Delete lesson
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'DELETE', path: '/api/lessons/[id]' };
  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const lesson = await Lesson.findById(id);
    if (!lesson) return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });

    const course = await Course.findById(lesson.course);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    const authUser = buildAccessUser(session.user);
    if (!canManageOrgContent(course.organizationId, course.instructor, authUser)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const chapterId = lesson.chapter;
    await deleteLessonRelatedData([id]);
    await Lesson.findByIdAndDelete(id);

    // Update counts
    await Chapter.findByIdAndUpdate(chapterId, { $inc: { lessonCount: -1 } });
    await Course.findByIdAndUpdate(course._id, { $inc: { lessonCount: -1 } });

    return NextResponse.json({ message: 'Lesson deleted' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/lessons/[id]', logContext);
    return NextResponse.json({ message: 'Error deleting lesson' }, { status: 500 });
  }
}
