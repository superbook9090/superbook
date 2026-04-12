// src/app/api/enrollments/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

// PATCH /api/enrollments/[id] - Update enrollment progress
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { progress, status, completedLessons } = await request.json();

    const enrollment = await Enrollment.findOne({
      _id: params.id,
      student: session.user.id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Update fields
    if (progress !== undefined) enrollment.progress = Math.min(100, Math.max(0, progress));
    if (status) enrollment.status = status;
    if (completedLessons) enrollment.completedLessons = completedLessons;

    // If progress is 100%, mark as completed
    if (enrollment.progress >= 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completedAt = new Date();
    }

    await enrollment.save();

    return NextResponse.json(
      { message: 'Enrollment updated', enrollment },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating enrollment:', error);
    return NextResponse.json(
      { message: error.message || 'Error updating enrollment' },
      { status: 500 }
    );
  }
}

// DELETE /api/enrollments/[id] - Drop a course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const enrollment = await Enrollment.findOne({
      _id: params.id,
      student: session.user.id,
    });

    if (!enrollment) {
      return NextResponse.json(
        { message: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Remove student from course's enrolledStudents array
    await Course.findByIdAndUpdate(enrollment.course, {
      $pull: { enrolledStudents: session.user.id },
    });

    // Delete enrollment
    await Enrollment.findByIdAndDelete(params.id);

    return NextResponse.json(
      { message: 'Enrollment cancelled successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error deleting enrollment:', error);
    return NextResponse.json(
      { message: error.message || 'Error cancelling enrollment' },
      { status: 500 }
    );
  }
}
