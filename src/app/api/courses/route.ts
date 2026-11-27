// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import mongoose from 'mongoose';
import { Course, ensureCourseIndexes } from '@/models';
import { requireFeature, checkTeacherLimit, checkPublicCoursePermission } from '@/lib/settingsHelpers';
import { createCourseSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import { serialize } from '@/lib/serialize';
import { canManageOrgContent, getAccessFilter, type AccessUser } from '@/lib/accessControl';
import { getCachedData, setCachedData, invalidatePattern } from '@/lib/redis';
import { revalidateTag } from 'next/cache';
import {
  publicCourseFilter,
  resolveCourseCodeForSave,
  sanitizeCourseResponse,
} from '@/lib/courseAccess';
import { isStaffRole } from '@/lib/roles';

// Configure Next.js caching for this route
export const dynamic = 'force-dynamic';

const ALLOWED_COURSE_FIELDS = new Set([
  '_id',
  'title',
  'description',
  'price',
  'category',
  'thumbnail',
  'instructor',
  'organizationId',
  'isPublished',
  'isCompleted',
  'locale',
  'createdAt',
  'updatedAt',
  'enrolledCount',
  'chapterCount',
  'lessonCount',
  'courseCode',
  'slug',
]);

// GET /api/courses - Get all courses (with optional filtering)
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/courses',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    logContext.userId = session.user.id;

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    const { searchParams } = new URL(request.url);
    const instructor = searchParams.get('instructor');
    const isPublished = searchParams.get('isPublished');
    const available = searchParams.get('available'); // For students to browse
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(searchParams.get('limit') || '10', 10) || 10));
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // Allowlist requested projection fields
    const requestedFields = fields
      ? Array.from(
          new Set(
            fields
              .split(',')
              .map((f) => f.trim())
              .filter((f) => ALLOWED_COURSE_FIELDS.has(f))
          )
        ).sort()
      : [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const userRole = (user.role || 'student') as AccessUser['role'];
    const authUser: AccessUser = {
      _id: new mongoose.Types.ObjectId(user.id),
      organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
      role: userRole,
    };

    // Build cache key scoped by tenant/superadmin, role, userId (when needed), and allowlisted fields
    const orgCachePrefix =
      userRole === 'superadmin'
        ? 'superadmin'
        : user.organizationId
        ? String(user.organizationId)
        : 'public';
    const userScope = available === 'true' || userRole !== 'student' ? String(user.id) : 'shared';
    const fieldsKey = requestedFields.length > 0 ? requestedFields.join(',') : 'default';
    const cacheKey = `courses:${orgCachePrefix}:${userRole}:${userScope}:${instructor || 'all'}:${isPublished || 'all'}:${available || 'false'}:${fieldsKey}:${page}:${limit}`;

    // Try cache for available/public courses
    if (available === 'true' || isPublished === 'true') {
      const cached = await getCachedData(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    await dbConnect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const andConditions: Record<string, any>[] = [];

    // Apply organization-based access control
    const accessFilter = getAccessFilter(authUser);
    if (Object.keys(accessFilter).length > 0) {
      andConditions.push(accessFilter);
    }

    if (userRole === 'student') {
      // Students can only browse published, public courses via GET /api/courses
      query.isPublished = true;
      andConditions.push(publicCourseFilter());

      if (available === 'true') {
        // Exclude courses student is already enrolled in
        const Enrollment = (await import('@/models/Enrollment')).default;
        const enrollments = await Enrollment.find({ student: session.user.id }).select('course').lean();
        const enrolledCourseIds = enrollments.map((e) => e.course.toString());
        if (enrolledCourseIds.length > 0) {
          query._id = { $nin: enrolledCourseIds };
        }
      } else if (instructor && instructor !== 'self') {
        query.instructor = instructor;
      }
    } else if (userRole === 'teacher') {
      if (instructor === 'self' || instructor === session.user.id) {
        query.instructor = session.user.id;
        if (isPublished !== null) query.isPublished = isPublished === 'true';
      } else if (instructor) {
        // Non-owner teacher browsing another instructor's courses: published & public only
        query.instructor = instructor;
        query.isPublished = true;
        andConditions.push(publicCourseFilter());
      } else {
        // Own courses (any state) OR other teachers' published public courses only
        andConditions.push({
          $or: [
            { instructor: session.user.id },
            { isPublished: true, ...publicCourseFilter() },
          ],
        });
        if (isPublished !== null) query.isPublished = isPublished === 'true';
      }
    } else {
      // Admin / Superadmin (org admin already scoped by getAccessFilter)
      if (instructor === 'self') {
        query.instructor = session.user.id;
      } else if (instructor) {
        query.instructor = instructor;
      }
      if (isPublished !== null) query.isPublished = isPublished === 'true';
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (requestedFields.length > 0) {
      requestedFields.forEach((f) => {
        selectFields[f] = 1;
      });
    } else {
      // Default fields to avoid over-fetching
      selectFields = {
        title: 1,
        description: 1,
        price: 1,
        category: 1,
        thumbnail: 1,
        instructor: 1,
        organizationId: 1,
        isPublished: 1,
        locale: 1,
        createdAt: 1,
        enrolledCount: 1,
        chapterCount: 1,
        lessonCount: 1,
        courseCode: 1,
        slug: 1,
      };
    }

    const courses = await Course.find(query, selectFields)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Apply serialization to convert ObjectIds to strings
    const serializedCourses = (serialize(courses) as Record<string, unknown>[]).map((course) => {
      const instructorId =
        typeof course.instructor === 'object' && course.instructor !== null
          ? (course.instructor as { _id?: string })._id?.toString()
          : course.instructor?.toString();
      const canManage = canManageOrgContent(
        course.organizationId as string | null | undefined,
        instructorId,
        authUser
      );
      return sanitizeCourseResponse(course, { includeCourseCode: canManage });
    });

    const total = await Course.countDocuments(query);

    const responseData = {
      courses: serializedCourses,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Cache the response for available/public courses
    if (available === 'true' || isPublished === 'true') {
      await setCachedData(cacheKey, responseData, 300); // 5 minutes
    }

    return NextResponse.json(
      responseData,
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course (Teacher only)
export async function POST(request: NextRequest) {
  const logContext: LogContext = {
    method: 'POST',
    path: '/api/courses',
  };

  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    // Only teachers and admins can create courses
    if (!isStaffRole(session.user?.role)) {
      return NextResponse.json(
        { message: 'Only teachers and admins can create courses' },
        { status: 403 }
      );
    }

    await dbConnect();
    await ensureCourseIndexes();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = createCourseSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, price, category, thumbnail, isPublished, locale, courseCode } =
      validationResult.data;

    const savedCourseCode = resolveCourseCodeForSave(courseCode);
    const isPublicCourse = !savedCourseCode;

    const publicPermissionCheck = await checkPublicCoursePermission(
      session.user.id,
      session.user.role,
      isPublicCourse
    );
    if (publicPermissionCheck) return publicPermissionCheck;

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const courseCount = await Course.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('courses', courseCount, session.user.id);
      if (limitCheck) return limitCheck;
    }

    // Get organizationId from session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    const organizationId = user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null;
    const orgId = organizationId?.toString() || 'public';

    // Create course
    const course = new Course({
      title,
      description,
      instructor: session.user.id,
      organizationId,
      price: price || 0,
      category,
      thumbnail,
      locale: locale || 'en',
      isPublished: isPublished || false,
      courseCode: savedCourseCode,
    });

    await course.save();

    // Invalidate cache for this organization and superadmin views
    await invalidatePattern(`courses:${orgId}:*`);
    await invalidatePattern(`courses:superadmin:*`);
    
    // Revalidate Next.js cache tag
    revalidateTag(`courses:${orgId}`);

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses', logContext);
    if ((error as { code?: number }).code === 11000) {
      const keyPattern = (error as { keyPattern?: Record<string, unknown> }).keyPattern ?? {};
      if ('slug' in keyPattern) {
        return NextResponse.json(
          { message: 'This course URL slug is already in use' },
          { status: 409 }
        );
      }
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
