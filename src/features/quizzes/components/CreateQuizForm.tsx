'use client';
import { ROUTES } from '@/constants/routes';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useSessionStore } from '@/store/useSessionStore';
import { invalidateAfterQuizChange } from '@/lib/react-query/hooks';
import * as XLSX from 'xlsx';
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

interface Course {
  _id: string;
  title: string;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface ExcelRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number; // 0-3 representing A-D
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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    placement: 'course' as 'course' | 'chapter' | 'lesson',
    chapter: '',
    lesson: '',
    timeLimit: '30',
    isPublished: false,
  });
  const [chapterOptions, setChapterOptions] = useState<ChapterSelectOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonSelectOption[]>([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    { question: '', options: ['', ''], correctAnswer: 0 },
  ]);

  // Excel upload states
  const [showUpload, setShowUpload] = useState(false);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  // Fetch teacher's courses (and quiz when editing)
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsFetching(true);
      setError('');
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
          setError(quizId ? message || t('createQuizForm.loadError') : '');
          if (!quizId) {
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
  }, [quizId, t]);

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

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.csv') && !file.name.endsWith('.xls')) {
      setUploadError(t('createQuizForm.validFileRequired'));
      return;
    }

    setIsParsing(true);
    setUploadError('');
    setPreviewData([]);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as string[][];

      if (jsonData.length < 2) {
        setUploadError(t('createQuizForm.fileEmpty'));
        setIsParsing(false);
        return;
      }

      // Parse headers (first row)
      const headers = jsonData[0].map((h) => h.toString().toLowerCase().trim());
      const requiredColumns = ['question', 'optiona', 'optionb', 'optionc', 'optiond', 'correctanswer'];
      const hasAllColumns = requiredColumns.every((col) =>
        headers.some((h) => h === col || h === col.replace('option', 'option_'))
      );

      if (!hasAllColumns) {
        setUploadError(t('createQuizForm.invalidFormat').replace('{columns}', headers.join(', ')));
        setIsParsing(false);
        return;
      }

      // Map column indices
      const getColIndex = (names: string[]) => {
        for (const name of names) {
          const idx = headers.findIndex((h) => h === name.toLowerCase());
          if (idx !== -1) return idx;
        }
        return -1;
      };

      const colMap = {
        question: getColIndex(['question']),
        optionA: getColIndex(['optiona', 'option_a']),
        optionB: getColIndex(['optionb', 'option_b']),
        optionC: getColIndex(['optionc', 'option_c']),
        optionD: getColIndex(['optiond', 'option_d']),
        correctAnswer: getColIndex(['correctanswer', 'correct_answer']),
      };

      // Parse data rows
      const parsed: ExcelRow[] = [];
      const errors: string[] = [];

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row.every((cell) => !cell)) continue; // Skip empty rows

        const question = row[colMap.question]?.toString().trim();
        const optionA = row[colMap.optionA]?.toString().trim();
        const optionB = row[colMap.optionB]?.toString().trim();
        const optionC = row[colMap.optionC]?.toString().trim();
        const optionD = row[colMap.optionD]?.toString().trim();
        const correctAnswer = row[colMap.correctAnswer];

        if (!question) {
          errors.push(t('createQuizForm.questionRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (!optionA || !optionB || !optionC || !optionD) {
          errors.push(t('createQuizForm.optionsRequired').replace('{number}', (i + 1).toString()));
          continue;
        }
        if (correctAnswer === undefined || correctAnswer === null || correctAnswer === '') {
          errors.push(t('createQuizForm.correctAnswerRequired'));
          continue;
        }

        // Normalize correct answer
        let correctIndex: number;
        const ca = correctAnswer.toString().trim().toUpperCase();
        if (['A', 'B', 'C', 'D'].includes(ca)) {
          correctIndex = ca.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        } else {
          correctIndex = parseInt(ca) - 1; // 1=0, 2=1, etc.
        }

        if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
          errors.push(t('createQuizForm.correctAnswerInvalid'));
          continue;
        }

        parsed.push({
          question,
          optionA,
          optionB,
          optionC,
          optionD,
          correctAnswer: correctIndex,
        });
      }

      if (errors.length > 0) {
        setUploadError(`${t('createQuizForm.validationErrors')}\n${errors.slice(0, 5).join('\n')}${errors.length > 5 ? `\n${t('createQuizForm.andMoreErrors').replace('{count}', (errors.length - 5).toString())}` : ''}`);
      }

      if (parsed.length === 0) {
        setUploadError((prev) => prev || t('createQuizForm.noValidQuestions'));
      } else {
        setPreviewData(parsed);
      }
    } catch {
      setUploadError(t('createQuizForm.parsingError'));
    } finally {
      setIsParsing(false);
    }
  }, [t]);

  const handleConfirmImport = useCallback(() => {
    const importedQuestions: Question[] = previewData.map((row) => ({
      question: row.question,
      options: [row.optionA, row.optionB, row.optionC, row.optionD],
      correctAnswer: row.correctAnswer,
    }));

    setQuestions(importedQuestions);
    setPreviewData([]);
    setShowUpload(false);
    setError('');
  }, [previewData]);

  const downloadTemplate = useCallback(() => {
    const template = [
      ['question', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer'],
      ['What is 2+2?', '3', '4', '5', '6', 'B'],
      ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C'],
      ['Which planet is closest to the Sun?', 'Venus', 'Earth', 'Mercury', 'Mars', 'C'],
    ];

    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quiz Template');
    XLSX.writeFile(wb, 'quiz_template.xlsx');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setError(t('createQuizForm.questionRequiredNumber').replace('{number}', (i + 1).toString()));
        setIsLoading(false);
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        setError(t('createQuizForm.optionsRequiredNumber').replace('{number}', (i + 1).toString()));
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
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="text-center py-8 text-[var(--color-muted-foreground)]">{t('createQuizForm.loadingCourses')}</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-[var(--color-error-light)] border-l-4 border-[var(--color-error)] p-4">
          <p className="text-sm text-[var(--color-error)]">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[var(--color-foreground)]">
          {t('createQuizForm.quizTitle')} *
        </label>
        <input
          type="text"
          name="title"
          id="title"
          required
          value={formData.title}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]"
          placeholder={t('createQuizForm.enterQuizTitle')}
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-foreground)]">
          {t('createQuizForm.description')}
        </label>
        <textarea
          name="description"
          id="description"
          rows={2}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] placeholder-[var(--color-muted-foreground)]"
          placeholder={t('createQuizForm.enterQuizDescription')}
        />
      </div>

      <div>
        <label htmlFor="course" className="block text-sm font-medium text-[var(--color-foreground)]">
          {t('createQuizForm.course')} *
        </label>
        <select
          name="course"
          id="course"
          required={!quizId}
          disabled={!!quizId}
          value={formData.course}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">{t('createQuizForm.selectCourse')}</option>
          {courses.map(course => (
            <option key={course._id} value={course._id}>
              {course.title}
            </option>
          ))}
        </select>
        {courses.length === 0 && (
          <p className="mt-2 text-sm text-amber-600">
            {t('createQuizForm.needCourseFirst')}
          </p>
        )}
        {quizId && (
          <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
            {t('createQuizForm.courseLockedInEdit')}
          </p>
        )}
      </div>

      {formData.course && (
        <>
          <div>
            <label htmlFor="placement" className="block text-sm font-medium text-[var(--color-foreground)]">
              {t('createQuizForm.placement')}
            </label>
            <select
              name="placement"
              id="placement"
              value={formData.placement}
              onChange={handleChange}
              disabled={chaptersLoading}
              className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] disabled:opacity-60"
            >
              <option value="course">{t('createQuizForm.placementCourse')}</option>
              <option value="chapter">{t('createQuizForm.placementChapter')}</option>
              <option value="lesson">{t('createQuizForm.placementLesson')}</option>
            </select>
          </div>

          {formData.placement === 'chapter' && (
            <div>
              <label htmlFor="chapter" className="block text-sm font-medium text-[var(--color-foreground)]">
                {t('createQuizForm.chapter')}
              </label>
              <select
                name="chapter"
                id="chapter"
                required
                value={formData.chapter}
                onChange={handleChange}
                disabled={chaptersLoading}
                className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] disabled:opacity-60"
              >
                <option value="">{t('createQuizForm.selectChapterRequired')}</option>
                {chapterOptions.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {t('createQuizForm.selectChapterHint')}
              </p>
            </div>
          )}

          {formData.placement === 'lesson' && (
            <div>
              <label htmlFor="lesson" className="block text-sm font-medium text-[var(--color-foreground)]">
                {t('createQuizForm.lesson')}
              </label>
              <select
                name="lesson"
                id="lesson"
                required
                value={formData.lesson}
                onChange={handleChange}
                disabled={chaptersLoading || lessonOptions.length === 0}
                className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)] disabled:opacity-60"
              >
                <option value="">{t('createQuizForm.selectLessonRequired')}</option>
                {lessonOptions.map((ls) => (
                  <option key={ls.id} value={ls.id}>
                    {ls.label}
                  </option>
                ))}
              </select>
              {lessonOptions.length === 0 && (
                <p className="mt-2 text-sm text-amber-600">{t('createQuizForm.noLessonsInCourse')}</p>
              )}
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {t('createQuizForm.selectLessonHint')}
              </p>
            </div>
          )}
        </>
      )}

      <div>
        <label htmlFor="timeLimit" className="block text-sm font-medium text-[var(--color-foreground)]">
          {t('createQuizForm.timeLimit')}
        </label>
        <input
          type="number"
          name="timeLimit"
          id="timeLimit"
          min="1"
          max="180"
          value={formData.timeLimit}
          onChange={handleChange}
          className="mt-1 px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)]"
        />
      </div>

      {/* Excel Upload Section */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-[var(--color-foreground)]">{t('createQuizForm.questions')}</h3>
          <button
            type="button"
            onClick={() => setShowUpload(!showUpload)}
            className="text-sm text-[var(--color-primary)] hover:opacity-80 font-medium"
          >
            {showUpload ? t('createQuizForm.hideImport') : t('createQuizForm.importFromExcel')}
          </button>
        </div>

        {showUpload && (
          <div className={`${theme.activeBg} rounded-lg p-4 mb-6`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.importQuestionsFromExcel')}</h4>
                <p className="text-sm text-[var(--color-muted-foreground)] mt-1">
                  {t('createQuizForm.importInstructions')}
                </p>
              </div>
              <button
                type="button"
                onClick={downloadTemplate}
                className="text-sm text-[var(--color-primary)] hover:opacity-80 underline"
              >
                {t('createQuizForm.downloadTemplate')}
              </button>
            </div>

            <div className="mt-3">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                disabled={isParsing}
                className={`block w-full text-sm text-[var(--color-muted-foreground)] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium ${theme.activeBg} ${theme.text} hover:opacity-80 disabled:opacity-50`}
              />
            </div>

            {isParsing && (
              <p className="mt-2 text-sm text-[var(--color-primary)]">{t('createQuizForm.parsingFile')}</p>
            )}

            {uploadError && (
              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-700 whitespace-pre-line">{uploadError}</p>
              </div>
            )}

            {previewData.length > 0 && (
              <div className="mt-4 bg-[var(--color-card)] rounded-md border border-[var(--color-border)] overflow-hidden">
                <div className={`px-4 py-3 ${theme.activeBg} border-b border-[var(--color-border)]`}>
                  <div className="flex justify-between items-center">
                    <h5 className={`font-medium ${theme.activeText}`}>
                      {t('createQuizForm.preview')}: {previewData.length} {t('createQuizForm.questionsFound')}
                    </h5>
                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewData([]);
                          setUploadError('');
                        }}
                        className="text-sm text-[var(--color-muted)] hover:text-gray-800 px-3 py-1 rounded border border-[var(--color-border)] hover:bg-[var(--color-accent)]"
                      >
                        {t('createQuizForm.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={handleConfirmImport}
                        className={`text-sm text-white bg-gradient-to-r ${theme.gradient} hover:opacity-90 px-3 py-1 rounded`}
                      >
                        {t('createQuizForm.confirmImport')}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[var(--color-accent)] sticky top-0">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">#</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.question')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.options')}</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-[var(--color-muted-foreground)] uppercase">{t('createQuizForm.answer')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {previewData.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-sm text-[var(--color-foreground)]">{idx + 1}</td>
                          <td className="px-3 py-2 text-sm text-[var(--color-foreground)] max-w-xs truncate">{row.question}</td>
                          <td className="px-3 py-2 text-sm text-[var(--color-muted-foreground)]">A, B, C, D</td>
                          <td className="px-3 py-2 text-sm font-medium text-green-600">
                            {['A', 'B', 'C', 'D'][typeof row.correctAnswer === 'number' ? row.correctAnswer : 0]}
                          </td>
                        </tr>
                      ))}
                      {previewData.length > 5 && (
                        <tr>
                          <td colSpan={4} className="px-3 py-2 text-sm text-[var(--color-muted-foreground)] text-center italic">
                            ... {t('createQuizForm.moreQuestions').replace('{count}', (previewData.length - 5).toString())}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="border-t border-[var(--color-border)] pt-6">
        <h3 className="text-lg font-medium text-[var(--color-foreground)] mb-4">{t('createQuizForm.questions')}</h3>

        {questions.map((question, qIndex) => (
          <div key={qIndex} className="bg-[var(--color-accent)] rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-[var(--color-foreground)]">{t('createQuizForm.question')} {qIndex + 1}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  {t('createQuizForm.remove')}
                </button>
              )}
            </div>

            <div className="mb-3">
              <input
                type="text"
                value={question.question}
                onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                className="px-3 py-2 block w-full rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)]"
                placeholder={t('createQuizForm.enterQuestion')}
                required
              />
            </div>

            <div className="space-y-2">
              {question.options.map((option, oIndex) => (
                <div key={oIndex} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={`correct-${qIndex}`}
                    checked={question.correctAnswer === oIndex}
                    onChange={() => handleQuestionChange(qIndex, 'correctAnswer', oIndex.toString())}
                    className="h-4 w-4 text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-[var(--color-border)]"
                  />
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleQuestionChange(qIndex, `option${oIndex}`, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-md border-[var(--color-border)] shadow-sm focus:border-[var(--color-primary)] focus:ring-[var(--color-primary)] sm:text-sm text-[var(--color-foreground)]"
                    placeholder={`${t('createQuizForm.option')} ${oIndex + 1}`}
                    required
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(qIndex, oIndex)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => addOption(qIndex)}
              className="mt-3 text-sm text-[var(--color-primary)] hover:opacity-80"
            >
              {t('createQuizForm.addOption')}
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={addQuestion}
          className="w-full py-2 border-2 border-dashed border-[var(--color-border)] rounded-md text-[var(--color-muted)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
        >
          {t('createQuizForm.addQuestion')}
        </button>
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

      <div className="flex justify-end space-x-3 pt-4 border-t border-[var(--color-border)]">
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
    </form>
  );
}
