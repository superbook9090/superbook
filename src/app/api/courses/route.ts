// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Course from '@/models/Course';

// GET /api/courses - Get all courses (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const instructor = searchParams.get('instructor');
    const isPublished = searchParams.get('isPublished');
    const available = searchParams.get('available'); // For students to browse

    const query: any = {};

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
  } catch (error: any) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching courses' },
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

    // Only teachers and admins can create courses
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create courses' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { title, description, price, category, thumbnail, isPublished } = await request.json();

    // Validation
    if (!title) {
      return NextResponse.json(
        { message: 'Title is required' },
        { status: 400 }
      );
    }

    // Create course
    const course = new Course({
      title,
      description,
      instructor: session.user.id,
      price: price || 0,
      category,
      thumbnail,
      isPublished: isPublished || false,
    });

    await course.save();

    return NextResponse.json(
      { message: 'Course created successfully', course },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { message: error.message || 'Error creating course' },
      { status: 500 }
    );
  }
}
