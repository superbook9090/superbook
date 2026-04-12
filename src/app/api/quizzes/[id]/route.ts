// src/app/api/quizzes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Course from '@/models/Course';

// PATCH /api/quizzes/[id] - Update a quiz
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await dbConnect();

    const { title, description, questions, timeLimit, isPublished } = await request.json();

    // Find quiz and verify ownership
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

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
    console.error('Error updating quiz:', error);
    const message = error instanceof Error ? error.message : 'Error updating quiz';
    return NextResponse.json({ message }, { status: 500 });
  }
}

// DELETE /api/quizzes/[id] - Delete a quiz
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    await dbConnect();

    // Find quiz and verify ownership
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return NextResponse.json({ message: 'Quiz not found' }, { status: 404 });
    }

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
    console.error('Error deleting quiz:', error);
    const message = error instanceof Error ? error.message : 'Error deleting quiz';
    return NextResponse.json({ message }, { status: 500 });
  }
}
