import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course, Chapter, Lesson } from '@/models';
import { createChapterSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/courses/[id]/curriculum - Get course curriculum (chapters & lessons)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/courses/[id]/curriculum' };
  try {
    await dbConnect();
    const { id } = await params;

    const chapters = await Chapter.find({ course: id }).sort({ order: 1 }).lean();
    
    // For each chapter, find its lessons
    const chaptersWithLessons = await Promise.all(
      chapters.map(async (chapter) => {
        const lessons = await Lesson.find({ chapter: chapter._id })
          .sort({ order: 1 })
          .select('-content') // Exclude heavy content for listing
          .lean();
        return { ...chapter, lessons };
      })
    );

    return NextResponse.json(serialize(chaptersWithLessons));
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]/curriculum', logContext);
    return NextResponse.json({ message: 'Error fetching curriculum' }, { status: 500 });
  }
}

// POST /api/courses/[id]/curriculum - Create a new chapter
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/courses/[id]/curriculum' };
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const { id } = await params;
    const course = await Course.findById(id);
    if (!course) return NextResponse.json({ message: 'Course not found' }, { status: 404 });

    // Verify ownership
    if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const validation = createChapterSchema.safeParse(body);
    if (!validation.success) return NextResponse.json({ message: 'Invalid input', errors: validation.error.issues }, { status: 400 });

    // Determine order
    const lastChapter = await Chapter.findOne({ course: id }).sort({ order: -1 });
    const order = validation.data.order ?? (lastChapter ? lastChapter.order + 1 : 0);

    const chapter = await Chapter.create({
      ...validation.data,
      course: id,
      order,
    });

    // Update course chapter count
    await Course.findByIdAndUpdate(id, { $inc: { chapterCount: 1 } });

    return NextResponse.json(serialize(chapter), { status: 201 });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses/[id]/curriculum', logContext);
    return NextResponse.json({ message: 'Error creating chapter' }, { status: 500 });
  }
}
