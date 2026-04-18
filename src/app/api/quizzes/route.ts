// src/app/api/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Quiz from '@/models/Quiz';
import Course from '@/models/Course';
import { requireFeature, checkTeacherLimit } from '@/lib/settingsHelpers';

// GET /api/quizzes - Get all quizzes (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if quizzes feature is enabled
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const course = searchParams.get('course');
    const instructor = searchParams.get('instructor');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {};
    if (course) query.course = course;
    if (instructor) query.instructor = instructor;

    const quizzes = await Quiz.find(query)
      .populate('course', 'title')
      .populate('instructor', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({ quizzes }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    const message = error instanceof Error ? error.message : 'Error fetching quizzes';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create new quiz (Teacher only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if quizzes feature is enabled
    const featureCheck = await requireFeature('enableQuizzes');
    if (featureCheck) return featureCheck;

    // Only teachers and admins can create quizzes
    if (session.user?.role !== 'teacher' && session.user?.role !== 'admin') {
      return NextResponse.json(
        { message: 'Only teachers can create quizzes' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { title, description, course, questions, timeLimit, isPublished } = await request.json();

    // Validation
    if (!title || !course) {
      return NextResponse.json(
        { message: 'Title and course are required' },
        { status: 400 }
      );
    }

    // Check teacher limits (skip for admins)
    if (session.user?.role === 'teacher') {
      const quizCount = await Quiz.countDocuments({
        instructor: session.user.id,
      });

      const limitCheck = await checkTeacherLimit('quizzes', quizCount);
      if (limitCheck) return limitCheck;
    }

    // Verify course exists and belongs to this instructor
    const courseDoc = await Course.findOne({
      _id: course,
      instructor: session.user.id,
    });

    if (!courseDoc) {
      return NextResponse.json(
        { message: 'Course not found or you are not the instructor' },
        { status: 404 }
      );
    }

    // Validate questions
    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { message: 'At least one question is required' },
        { status: 400 }
      );
    }

    for (const q of questions) {
      if (!q.question || !q.options || q.options.length < 2 || q.correctAnswer === undefined) {
        return NextResponse.json(
          { message: 'Each question must have text, at least 2 options, and a correct answer' },
          { status: 400 }
        );
      }
    }

    // Create quiz
    const quiz = new Quiz({
      title,
      description,
      course,
      instructor: session.user.id,
      questions,
      timeLimit: timeLimit || 30,
      isPublished: isPublished || false,
    });

    await quiz.save();

    return NextResponse.json(
      { message: 'Quiz created successfully', quiz },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating quiz:', error);
    const message = error instanceof Error ? error.message : 'Error creating quiz';
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
