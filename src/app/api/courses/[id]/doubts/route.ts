import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Course } from '@/models';
import CourseDoubt from '@/models/CourseDoubt';
import { logApiError, type LogContext } from '@/lib/logger';
import { requireFeature } from '@/lib/settingsHelpers';
import { createUserNotifications } from '@/lib/server/services/notifications-service';
import { sendPushNotification } from '@/lib/notifications/push/sendPushNotification';
import mongoose from 'mongoose';
import { isStudentEnrolled } from '@/lib/courseAccess';

// GET /api/courses/[id]/doubts - Get all doubts for a course
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'GET', path: '/api/courses/[id]/doubts' };

  try {
    const featureCheck = await requireFeature('enableCourseDoubts');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const course = await Course.findById(id).select('instructor').lean();

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const courseDoubt = await CourseDoubt.findOne({ courseId: id })
      .populate('doubts.studentId', 'name avatar image')
      .populate('doubts.teacherId', 'name avatar image')
      .lean();

    if (!courseDoubt) {
      return NextResponse.json({ doubts: [] });
    }

    let doubts = courseDoubt.doubts || [];

    // Filter doubts for students
    if (session.user.role === 'student') {
      doubts = doubts.filter(
        (doubt) => doubt.status === 'answered' || doubt.studentId._id.toString() === session.user.id
      );
    }

    // Sort descending by created at
    doubts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ doubts });
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/courses/[id]/doubts', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/doubts - Ask a doubt
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const logContext: LogContext = { method: 'POST', path: '/api/courses/[id]/doubts' };

  try {
    const featureCheck = await requireFeature('enableCourseDoubts');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'student') {
      return NextResponse.json({ message: 'Only students can ask doubts' }, { status: 403 });
    }

    await dbConnect();
    const { id } = await params;
    
    // Check if enrolled
    const enrolled = await isStudentEnrolled(session.user.id, id);
    if (!enrolled) {
      return NextResponse.json({ message: 'You must be enrolled to ask a doubt' }, { status: 403 });
    }

    const course = await Course.findById(id).select('title instructor').lean();
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const { question } = await req.json();

    if (!question || question.trim().length === 0) {
      return NextResponse.json({ message: 'Question cannot be empty' }, { status: 400 });
    }

    const newDoubt = {
      studentId: new mongoose.Types.ObjectId(session.user.id),
      question: question.trim(),
      status: 'pending',
    };

    let courseDoubt = await CourseDoubt.findOne({ courseId: id });
    if (!courseDoubt) {
      courseDoubt = new CourseDoubt({ courseId: id, doubts: [newDoubt as unknown as import('@/models/CourseDoubt').IDoubtQuestion] });
    } else {
      courseDoubt.doubts.push(newDoubt as unknown as import('@/models/CourseDoubt').IDoubtQuestion);
    }

    await courseDoubt.save();

    // Send notification to teacher
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instructorId = (course.instructor as any)._id?.toString() || course.instructor.toString();
    const payload = {
      title: {
        en: `New doubt in ${course.title}`,
        hi: `${course.title} में नया संदेह`,
      },
      body: {
        en: `${session.user.name || 'A student'} asked: ${question.substring(0, 100)}...`,
        hi: `${session.user.name || 'एक छात्र'} ने पूछा: ${question.substring(0, 100)}...`,
      },
      category: 'announcements' as const, // Using announcements or system since doubt category doesn't exist
      data: { url: `/dashboard/teacher/courses/${id}?tab=doubts` },
    };

    await createUserNotifications([instructorId], payload);
    await sendPushNotification([instructorId], payload);

    return NextResponse.json({ message: 'Doubt asked successfully' });
  } catch (error) {
    logApiError(error as Error, 'POST', '/api/courses/[id]/doubts', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
