// src/app/api/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import { Course } from '@/models';
import { updateQuizSchema } from '@/lib/validation';
import { logApiError, type LogContext } from '@/lib/logger';
import mongoose from 'mongoose';
import { validateContentAccess } from '@/lib/accessControl';

// PATCH /api/quizzes/[id] - Update a quiz
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logContext: LogContext = {
    method: 'PATCH',
    path: '/api/quizzes/[id]',
  };

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and admins can update quizzes
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Only teachers can update quizzes' }, { status: 403 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const body = await request.json();

    // Validate input using Zod schema
    const validationResult = updateQuizSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: 'Invalid input', errors: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, description, questions, timeLimit, isPublished } = validationResult.data;

    // Find quiz and verify ownership
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Apply organization-based access control
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    validateContentAccess(
      quiz.organizationId,
      {
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: user.role as 'student' | 'teacher' | 'admin',
      },
      'quiz'
    );

    // Verify the course belongs to this instructor
    const course = await Course.findOne({
      _id: quiz.course,
      instructor: session.user.id,
    });

    if (!course && session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to update this quiz' }, { status: 403 });
    }

    // Update fields
    if (title !== undefined) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions !== undefined) quiz.questions = questions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (isPublished !== undefined) quiz.isPublished = isPublished;

    await quiz.save();

    return NextResponse.json({ message: 'Quiz updated successfully', quiz }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'PATCH', '/api/quizzes/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const logContext: LogContext = {
    method: 'DELETE',
    path: '/api/quizzes/[id]',
  };

  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Only teachers and admins can delete quizzes
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Only teachers can delete quizzes' }, { status: 403 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    // Find quiz and verify ownership
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

    // Apply organization-based access control
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = session.user as any;
    validateContentAccess(
      quiz.organizationId,
      {
        _id: new mongoose.Types.ObjectId(user.id),
        organizationId: user.organizationId ? new mongoose.Types.ObjectId(user.organizationId) : null,
        role: user.role as 'student' | 'teacher' | 'admin',
      },
      'quiz'
    );

    // Verify the course belongs to this instructor
    const course = await Course.findOne({
      _id: quiz.course,
      instructor: session.user.id,
    });

    if (!course && session.user?.role !== 'admin') {
      return NextResponse.json({ message: 'Not authorized to delete this quiz' }, { status: 403 });
    }

    await Quiz.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Quiz deleted successfully' }, { status: 200 });
  } catch (error) {
    logApiError(error as Error, 'DELETE', '/api/quizzes/[id]', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
