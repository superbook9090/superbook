// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import Quiz from '@/models/Quiz';
import { logApiError, type LogContext } from '@/lib/logger';

// GET /api/progress - Get progress data
export async function GET(request: NextRequest) {
  const logContext: LogContext = {
    method: 'GET',
    path: '/api/progress',
  };

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user) {
      logContext.userId = session.user.id;
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student');
    const courseId = searchParams.get('course');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    const fields = searchParams.get('fields'); // Comma-separated fields to select

    // Students can only view their own progress
    // Teachers can view progress of students in their courses
    // Admins can view all
    let targetStudentId = session.user.id;

    if (studentId && (session.user.role === 'teacher' || session.user.role === 'admin')) {
      targetStudentId = studentId;
    }

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = { student: targetStudentId };
    if (courseId) query.course = courseId;

    // Build select object for field selection
    let selectFields: Record<string, number> = {};
    if (fields) {
      const fieldList = fields.split(',');
      fieldList.forEach(f => selectFields[f] = 1);
    } else {
      // Default fields to avoid over-fetching
      selectFields = { progress: 1, status: 1, enrolledAt: 1, completedAt: 1 };
    }

    // Get enrollments with course details
    const enrollments = await Enrollment.find(query, selectFields)
      .populate('course', 'title description thumbnail instructor')
      .sort({ enrolledAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Enrollment.countDocuments(query);

    // Get quiz attempts for each enrollment
    const progressData = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      enrollments.map(async (enrollment: any) => {
        const attempts = await QuizAttempt.find({
          student: targetStudentId,
          course: enrollment.course._id,
          status: 'completed',
        })
          .populate('quiz', 'title')
          .lean();

        const quizzes = await Quiz.find({
          course: enrollment.course._id,
          isPublished: true,
        }).lean();

        // Calculate quiz stats
        const quizStats = {
          total: quizzes.length,
          completed: attempts.length,
          averageScore: attempts.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / attempts.length)
            : 0,
          highestScore: attempts.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Math.max(...attempts.map((a: any) => a.score))
            : 0,
          lowestScore: attempts.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? Math.min(...attempts.map((a: any) => a.score))
            : 0,
        };

        return {
          enrollment: {
            _id: enrollment._id,
            progress: enrollment.progress,
            status: enrollment.status,
            enrolledAt: enrollment.enrolledAt,
            completedAt: enrollment.completedAt,
          },
          course: enrollment.course,
          quizStats,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          attempts: attempts.map((a: any) => ({
            _id: a._id,
            quizTitle: a.quiz?.title || 'Unknown Quiz',
            score: a.score,
            correctCount: a.correctCount,
            totalQuestions: a.totalQuestions,
            timeTaken: a.timeTaken,
            submittedAt: a.submittedAt,
            attemptNumber: a.attemptNumber,
          })),
        };
      })
    );

    // Calculate overall stats
    const overallStats = {
      totalCourses: enrollments.length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      completedCourses: enrollments.filter((e: any) => e.status === 'completed').length,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      inProgressCourses: enrollments.filter((e: any) => e.status === 'active').length,
      averageProgress: enrollments.length > 0
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
        : 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      totalQuizzesTaken: progressData.reduce((sum: number, p: any) => sum + p.attempts.length, 0),
      overallAverageScore: progressData.length > 0
        ? Math.round(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            progressData.reduce((sum: number, p: any) => sum + p.quizStats.averageScore, 0) /
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              progressData.filter((p: any) => p.quizStats.averageScore > 0).length || 1
          )
        : 0,
    };

    return NextResponse.json(
      {
        progress: progressData,
        overallStats,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        }
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    logApiError(error as Error, 'GET', '/api/progress', logContext);
    return NextResponse.json(
      { message: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
