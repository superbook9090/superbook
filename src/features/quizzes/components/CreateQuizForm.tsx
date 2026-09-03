'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/store/useSessionStore';
import { useAlert } from '@/components/ui/AlertContainer';
import { invalidateAfterQuizChange } from '@/lib/react-query/hooks';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { getCourseCurriculum, listTeacherCoursesSelf } from '@/lib/api/courses';
import { createQuiz, getQuizForEdit, patchQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import {
  flattenChapterSelectOptions,
  flattenLessonSelectOptions,
  type ChapterSelectOption,
  type LessonSelectOption,
} from '@/lib/curriculum/tree';
import { getQuizLessonId } from '@/lib/quiz/quizLesson';
import { getQuizChapterId } from '@/lib/quiz/quizChapter';
import type { Chapter } from '@/lib/react-query/hooks';
import { QuizBasicInfoForm } from './QuizBasicInfoForm';
import { QuizImportTool } from './QuizImportTool';
import { QuizQuestionsEditor } from './QuizQuestionsEditor';
import type { Question } from './types';
import { sendGAEvent } from '@next/third-parties/google';

interface Course {
  _id: string;
  title: string;
}

type Props = {
  /** When set, form loads this quiz and PATCHes on submit (teacher edit). */
  quizId?: string;
};

export default function CreateQuizForm({ quizId }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const session = useSessionStore((s) => s.session);
  const orgId = (session?.user as { organizationId?: string })?.organizationId || 'public';
  const { theme } = useRoleTheme();
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
  });
  const [chapterOptions, setChapterOptions] = useState<ChapterSelectOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonSelectOption[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: 0 },
  ]);


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
            isPublished: !!quiz.isPublished,
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
  }, [quizId, t, addAlert]);

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

  useEffect(() => {
    if (!formData.course) {
      setChapterOptions([]);
      setLessonOptions([]);
      return;
    }

    let cancelled = false;
    const loadChapters = async () => {
      setChaptersLoading(true);
      try {
        const tree = (await getCourseCurriculum(formData.course)) as Chapter[];
        if (!cancelled) {
          setChapterOptions(flattenChapterSelectOptions(tree));
          setLessonOptions(flattenLessonSelectOptions(tree));
        }
      } catch {
        if (!cancelled) {
          setChapterOptions([]);
          setLessonOptions([]);
        }
      } finally {
        if (!cancelled) setChaptersLoading(false);
      }
    };

    void loadChapters();
    return () => {
      cancelled = true;
    };
  }, [formData.course]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  }, []);

  const handleQuestionChange = useCallback((index: number, field: string, value: string) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (field === 'question') {
        updated[index] = { ...updated[index], question: value };
      } else if (field.startsWith('option')) {
        const optionIndex = parseInt(field.replace('option', ''));
        const newOptions = [...updated[index].options];
        newOptions[optionIndex] = value;
        updated[index] = { ...updated[index], options: newOptions };
      } else if (field === 'correctAnswer') {
        updated[index] = { ...updated[index], correctAnswer: parseInt(value) };
      }
      return updated;
    });
  }, []);

  const addQuestion = useCallback(() => {
    setQuestions(prev => [...prev, { question: '', options: ['', ''], correctAnswer: 0 }]);
  }, []);

  const removeQuestion = useCallback((index: number) => {
    setQuestions(prev => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  }, []);

  const addOption = useCallback((questionIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      updated[questionIndex] = {
        ...updated[questionIndex],
        options: [...updated[questionIndex].options, '']
      };
      return updated;
    });
  }, []);

  const removeOption = useCallback((questionIndex: number, optionIndex: number) => {
    setQuestions(prev => {
      const updated = [...prev];
      if (updated[questionIndex].options.length > 2) {
        const newOptions = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
        let newCorrectAnswer = updated[questionIndex].correctAnswer;
        if (newCorrectAnswer >= newOptions.length) {
          newCorrectAnswer = newOptions.length - 1;
        }
        updated[questionIndex] = {
          ...updated[questionIndex],
          options: newOptions,
          correctAnswer: newCorrectAnswer
        };
      }
      return updated;
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        addAlert({
          type: 'error',
          message: t('createQuizForm.questionRequiredNumber').replace('{number}', (i + 1).toString()),
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        addAlert({
          type: 'error',
          message: t('createQuizForm.optionsRequiredNumber').replace('{number}', (i + 1).toString()),
          duration: 5000,
        });
        setIsLoading(false);
        return;
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
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-8 text-[var(--color-muted-foreground)]">{t('createQuizForm.loadingCourses')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-end space-x-3 pb-4 border-b border-[var(--color-border)]">
        <button
          type="button"
          onClick={() => router.push(ROUTES.teacher.quizzes)}
          className="px-4 py-2 border border-[var(--color-border)] rounded-md shadow-sm text-sm font-medium text-[var(--color-foreground)] bg-[var(--color-card)] hover:bg-[var(--color-accent)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)]"
        >
          {t('createQuizForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading || (!quizId && courses.length === 0)}
          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading
            ? quizId
              ? t('createQuizForm.saving')
              : t('createQuizForm.creating')
            : quizId
              ? t('createQuizForm.saveChanges')
              : t('createQuizForm.createQuiz')}
        </button>
      </div>

      <QuizBasicInfoForm
        formData={formData}
        handleChange={handleChange}
        courses={courses}
        quizId={quizId}
        chaptersLoading={chaptersLoading}
        chapterOptions={chapterOptions}
        lessonOptions={lessonOptions}
      />

      <div className="border-t border-[var(--color-border)] pt-6">
        <QuizImportTool 
          theme={theme} 
          onImport={(imported) => setQuestions(imported)} 
        />

        <QuizQuestionsEditor
          questions={questions}
          onQuestionChange={handleQuestionChange}
          onRemoveQuestion={removeQuestion}
          onAddOption={addOption}
          onRemoveOption={removeOption}
          onAddQuestion={addQuestion}
        />
      </div>

      <div className="flex items-center pt-4">
        <input
          type="checkbox"
          name="isPublished"
          id="isPublished"
          checked={formData.isPublished}
          onChange={handleChange}
          className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)] rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-[var(--color-foreground)]">
          {t('createQuizForm.publishImmediately')}
        </label>
      </div>


    </form>
  );
}
