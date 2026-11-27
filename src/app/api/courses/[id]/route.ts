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
import { canManageOrgContent, validateContentAccess, type AccessUser } from '@/lib/accessControl';
import { deleteCourseRelatedData } from '@/lib/cascade/deleteRelated';
import { invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import {
  isPrivateCourse,
  isStudentEnrolled,
  resolveCourseCodeForSave,
  sanitizeCourseResponse,
} from '@/lib/courseAccess';
import { requireFeature, checkPublicCoursePermission } from '@/lib/settingsHelpers';
import { issueCertificatesForCourse } from '@/domain/learning/certificateIssuance';
import { sendCourseDeletionEmail } from '@/lib/email';
import { isAdmin } from '@/lib/roles';

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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

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

    // Require authentication for org-scoped, private, or unpublished courses
    const requiresAuth =
      Boolean(course.organizationId) || isPrivateCourse(course) || !course.isPublished;
    if (requiresAuth && !session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const instructorId =
      typeof course.instructor === 'object' && course.instructor !== null
        ? course.instructor._id?.toString()
        : course.instructor?.toString();

    let authUser: AccessUser | null = null;
    if (session?.user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const user = session.user as any;
      authUser = {
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: (user.role || 'student') as AccessUser['role'],
      };

      // Apply organization-based access control
      try {
        validateContentAccess(course.organizationId, authUser, 'course');
      } catch {
        return NextResponse.json(
          { message: 'You do not have permission to access this course' },
          { status: 403 }
        );
      }
    }

    const canManage = authUser
      ? canManageOrgContent(course.organizationId, instructorId, authUser)
      : false;

    // Only allow viewing unpublished courses for authorized managers (owner, same-org admin, superadmin)
    if (!course.isPublished && !canManage) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Restrict private (courseCode) courses for ALL non-managers unless enrolled
    if (isPrivateCourse(course) && !canManage) {
      if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const enrolled = await isStudentEnrolled(session.user.id, id);
      if (!enrolled) {
        return NextResponse.json({ message: 'Course not found' }, { status: 404 });
      }
    }

    // Apply serialization to convert ObjectIds to strings; only expose courseCode to authorized managers
    const serializedCourse = sanitizeCourseResponse(serialize(course) as Record<string, unknown>, {
      includeCourseCode: canManage,
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

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const course = await Course.findById(id);

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    // Check organization-scoped management permission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patchUser = session.user as any;
    const patchAuthUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(patchUser.id),
      organizationId: patchUser.organizationId
        ? new mongoose.Types.ObjectId(patchUser.organizationId)
        : null,
      role: (patchUser.role || 'student') as AccessUser['role'],
    };

    if (!canManageOrgContent(course.organizationId, course.instructor, patchAuthUser)) {
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

    const targetCode =
      courseCode !== undefined
        ? resolveCourseCodeForSave(courseCode, course.courseCode)
        : course.courseCode;
    const willBePublic = !targetCode || targetCode.trim() === '';

    const publicPermissionCheck = await checkPublicCoursePermission(
      session.user.id,
      session.user.role,
      willBePublic
    );
    if (publicPermissionCheck) return publicPermissionCheck;

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

    // Invalidate cache for this organization and superadmin views
    const orgId = course.organizationId?.toString() || 'public';
    await invalidatePattern(`courses:${orgId}:*`);
    await invalidatePattern(`courses:superadmin:*`);
    
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

    const { searchParams } = new URL(req.url);
    let reason = searchParams.get('reason') || '';
    if (!reason) {
      try {
        const body = await req.json();
        if (body?.reason) reason = body.reason;
      } catch {
        // no JSON body
      }
    }

    await dbConnect();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const course = await Course.findById(id).populate('instructor', 'name email');

    if (!course) {
      return NextResponse.json(
        { message: 'Course not found' },
        { status: 404 }
      );
    }

    const isUserAdmin = isAdmin(session.user.role);

    // Check organization-scoped management permission
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instructorObj = course.instructor as any;
    const instructorId =
      typeof instructorObj === 'object' && instructorObj !== null
        ? instructorObj._id?.toString()
        : String(instructorObj);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deleteUser = session.user as any;
    const deleteAuthUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(deleteUser.id),
      organizationId: deleteUser.organizationId
        ? new mongoose.Types.ObjectId(deleteUser.organizationId)
        : null,
      role: (deleteUser.role || 'student') as AccessUser['role'],
    };

    if (!canManageOrgContent(course.organizationId, instructorId, deleteAuthUser)) {
      return NextResponse.json(
        { message: 'You can only delete your own courses' },
        { status: 403 }
      );
    }

    // Require reason and email teacher when course is deleted by admin/superadmin
    if (isUserAdmin) {
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { message: 'A reason for deletion is required when deleting a course.' },
          { status: 400 }
        );
      }

      const teacherObj = course.instructor as unknown as { name?: string; email?: string } | null;
      if (teacherObj && teacherObj.email) {
        await sendCourseDeletionEmail({
          to: teacherObj.email,
          teacherName: teacherObj.name || 'Teacher',
          courseTitle: course.title,
          reason: reason.trim(),
          deletedBy: session.user.name || session.user.email || 'Administrator',
        });
      }
    }

    await deleteCourseRelatedData(id);
    await Course.findByIdAndDelete(id);

    // Invalidate cache for this organization and superadmin views
    const orgId = course.organizationId?.toString() || 'public';
    await invalidatePattern(`courses:${orgId}:*`);
    await invalidatePattern(`courses:superadmin:*`);
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
