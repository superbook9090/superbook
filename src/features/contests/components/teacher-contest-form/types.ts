export interface TeacherContestFormProps {
  contestId?: string;
}

export interface FormQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  points: number;
  negativePoints?: number;
}

export type ScheduleType = 'one_time' | 'daily' | 'weekly';
export type VisibilityType = 'public' | 'organization' | 'unlisted';
export type LeaderboardVisibilityType = 'live' | 'after_end' | 'hidden';
