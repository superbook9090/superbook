export interface CourseProgressAttempt {
  _id: string;
  quizTitle: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  submittedAt: string;
  attemptNumber: number;
}

export interface StudentCourseItem {
  enrollment: {
    _id: string;
    progress: number;
    status: string;
    enrolledAt: string;
    completedAt?: string;
    lessonCompletedCount?: number;
  };
  course: {
    _id: string;
    title: string;
    description?: string;
    thumbnail?: string;
    category?: string;
  };
  quizStats: {
    total: number;
    completed: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
  };
  attempts: CourseProgressAttempt[];
}

export interface StudentOverallStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  averageProgress: number;
  totalQuizzesTaken: number;
  overallAverageScore: number;
}

export interface TeacherCourseOption {
  _id: string;
  title: string;
  thumbnail?: string;
  category?: string;
}

export interface TeacherStudentRow {
  enrollmentId: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  progress: number;
  status: string;
  lessonCompletedCount: number;
  enrolledAt: string;
  completedAt?: string;
}

export interface TeacherOverallStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageProgress: number;
  strugglingCount: number;
  averageScore: number;
}

export interface AdminCourseHealth {
  _id: string;
  title: string;
  category: string;
  totalEnrolled: number;
  completedCount: number;
  completionRate: number;
  averageProgress: number;
}

export interface AdminOverallStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageProgress: number;
  totalQuizzesTaken: number;
  platformAverageScore: number;
  quizzesPassed: number;
}
