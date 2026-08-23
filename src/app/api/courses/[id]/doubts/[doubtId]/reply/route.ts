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
import { isAdmin } from '@/lib/roles';

// PATCH /api/courses/[id]/doubts/[doubtId]/reply - Teacher replies to a doubt
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; doubtId: string }> }
) {
  const logContext: LogContext = { method: 'PATCH', path: '/api/courses/[id]/doubts/[doubtId]/reply' };

  try {
    const featureCheck = await requireFeature('enableCourseDoubts');
    if (featureCheck) return featureCheck;

    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'teacher' && !isAdmin(session.user.role))) {
      return NextResponse.json({ message: 'Only teachers and admins can reply to doubts' }, { status: 403 });
    }

    await dbConnect();
    const { id, doubtId } = await params;

    const course = await Course.findById(id).select('title instructor').lean();
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    // Check ownership
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instructorId = (course.instructor as any)._id?.toString() || course.instructor.toString();
    if (instructorId !== session.user.id && !isAdmin(session.user.role)) {
      return NextResponse.json({ message: 'Only the course instructor can reply' }, { status: 403 });
    }

    const { answer } = await req.json();

    if (!answer || answer.trim().length === 0) {
      return NextResponse.json({ message: 'Answer cannot be empty' }, { status: 400 });
    }

    const courseDoubt = await CourseDoubt.findOne({ courseId: id });
    if (!courseDoubt) {
      return NextResponse.json({ message: 'Doubt not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doubt = courseDoubt.doubts.find((d: any) => d._id.toString() === doubtId);
    if (!doubt) {
      return NextResponse.json({ message: 'Doubt not found' }, { status: 404 });
    }

    doubt.answer = answer.trim();
    doubt.status = 'answered';
    doubt.teacherId = session.user.id as any;

    await courseDoubt.save();

    // Notify student
    const studentId = doubt.studentId.toString();
    const payload = {
      title: {
        en: `Your doubt in ${course.title} was answered`,
        hi: `${course.title} में आपके संदेह का उत्तर दिया गया`,
      },
      body: {
        en: `${session.user.name || 'Your teacher'} replied: ${answer.substring(0, 100)}...`,
        hi: `${session.user.name || 'आपके शिक्षक'} ने उत्तर दिया: ${answer.substring(0, 100)}...`,
      },
      category: 'announcements' as const,
      data: { url: `/dashboard/student/courses/${id}?tab=doubts` },
    };

    await createUserNotifications([studentId], payload);
    await sendPushNotification([studentId], payload);

    return NextResponse.json({ message: 'Reply submitted successfully' });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/courses/[id]/doubts/[doubtId]/reply', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
