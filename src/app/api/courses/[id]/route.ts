// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Course from '@/models/Course';
import { updateCourseSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';

// GET /api/courses/[id] - Get a single course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/courses/[id]',
  };

  try {
    await dbConnect();
    const { id } = await params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email')
      .lean() as any;

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // Only allow viewing unpublished courses for owner or admin
    if (!course.isPublished) {
      if (!session || (course.instructor._id.toString() !== session.user.id && session.user.role !== 'admin')) {
        return NextResponse.json(
          { message: 'Course not found' },
          { status: 404 }
        );
      }
    }

    // Apply serialization to convert ObjectIds to strings
    const serializedCourse = serialize(course);

    return NextResponse.json(serializedCourse);
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update a course (instructor or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/courses/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only edit your own courses' },
        { status: 403 }
      );
    }

    const body = await req.json();

    // Validate input using Zod schema
    const validationResult = updateCourseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, price, category, thumbnail, isPublished, language } = validationResult.data;

    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (thumbnail) course.thumbnail = thumbnail;
    if (typeof isPublished === 'boolean') course.isPublished = isPublished;
    if (language) course.language = language;

    await course.save();
    await course.populate('instructor', 'name email');

    return NextResponse.json(course);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/courses/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course (instructor or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/courses/[id]',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    logContext.userId = session.user.id;

    await dbConnect();
    const { id } = await params;

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check ownership or admin
    if (course.instructor.toString() !== session.user.id && session.user.role !== 'admin') {
      return NextResponse.json(
        { message: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/courses/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
