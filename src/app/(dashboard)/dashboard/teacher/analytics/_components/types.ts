export interface CourseStat {
  _id: string;
  title: string;
  students: number;
  quizzes: number;
  attempts: number;
  averageScore: number;
  isPublished: boolean;
}

export interface TopStudent {
  name: string;
  averageScore: number;
  attempts: number;
}

export interface TeacherStats {
  courses: CourseStat[];
  overview: {
    totalCourses: number;
    totalStudents: number;
    totalQuizzes: number;
    totalAttempts: number;
    averageScore: number;
    publishedCourses: number;
  };
  topStudents: TopStudent[];
}
