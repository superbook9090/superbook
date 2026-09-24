'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { useTranslation } from '@/hooks/useTranslation';
import { listTeacherCoursesSelf } from '@/lib/api/courses';
import { getQuizForEdit } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import { getQuizLessonId } from '@/lib/quiz/quizLesson';
import { getQuizChapterId } from '@/lib/quiz/quizChapter';
import { useQuizQuestionsManager } from './useQuizQuestionsManager';
import { useQuizCurriculumLoader } from './useQuizCurriculumLoader';
import { submitQuizForm } from './quizSubmitHelper';

export interface Course {
  _id: string;
  title: string;
}

export function useCreateQuizForm(quizId?: string) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const session = useSessionStore((s) => s.session);
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { addAlert } = useAlert();

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    placement: 'course' as 'course' | 'chapter' | 'lesson',
    chapter: '',
    lesson: '',
    timeLimit: '30',
    isPublished: true,
    enableNegativeMarking: false,
    negativeMarks: '0.25',
  });

  const { chapterOptions, lessonOptions, chaptersLoading } = useQuizCurriculumLoader(formData.course);
  const questionsManager = useQuizQuestionsManager();
  const { setQuestions } = questionsManager;

  // Fetch teacher's courses (and quiz when editing)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsFetching(true);
      try {
        const data = await listTeacherCoursesSelf();
        if (cancelled) return;
        if (data.courses) {
          setCourses(data.courses as Course[]);
        }

        if (quizId) {
          const res = await getQuizForEdit(quizId);
          if (cancelled) return;
          const { quiz, questions: rawQuestions } = res;
          const apiQuestions = [...(rawQuestions ?? [])].sort(
            (a, b) => (a.order ?? 0) - (b.order ?? 0)
          );
          const courseRef =
            typeof quiz.course === 'object' && quiz.course !== null && '_id' in quiz.course
              ? String((quiz.course as { _id: string })._id)
              : String(quiz.course ?? '');
          const courseTitle =
            typeof quiz.course === 'object' && quiz.course !== null && 'title' in quiz.course
              ? String((quiz.course as { title?: string }).title || '')
              : '';

          setCourses((prev) => {
            if (!courseRef || prev.some((c) => c._id === courseRef)) return prev;
            return [...prev, { _id: courseRef, title: courseTitle || t('teacherQuizzes.unknownCourse') }];
          });

          const chapterRef = getQuizChapterId(
            quiz.chapter as string | { _id?: string } | null | undefined
          );
          const lessonRef = getQuizLessonId(
            (quiz as { lesson?: string | { _id?: string } | null }).lesson
          );
          const placement = lessonRef ? 'lesson' : chapterRef ? 'chapter' : 'course';

          setFormData({
            title: quiz.title ?? '',
            description: quiz.description ?? '',
            course: courseRef,
            placement,
            chapter: chapterRef ?? '',
            lesson: lessonRef ?? '',
            timeLimit: String(quiz.timeLimit ?? 30),
            isPublished: Boolean(quiz.isPublished),
            enableNegativeMarking: Boolean(quiz.enableNegativeMarking),
            negativeMarks: String(quiz.negativeMarks ?? '0.25'),
          });
          if (apiQuestions && apiQuestions.length > 0) {
            setQuestions(
              apiQuestions.map((q) => ({
                question: q.question ?? '',
                options: [...(q.options ?? [])],
                correctAnswer:
                  typeof q.correctAnswer === 'number' && q.correctAnswer >= 0
                    ? q.correctAnswer
                    : 0,
              }))
            );
          }
        }
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof ApiClientError
              ? err.message
              : quizId
                ? t('createQuizForm.loadError')
                : t('createQuizForm.loadingCourses');
          if (quizId) {
            addAlert({
              type: 'error',
              message: message || t('createQuizForm.loadError'),
              duration: 5000,
            });
          } else {
            console.error('Error fetching courses:', err);
          }
        }
      } finally {
        if (!cancelled) {
          setIsFetching(false);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [quizId, t, addAlert, setQuestions]);

  useEffect(() => {
    if (quizId) return;
    const courseFromUrl = searchParams.get('course');
    if (!courseFromUrl) return;

    const placementParam = searchParams.get('placement');
    const chapterParam = searchParams.get('chapter') ?? '';
    const lessonParam = searchParams.get('lesson') ?? '';
    const placement =
      placementParam === 'lesson' || placementParam === 'chapter' || placementParam === 'course'
        ? placementParam
        : lessonParam
          ? 'lesson'
          : chapterParam
            ? 'chapter'
            : 'course';

    setFormData((prev) => {
      if (prev.course && prev.course !== courseFromUrl) return prev;
      return {
        ...prev,
        course: courseFromUrl,
        placement,
        chapter: placement === 'chapter' ? chapterParam : '',
        lesson: placement === 'lesson' ? lessonParam : '',
      };
    });
  }, [quizId, searchParams]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      setFormData((prev) => {
        if (name === 'course') {
          return {
            ...prev,
            course: value,
            placement: 'course',
            chapter: '',
            lesson: '',
          };
        }
        if (name === 'placement') {
          const placement = value as 'course' | 'chapter' | 'lesson';
          return {
            ...prev,
            placement,
            chapter: placement === 'chapter' ? prev.chapter : '',
            lesson: placement === 'lesson' ? prev.lesson : '',
          };
        }
        return {
          ...prev,
          [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        };
      });
    },
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await submitQuizForm({
      formData,
      questions: questionsManager.questions,
      quizId,
      orgId,
      queryClient,
      router,
      addAlert,
      t,
    });
    setIsLoading(false);
  };

  return {
    isLoading,
    isFetching,
    courses,
    formData,
    chapterOptions,
    lessonOptions,
    chaptersLoading,
    questions: questionsManager.questions,
    setQuestions: questionsManager.setQuestions,
    handleChange,
    handleQuestionChange: questionsManager.handleQuestionChange,
    addQuestion: questionsManager.addQuestion,
    removeQuestion: questionsManager.removeQuestion,
    addOption: questionsManager.addOption,
    removeOption: questionsManager.removeOption,
    handleSubmit,
  };
}
