// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson';
import Course from '@/models/Course';

// GET /api/courses/[id] - Get a single course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email');

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

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { message: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update a course (instructor or admin)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    const { title, description, price, category, thumbnail, isPublished, language } = await req.json();

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
    console.error('Error updating course:', error);
    return NextResponse.json(
      { message: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/[id] - Delete a course (instructor or admin)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

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
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { message: 'Failed to delete course' },
      { status: 500 }
    );
  }
}
