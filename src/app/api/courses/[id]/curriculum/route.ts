import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import { ensureChapterIndexes } from '@/models/Chapter';
import { createChapterSchema } from '@/lib/validation';
import { buildCurriculumTree } from '@/lib/curriculum/tree';
import { authorizeCourseEditor } from '@/lib/curriculum/authorize';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

async function fetchCurriculumTree(courseId: string) {
  const chapters = await Chapter.find({ course: courseId }).sort({ order: 1 }).lean();
  const lessons = await Lesson.find({ course: courseId })
    .sort({ order: 1 })
    .select('-content')
    .lean();

    return buildCurriculumTree(
      chapters as unknown as Parameters<typeof buildCurriculumTree>[0],
      lessons as unknown as Parameters<typeof buildCurriculumTree>[1]
    );
}

async function validateParentChapter(
  courseId: string,
  parentChapterId: string | null | undefined
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!parentChapterId) return { ok: true };

  const parent = await Chapter.findById(parentChapterId);
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
    await dbConnect();
    await ensureChapterIndexes();
    const { id } = await params;

    const tree = await fetchCurriculumTree(id);
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
