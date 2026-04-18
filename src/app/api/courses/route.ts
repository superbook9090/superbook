// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Course from '@/models/Course';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';

// GET /api/courses - Get all courses (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const instructor = searchParams.get('instructor');
    const isPublished = searchParams.get('isPublished');
    const available = searchParams.get('available'); // For students to browse

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};

    // If 'available' is set, return published courses student can enroll in
    if (available === 'true' && session.user?.role === 'student') {
      query.isPublished = true;
      // Exclude courses student is already enrolled in
      const Enrollment = (await import('@/models/Enrollment')).default;
      const enrollments = await Enrollment.find({ student: session.user.id }).select('course');
      const enrolledCourseIds = enrollments.map(e => e.course.toString());
      if (enrolledCourseIds.length > 0) {
        query._id = { $nin: enrolledCourseIds };
      }
    } else {
      // Handle 'self' keyword for getting own courses
      if (instructor === 'self') {
        query.instructor = session.user.id;
      } else if (instructor) {
        query.instructor = instructor;
      }
      if (isPublished !== null) query.isPublished = isPublished === 'true';
    }

    const courses = await Course.find(query)
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ courses }, { status: 200 });
  } catch (error) {
    console.error('Error fetching courses:', error);
    const message = error instanceof Error ? error.message : 'Error fetching courses';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create new course (Teacher only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if courses feature is enabled
    const featureCheck = await requireFeature('enableCourses');
    if (featureCheck) return featureCheck;

    // Only teachers and admins can create courses
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create courses' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { title, description, price, category, thumbnail, isPublished, language } = await request.json();

    // Validation
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const courseCount = await Course.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('courses', courseCount);
      if (limitCheck) return limitCheck;
    }

    // Create course
    const course = new Course({
      title,
      description,
      instructor: session.user.id,
      price: price || 0,
      category,
      thumbnail,
      language: language || 'en',
      isPublished: isPublished || false,
    });

    await course.save();

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    const message = error instanceof Error ? error.message : 'Error creating course';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
