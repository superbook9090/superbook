'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listContests,
  getContestById,
  createContest,
  updateContest,
  deleteContest,
  endContest,
  startContestAttempt,
  submitContestAttempt,
  getContestLeaderboard,
  getContestReview,
  getContestAttemptsForTeacher,
} from '@/lib/api/contests';

export function useContests(params?: {
  tab?: string;
  scheduleType?: string;
  instructor?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['contests', params],
    queryFn: () => listContests(params),
    staleTime: 30 * 1000,
  });
}

export function useContest(id?: string) {
  return useQuery({
    queryKey: ['contest', id],
    queryFn: () => getContestById(id!),
    enabled: Boolean(id),
    staleTime: 15 * 1000,
  });
}

export function useContestLeaderboard(contestId?: string) {
  return useQuery({
    queryKey: ['contest-leaderboard', contestId],
    queryFn: () => getContestLeaderboard(contestId!),
    enabled: Boolean(contestId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.contest?.status === 'live') {
        return 10000; // Refresh live leaderboard every 10s
      }
      return false;
    },
  });
}

export function useContestReview(contestId?: string, studentId?: string) {
  return useQuery({
    queryKey: ['contest-review', contestId, studentId],
    queryFn: () => getContestReview(contestId!, studentId),
    enabled: Boolean(contestId),
  });
}

export function useContestTeacherAttempts(contestId?: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['contest-teacher-attempts', contestId, page, limit],
    queryFn: () => getContestAttemptsForTeacher(contestId!, page, limit),
    enabled: Boolean(contestId),
  });
}

export function useStartContestAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contestId: string) => startContestAttempt(contestId),
    onSuccess: (_, contestId) => {
      queryClient.invalidateQueries({ queryKey: ['contest', contestId] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useSubmitContestAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      contestId,
      answers,
      timeTaken,
      violationCount,
    }: {
      contestId: string;
      answers: Array<{ quizId?: string; questionId: string; selectedOption: number }>;
      timeTaken?: number;
      violationCount?: number;
    }) => submitContestAttempt(contestId, { answers, timeTaken, violationCount }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contest', variables.contestId] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['contest-leaderboard', variables.contestId] });
      queryClient.invalidateQueries({ queryKey: ['contest-review', variables.contestId] });
    },
  });
}

export function useCreateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: unknown) => createContest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useUpdateContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateContest(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contest', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useDeleteContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteContest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contests'] });
    },
  });
}

export function useEndContest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => endContest(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['contest', id] });
      queryClient.invalidateQueries({ queryKey: ['contests'] });
      queryClient.invalidateQueries({ queryKey: ['contest-leaderboard', id] });
    },
  });
}
