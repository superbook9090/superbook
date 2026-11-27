import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import mongoose from 'mongoose';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import Quiz from '@/models/Quiz';
import { ensureChapterIndexes } from '@/models/Chapter';
import { createChapterSchema } from '@/lib/validation';
import { attachQuizzesToCurriculumTree, buildCurriculumTree } from '@/lib/curriculum/tree';
import { authorizeCourseEditor } from '@/lib/curriculum/authorize';
import { canManageOrgContent, validateContentAccess, type AccessUser } from '@/lib/accessControl';
import { isPrivateCourse, isStudentEnrolled } from '@/lib/courseAccess';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { requireFeature } from '@/lib/settingsHelpers';

async function fetchCurriculumTree(courseId: string, publishedOnly: boolean) {
  const lessonFilter: { course: string; isPublished?: boolean } = { course: courseId };
  const quizFilter: { course: string; isPublished?: boolean } = { course: courseId };
  if (publishedOnly) {
    lessonFilter.isPublished = true;
    quizFilter.isPublished = true;
  }

  const [chapters, lessons, quizzes] = await Promise.all([
    Chapter.find({ course: courseId }).sort({ order: 1 }).lean(),
    Lesson.find(lessonFilter)
      .sort({ order: 1 })
      .select('-content')
      .lean(),
    Quiz.find(quizFilter)
      .select('title description timeLimit questionCount isPublished course chapter lesson')
      .lean(),
  ]);

  const tree = buildCurriculumTree(
    chapters as unknown as Parameters<typeof buildCurriculumTree>[0],
    lessons as unknown as Parameters<typeof buildCurriculumTree>[1]
  );

  return attachQuizzesToCurriculumTree(
    tree,
    quizzes as unknown as Parameters<typeof attachQuizzesToCurriculumTree>[1]
  );
}

async function validateParentChapter(
  courseId: string,
  parentChapterId: string | null | undefined
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!parentChapterId) return { ok: true };

  const parent = await Chapter.findById(parentChapterId)
    .select('course parentChapter')
    .lean<{ course: { toString(): string }; parentChapter?: unknown }>();
  if (!parent || parent.course.toString() !== courseId) {
    return { ok: false, message: 'Parent topic not found' };
  }
  if (parent.parentChapter) {
    return { ok: false, message: 'Maximum nesting depth is 2 levels (topic → sub-topic)' };
  }
  return { ok: true };
}

// GET /api/courses/[id]/curriculum - Get course curriculum tree
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/courses/[id]/curriculum' };
  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const [{ id }, session] = await Promise.all([
      params,
      getServerSession(authOptions),
      dbConnect().then(() => ensureChapterIndexes()),
    ]);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const course = await Course.findById(id)
      .select('organizationId isPublished courseCode instructor')
      .lean<{
        organizationId?: mongoose.Types.ObjectId | null;
        isPublished?: boolean;
        courseCode?: string | null;
        instructor?: mongoose.Types.ObjectId | string;
      }>();

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const requiresAuth =
      Boolean(course.organizationId) || isPrivateCourse(course) || !course.isPublished;
    if (requiresAuth && !session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let authUser: AccessUser | null = null;
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      authUser = {
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId
          ? new mongoose.Types.ObjectId(user.organizationId)
          : null,
        role: (user.role || 'student') as AccessUser['role'],
      };

      try {
        validateContentAccess(course.organizationId, authUser, 'course');
      } catch {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const canManage = authUser
      ? canManageOrgContent(course.organizationId, course.instructor, authUser)
      : false;

    if (!course.isPublished && !canManage) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    if (isPrivateCourse(course) && !canManage) {
      if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const enrolled = await isStudentEnrolled(session.user.id, id);
      if (!enrolled) {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
    }

    const publishedOnly = !canManage;

    const tree = await fetchCurriculumTree(id, publishedOnly);
    return NextResponse.json(serialize(tree));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]/curriculum', logContext);
    return NextResponse.json({ message: 'Error fetching curriculum' }, { status: 500 });
  }
}

// POST /api/courses/[id]/curriculum - Create a topic or sub-topic
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/courses/[id]/curriculum' };
  try {
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    await dbConnect();
    await ensureChapterIndexes();
    const { id } = await params;

    const auth = await authorizeCourseEditor(session, id);
    if (!auth.ok) {
      return NextResponse.json({ message: auth.message }, { status: auth.status });
    }

    const body = await req.json();
    const validation = createChapterSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validation.error.issues },
        { status: 400 }
      );
    }

    const parentChapter = validation.data.parentChapter ?? null;
    const parentCheck = await validateParentChapter(id, parentChapter);
    if (!parentCheck.ok) {
      return NextResponse.json({ message: parentCheck.message }, { status: 400 });
    }

    const siblingFilter =
      parentChapter === null
        ? { course: id, $or: [{ parentChapter: null }, { parentChapter: { $exists: false } }] }
        : { course: id, parentChapter };
    const lastChapter = await Chapter.findOne(siblingFilter).sort({ order: -1 });
    const order = validation.data.order ?? (lastChapter ? lastChapter.order + 1 : 0);

    const chapter = await Chapter.create({
      title: validation.data.title,
      summary: validation.data.summary,
      parentChapter,
      course: id,
      order,
    });

    await Course.findByIdAndUpdate(id, { $inc: { chapterCount: 1 } });

    return NextResponse.json(serialize(chapter), { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses/[id]/curriculum', logContext);
    return NextResponse.json({ message: 'Error creating chapter' }, { status: 500 });
  }
}
