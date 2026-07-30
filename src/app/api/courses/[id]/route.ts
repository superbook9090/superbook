// src/app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import { updateCourseSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import mongoose from 'mongoose';
import { validateContentAccess } from '@/lib/accessControl';
import { deleteCourseRelatedData } from '@/lib/cascade/deleteRelated';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import {
  isPrivateCourse,
  isStudentEnrolled,
  resolveCourseCodeForSave,
  sanitizeCourseResponse,
} from '@/lib/courseAccess';
import { requireFeature } from '@/lib/settingsHelpers';
import { issueCertificatesForCourse } from '@/domain/learning/certificateIssuance';

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
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    await dbConnect();
    const { id } = await params;

    const course = await Course.findById(id)
      .populate('instructor', 'name email')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .lean() as any;

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);

    // Apply organization-based access control
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      validateContentAccess(
        course.organizationId,
        {
          _id: new mongoose.Types.ObjectId(user.id),
          organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
          role: user.role as 'student' | 'teacher' | 'admin',
        },
        'course'
      );
    }

    // Only allow viewing unpublished courses for owner or admin
    if (!course.isPublished) {
      if (
        !session ||
        (course.instructor._id.toString() !== session.user.id &&
          session.user.role !== 'admin' &&
          session.user.role !== 'superadmin')
      ) {
        return NextResponse.json(
          { message: 'Course not found' },
          { status: 404 }
        );
      }
    }

    const isOwner = session?.user?.id === course.instructor._id.toString();
    const isAdmin = session?.user?.role === 'admin' || session?.user?.role === 'superadmin';

    if (
      session?.user?.role === 'student' &&
      isPrivateCourse(course) &&
      !isOwner &&
      !isAdmin
    ) {
      const enrolled = await isStudentEnrolled(session.user.id, id);
      if (!enrolled) {
        return NextResponse.json({ message: 'Course not found' }, { status: 404 });
      }
    }

    // Apply serialization to convert ObjectIds to strings
    const serializedCourse = sanitizeCourseResponse(serialize(course) as Record<string, unknown>, {
      includeCourseCode: isOwner || isAdmin,
    });

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
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

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
    if (
      course.instructor.toString() !== session.user.id &&
      session.user.role !== 'admin' &&
      session.user.role !== 'superadmin'
    ) {
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

    const { title, description, price, category, thumbnail, isPublished, isCompleted, locale, courseCode } =
      validationResult.data;

    const wasCompleted = course.isCompleted === true;

    if (title) course.title = title;
    if (description) course.description = description;
    if (price !== undefined) course.price = price;
    if (category) course.category = category;
    if (thumbnail) course.thumbnail = thumbnail;
    if (typeof isPublished === 'boolean') course.isPublished = isPublished;
    if (typeof isCompleted === 'boolean') {
      course.isCompleted = isCompleted;
      course.completedAt = isCompleted ? (course.completedAt || new Date()) : null;
    }
    if (locale) course.locale = locale;
    if (courseCode !== undefined) {
      const resolvedCode = resolveCourseCodeForSave(courseCode, course.courseCode);
      if (resolvedCode === undefined) {
        course.set('courseCode', undefined);
      } else {
        course.courseCode = resolvedCode;
      }
    }

    await course.save();

    // Teacher just marked the course completed: issue certificates to every
    // student who already finished all published lessons and quizzes.
    if (!wasCompleted && course.isCompleted) {
      await issueCertificatesForCourse(id);
    }

    await course.populate('instructor', 'name email');

    // Invalidate cache for this organization
    const orgId = course.organizationId?.toString() || 'public';
    await invalidatePattern(`courses:${orgId}:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`courses:${orgId}`);

    return NextResponse.json(course);
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/courses/[id]', logContext);
    if ((error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { message: 'This course code is already in use' },
        { status: 409 }
      );
    }
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
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

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
    if (
      course.instructor.toString() !== session.user.id &&
      session.user.role !== 'admin' &&
      session.user.role !== 'superadmin'
    ) {
      return NextResponse.json(
        { message: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    await deleteCourseRelatedData(id);
    await Course.findByIdAndDelete(id);

    // Invalidate cache for this organization
    const orgId = course.organizationId?.toString() || 'public';
    await invalidatePattern(`courses:${orgId}:*`);
    await invalidatePattern(`quizzes:${orgId}:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`courses:${orgId}`);

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/courses/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
