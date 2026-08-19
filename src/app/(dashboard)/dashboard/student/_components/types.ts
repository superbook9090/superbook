export interface EnrollmentCourse {
  _id: string;
  title: string;
  description?: string;
  category?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
}

export interface Enrollment {
  _id: string;
  course: EnrollmentCourse;
  progress: number;
  status: string;
  enrolledAt: string;
}

export interface Attempt {
  _id: string;
  quiz: { title: string };
  score: number;
  status: string;
  submittedAt?: string;
  startedAt: string;
  type?: 'quiz';
}

export interface EnrollmentActivity extends Enrollment {
  type: 'enrollment';
}

export interface AttemptActivity extends Attempt {
  type: 'quiz';
}

export type ActivityItem = EnrollmentActivity | AttemptActivity;

export interface StudentStatsData {
  enrolledCount: number;
  completedQuizzes: number;
  averageScore: number;
}
