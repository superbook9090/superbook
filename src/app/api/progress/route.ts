// src/app/api/progress/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import '@/models/Lesson'; // Import to register Lesson model
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import Course from '@/models/Course';
import Quiz from '@/models/Quiz';

// GET /api/progress - Get progress data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student');
    const courseId = searchParams.get('course');

    // Students can only view their own progress
    // Teachers can view progress of students in their courses
    // Admins can view all
    let targetStudentId = session.user.id;

    if (studentId && (session.user.role === 'teacher' || session.user.role === 'admin')) {
      targetStudentId = studentId;
    }

    // Build query
    const query: any = { student: targetStudentId };
    if (courseId) query.course = courseId;

    // Get enrollments with course details
    const enrollments = await Enrollment.find(query)
      .populate('course', 'title description thumbnail instructor')
      .lean();

    // Get quiz attempts for each enrollment
    const progressData = await Promise.all(
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
            ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / attempts.length)
            : 0,
          highestScore: attempts.length > 0
            ? Math.max(...attempts.map((a: any) => a.score))
            : 0,
          lowestScore: attempts.length > 0
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
      completedCourses: enrollments.filter((e: any) => e.status === 'completed').length,
      inProgressCourses: enrollments.filter((e: any) => e.status === 'active').length,
      averageProgress: enrollments.length > 0
        ? Math.round(enrollments.reduce((sum: number, e: any) => sum + e.progress, 0) / enrollments.length)
        : 0,
      totalQuizzesTaken: progressData.reduce((sum: number, p: any) => sum + p.attempts.length, 0),
      overallAverageScore: progressData.length > 0
        ? Math.round(
            progressData.reduce((sum: number, p: any) => sum + p.quizStats.averageScore, 0) /
              progressData.filter((p: any) => p.quizStats.averageScore > 0).length || 1
          )
        : 0,
    };

    return NextResponse.json(
      { progress: progressData, overallStats },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching progress:', error);
    return NextResponse.json(
      { message: error.message || 'Error fetching progress' },
      { status: 500 }
    );
  }
}
