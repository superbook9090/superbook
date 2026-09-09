'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useStartQuizAttempt, type QuizAttempt } from '@/lib/react-query/hooks';
import type { QuizStartInfo } from '@/features/quizzes/components/QuizStartConfirmModal';

export type PendingQuizStart = QuizStartInfo & { quizId: string; attemptId?: string };

export function useCourseQuizActions(attempts: QuizAttempt[] = []) {
  const router = useRouter();
  const startQuizMutation = useStartQuizAttempt();
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);
  const [confirmQuiz, setConfirmQuiz] = useState<PendingQuizStart | null>(null);

  const getQuizStatus = useCallback(
    (quizId: string) => {
      const quizAttempts = attempts.filter((a) => a.quiz._id === quizId);
      if (quizAttempts.length === 0) return { status: 'available' as const };
      const completed = quizAttempts.find((a) => a.status === 'completed');
      if (completed) return { status: 'completed' as const, attempt: completed };
      const inProgress = quizAttempts.find((a) => a.status === 'in_progress');
      if (inProgress) return { status: 'in_progress' as const, attempt: inProgress };
      return { status: 'available' as const };
    },
    [attempts]
  );

  const handleCurriculumQuizAction = useCallback(
    (quiz: { _id: string; title: string; timeLimit: number; questionCount?: number }) => {
      const statusInfo = getQuizStatus(quiz._id);
      if (statusInfo.status === 'completed' && statusInfo.attempt) {
        router.push(ROUTES.student.quizResult(statusInfo.attempt._id));
        return;
      }
      if (statusInfo.status === 'in_progress' && statusInfo.attempt) {
        setConfirmQuiz({
          quizId: quiz._id,
          title: quiz.title,
          questionCount: quiz.questionCount,
          timeLimit: quiz.timeLimit,
          mode: 'continue',
          attemptId: statusInfo.attempt._id,
        });
        return;
      }
      setConfirmQuiz({
        quizId: quiz._id,
        title: quiz.title,
        questionCount: quiz.questionCount,
        timeLimit: quiz.timeLimit,
        mode: 'start',
      });
    },
    [getQuizStatus, router]
  );

  const handleConfirmQuizAction = useCallback(async () => {
    if (!confirmQuiz) return;
    if (confirmQuiz.mode === 'continue' && confirmQuiz.attemptId) {
      const attemptId = confirmQuiz.attemptId;
      setConfirmQuiz(null);
      router.push(ROUTES.student.quizTake(attemptId));
      return;
    }
    const quizId = confirmQuiz.quizId;
    setStartingQuizId(quizId);
    try {
      const data = await startQuizMutation.mutateAsync(quizId);
      setConfirmQuiz(null);
      router.push(ROUTES.student.quizTake(data.attempt._id));
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setStartingQuizId(null);
    }
  }, [confirmQuiz, router, startQuizMutation]);

  return {
    startingQuizId,
    confirmQuiz,
    setConfirmQuiz,
    getQuizStatus,
    handleCurriculumQuizAction,
    handleConfirmQuizAction,
  };
}
