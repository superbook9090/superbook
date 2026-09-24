import { ApiClientError } from '@/lib/api/http';
import type { ContestPrize } from '@/lib/api/contests';
import type { FormQuestion, ScheduleType, VisibilityType, LeaderboardVisibilityType } from './types';

export interface SubmitContestParams {
  title: string;
  description: string;
  instructions: string;
  scheduleType: ScheduleType;
  startTime: string;
  endTime: string;
  duration: string;
  solutionsReleaseAt: string;
  maxAttempts: string;
  maxParticipants: string;
  visibility: VisibilityType;
  leaderboardVisibility: LeaderboardVisibilityType;
  enableNegativeMarking: boolean;
  negativeMarks: string;
  prizes: ContestPrize[];
  questions: FormQuestion[];
  notifyAllStudents: boolean;
  isEdit: boolean;
  contestId?: string;
  canEditQuestions: boolean;
  createMutation: { mutateAsync: (data: unknown) => Promise<unknown> };
  updateMutation: { mutateAsync: (params: { id: string; data: unknown }) => Promise<unknown> };
  addAlert: (alert: { type: 'success' | 'error'; message: string }) => void;
  router: { push: (path: string) => void };
}

export async function submitContest(params: SubmitContestParams): Promise<void> {
  const {
    title, description, instructions, scheduleType, startTime, endTime, duration,
    solutionsReleaseAt, maxAttempts, maxParticipants, visibility, leaderboardVisibility,
    enableNegativeMarking, negativeMarks, prizes, questions, notifyAllStudents,
    isEdit, contestId, canEditQuestions, createMutation, updateMutation, addAlert, router,
  } = params;

  if (!title.trim()) {
    addAlert({ type: 'error', message: 'Contest title is required' });
    return;
  }
  if (!startTime || !endTime) {
    addAlert({ type: 'error', message: 'Start and End times are required' });
    return;
  }
  if (new Date(endTime) <= new Date(startTime)) {
    addAlert({ type: 'error', message: 'End time must be after start time' });
    return;
  }

  if (!isEdit || canEditQuestions) {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        addAlert({ type: 'error', message: `Question #${i + 1} prompt is required` });
        return;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j].trim()) {
          addAlert({ type: 'error', message: `Option ${j + 1} in Question #${i + 1} cannot be empty` });
          return;
        }
      }
    }
  }

  const payload = {
    title: title.trim(),
    description: description.trim() || undefined,
    instructions: instructions.trim() || undefined,
    scheduleType,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    duration: parseInt(duration, 10) || 30,
    solutionsReleaseAt: solutionsReleaseAt ? new Date(solutionsReleaseAt).toISOString() : new Date(endTime).toISOString(),
    maxAttempts: parseInt(maxAttempts, 10) || 1,
    maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
    visibility,
    leaderboardVisibility,
    enableNegativeMarking,
    negativeMarks: enableNegativeMarking ? parseFloat(negativeMarks) || 0.25 : undefined,
    prizes,
    ...((!isEdit || canEditQuestions)
      ? {
          questions: questions.map((q) => ({
            question: q.question.trim(),
            options: q.options.map((o) => o.trim()),
            correctAnswer: q.correctAnswer,
            points: q.points || 1,
            negativePoints: enableNegativeMarking
              ? q.negativePoints !== undefined
                ? q.negativePoints
                : parseFloat(negativeMarks) || 0.25
              : undefined,
          })),
        }
      : {}),
    notifyAllStudents,
  };

  try {
    if (isEdit && contestId) {
      await updateMutation.mutateAsync({ id: contestId, data: payload });
      addAlert({ type: 'success', message: 'Contest updated successfully!' });
    } else {
      await createMutation.mutateAsync(payload);
      addAlert({ type: 'success', message: 'Contest created and scheduled successfully!' });
    }
    router.push('/dashboard/teacher/contests');
  } catch (err) {
    const msg = err instanceof ApiClientError ? err.message : 'Failed to save contest';
    addAlert({ type: 'error', message: msg });
  }
}
