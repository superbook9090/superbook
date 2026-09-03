import { apiJson } from '@/lib/api/http';

export interface ContestPrize {
  rank: number | string;
  title: string;
  description?: string;
  rewardType?: 'trophy' | 'certificate' | 'cash' | 'points' | 'gift' | 'badge' | 'other';
  value?: string;
}

export interface ContestQuizRef {
  quiz: {
    _id: string;
    title: string;
    questionCount?: number;
    timeLimit?: number;
  };
  title?: string;
  order: number;
  weight?: number;
}

export interface ContestItem {
  _id: string;
  title: string;
  description?: string;
  instructions?: string;
  instructor?: {
    _id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  quizzes?: ContestQuizRef[];
  scheduleType: 'one_time' | 'daily' | 'weekly';
  prizes?: ContestPrize[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  computedState: 'upcoming' | 'live' | 'completed' | 'cancelled' | 'draft';
  startTime: string;
  endTime: string;
  duration: number;
  solutionsReleaseAt: string;
  maxAttempts: number;
  maxParticipants?: number | null;
  visibility: 'public' | 'organization' | 'unlisted';
  leaderboardVisibility: 'live' | 'after_end' | 'hidden';
  questionCount: number;
  totalPoints: number;
  userAttempt?: {
    _id?: string;
    status: string;
    score: number;
    percentage: number;
  } | null;
  attemptCount?: number;
  createdAt: string;
}

export interface ContestListResponse {
  contests: ContestItem[];
  stats: {
    liveCount: number;
    upcomingCount: number;
    completedCount: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ContestQuestionItem {
  _id: string;
  quizId?: string;
  quizTitle?: string;
  question: string;
  options: string[];
  points: number;
  order: number;
}

export interface ContestStartResponse {
  message: string;
  attempt: {
    _id: string;
    status: string;
    startedAt: string;
    attemptNumber: number;
  };
  questions: ContestQuestionItem[];
  timeRemaining: number;
  contest: {
    _id: string;
    title: string;
    duration: number;
    endTime: string;
    totalPoints: number;
  };
}

export interface ContestSubmitResponse {
  message: string;
  result: {
    attemptId: string;
    status: string;
    score: number;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    solutionsReleaseAt?: string;
  };
}

export interface ContestLeaderboardEntry {
  userId: string;
  name: string;
  avatar?: string;
  score: number;
  percentage: number;
  timeTaken: number;
  rank: number;
  prize?: ContestPrize;
}

export interface ContestLeaderboardResponse {
  isLocked?: boolean;
  isHidden?: boolean;
  message?: string;
  leaderboard: ContestLeaderboardEntry[];
  prizes?: ContestPrize[];
  userRank?: number | null;
  totalParticipants?: number;
  contest?: {
    _id: string;
    title: string;
    status: string;
    totalPoints: number;
  };
}

export interface ContestQuestionReview {
  quizId?: string;
  quizTitle?: string;
  questionId: string;
  prompt: string;
  options: string[];
  correctOption: number;
  points: number;
  selectedOption: number;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface ContestReviewResponse {
  isLocked: boolean;
  message?: string;
  solutionsReleaseAt?: string;
  attempt?: {
    _id: string;
    score: number;
    percentage: number;
    correctCount: number;
    totalQuestions: number;
    timeTaken: number;
    submittedAt: string;
    student?: {
      name: string;
      email?: string;
      avatar?: string;
    };
  };
  contest?: {
    _id: string;
    title: string;
    description?: string;
    solutionsReleaseAt?: string;
  };
  questionReviews?: ContestQuestionReview[];
}

export async function listContests(params?: {
  tab?: string;
  scheduleType?: string;
  instructor?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ContestListResponse> {
  const q = new URLSearchParams();
  if (params?.tab) q.set('tab', params.tab);
  if (params?.scheduleType) q.set('scheduleType', params.scheduleType);
  if (params?.instructor) q.set('instructor', params.instructor);
  if (params?.search) q.set('search', params.search);
  if (params?.page) q.set('page', String(params.page));
  if (params?.limit) q.set('limit', String(params.limit));

  const url = `/api/contests${q.toString() ? `?${q.toString()}` : ''}`;
  return apiJson<ContestListResponse>(url, { method: 'GET' });
}

export async function getContestById(id: string): Promise<{ contest: ContestItem & { questionsForEditor?: unknown[] } }> {
  return apiJson<{ contest: ContestItem & { questionsForEditor?: unknown[] } }>(`/api/contests/${id}`, {
    method: 'GET',
  });
}

export async function createContest(payload: unknown): Promise<{ message: string; contest: ContestItem }> {
  return apiJson<{ message: string; contest: ContestItem }>('/api/contests', {
    method: 'POST',
    body: payload,
  });
}

export async function updateContest(
  id: string,
  payload: unknown
): Promise<{ message: string; contest: ContestItem }> {
  return apiJson<{ message: string; contest: ContestItem }>(`/api/contests/${id}`, {
    method: 'PATCH',
    body: payload,
  });
}

export async function deleteContest(id: string): Promise<{ message: string }> {
  return apiJson<{ message: string }>(`/api/contests/${id}`, {
    method: 'DELETE',
  });
}

export async function endContest(id: string): Promise<{ message: string }> {
  return apiJson<{ message: string }>(`/api/contests/${id}/end`, {
    method: 'POST',
  });
}

export async function startContestAttempt(contestId: string): Promise<ContestStartResponse> {
  return apiJson<ContestStartResponse>(`/api/contests/${contestId}/attempts`, {
    method: 'POST',
    body: { action: 'start' },
  });
}

export async function submitContestAttempt(
  contestId: string,
  payload: {
    answers: Array<{ quizId?: string; questionId: string; selectedOption: number }>;
    timeTaken?: number;
    violationCount?: number;
  }
): Promise<ContestSubmitResponse> {
  return apiJson<ContestSubmitResponse>(`/api/contests/${contestId}/attempts`, {
    method: 'POST',
    body: {
      action: 'submit',
      ...payload,
    },
  });
}

export async function getContestLeaderboard(contestId: string): Promise<ContestLeaderboardResponse> {
  return apiJson<ContestLeaderboardResponse>(`/api/contests/${contestId}/leaderboard`, {
    method: 'GET',
  });
}

export async function getContestReview(
  contestId: string,
  studentId?: string
): Promise<ContestReviewResponse> {
  const url = `/api/contests/${contestId}/review${studentId ? `?studentId=${studentId}` : ''}`;
  return apiJson<ContestReviewResponse>(url, {
    method: 'GET',
  });
}

export async function getContestAttemptsForTeacher(
  contestId: string,
  page = 1,
  limit = 50
): Promise<{
  attempts: unknown[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  stats: {
    totalParticipants: number;
    completedCount: number;
    avgScore: number;
    highestScore: number;
    avgTimeTaken: number;
  };
}> {
  return apiJson(`/api/contests/${contestId}/attempts?page=${page}&limit=${limit}`, {
    method: 'GET',
  });
}
