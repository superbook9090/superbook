// src/app/api/enrollments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

// GET /api/enrollments - Get user's enrollments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');

    const query: any = { student: session.user.id };
    if (course) query.course = course;

    const enrollments = await Enrollment.find(query)
      .populate('course', 'title description thumbnail category instructor price')
      .populate('completedLessons', 'title')
      .sort({ enrolledAt: -1 });

    return NextResponse.json({ enrollments }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching enrollments' },
      { status: 500 }
    );
  }
}

// POST /api/enrollments - Enroll in a course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only students can enroll
    if (session.user?.role !== 'student') {
      return NextResponse.json(
        { message: 'Only students can enroll in courses' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { message: 'Course ID is required' },
        { status: 400 }
      );
    }

    // Verify course exists and is published
    const course = await Course.findOne({ _id: courseId, isPublished: true });
    if (!course) {
      return NextResponse.json(
        { message: 'Course not found or not published' },
        { status: 404 }
      );
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }

    // Create enrollment
    const enrollment = new Enrollment({
      student: session.user.id,
      course: courseId,
      status: 'active',
      progress: 0,
    });

    await enrollment.save();

    // Also add student to course's enrolledStudents array
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrolledStudents: session.user.id },
    });

    return NextResponse.json(
      { message: 'Enrolled successfully', enrollment },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating enrollment:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { message: 'You are already enrolled in this course' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: error.message || 'Error creating enrollment' },
      { status: 500 }
    );
  }
}
