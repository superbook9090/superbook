import { createQuiz, patchQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import { invalidateAfterQuizChange } from '@/lib/react-query/hooks';
import { sendGAEvent } from '@next/third-parties/google';
import { ROUTES } from '@/constants/routes';
import type { QueryClient } from '@tanstack/react-query';
import type { Question } from '../types';

export interface SubmitQuizParams {
  formData: {
    title: string;
    description: string;
    course: string;
    placement: 'course' | 'chapter' | 'lesson';
    chapter: string;
    lesson: string;
    timeLimit: string;
    isPublished: boolean;
    enableNegativeMarking: boolean;
    negativeMarks: string;
  };
  questions: Question[];
  quizId?: string;
  orgId: string;
  queryClient: QueryClient;
  router: { push: (path: string) => void };
  addAlert: (alert: { type: 'success' | 'error'; message: string; duration?: number }) => void;
  t: (key: string) => string;
}

export async function submitQuizForm(params: SubmitQuizParams): Promise<boolean> {
  const { formData, questions, quizId, orgId, queryClient, router, addAlert, t } = params;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    if (!q.question.trim()) {
      addAlert({
        type: 'error',
        message: t('createQuizForm.questionRequiredNumber').replace('{number}', (i + 1).toString()),
        duration: 5000,
      });
      return false;
    }
    if (q.options.some((opt) => !opt.trim())) {
      addAlert({
        type: 'error',
        message: t('createQuizForm.optionsRequiredNumber').replace('{number}', (i + 1).toString()),
        duration: 5000,
      });
      return false;
    }
  }

  try {
    const chapterPayload =
      formData.placement === 'chapter' && formData.chapter.trim()
        ? formData.chapter.trim()
        : null;
    const lessonPayload =
      formData.placement === 'lesson' && formData.lesson.trim() ? formData.lesson.trim() : null;

    if (quizId) {
      await patchQuiz(quizId, {
        title: formData.title,
        description: formData.description,
        chapter: chapterPayload,
        lesson: lessonPayload,
        timeLimit: Number(formData.timeLimit),
        isPublished: formData.isPublished,
        enableNegativeMarking: formData.enableNegativeMarking,
        negativeMarks: formData.enableNegativeMarking ? parseFloat(formData.negativeMarks || '0.25') : 0,
        questions,
      });
      addAlert({
        type: 'success',
        message: t('createQuizForm.updateSuccess'),
        duration: 3000,
      });
    } else {
      await createQuiz({
        title: formData.title,
        description: formData.description,
        course: formData.course,
        chapter: chapterPayload,
        lesson: lessonPayload,
        timeLimit: Number(formData.timeLimit),
        isPublished: formData.isPublished,
        enableNegativeMarking: formData.enableNegativeMarking,
        negativeMarks: formData.enableNegativeMarking ? parseFloat(formData.negativeMarks || '0.25') : 0,
        questions,
      });
      sendGAEvent({ event: 'create_quiz', quiz_title: formData.title });
      addAlert({
        type: 'success',
        message: t('createQuizForm.createSuccess'),
        duration: 3000,
      });
    }

    await invalidateAfterQuizChange(queryClient, formData.course, orgId);
    router.push(ROUTES.teacher.quizzes);
    return true;
  } catch (err) {
    const message =
      err instanceof ApiClientError
        ? err.message
        : err instanceof Error
          ? err.message
          : quizId
            ? t('createQuizForm.updateFailed')
            : t('createQuizForm.errorOccurred');
    addAlert({
      type: 'error',
      message,
      duration: 5000,
    });
    return false;
  }
}
