'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { 
  useEnrollments,
  useCourseQuizzes,
  useQuizAttempts,
  useStartQuizAttempt,
  useCourseCurriculum,
} from '@/lib/react-query/hooks';
import { 
  ChevronRight, 
  BookOpen, 
  PlayCircle, 
  Trophy, 
  Target,
  Info,
} from 'lucide-react';
import {
  LazyCourseLeaderboard,
  LazyCurriculumQuizRow,
  LazyQuizCard,
  LazyQuizStartConfirmModal,
} from '@/lib/lazy';
import type { QuizStartInfo } from '@/features/quizzes/components/QuizStartConfirmModal';
import {
  attachQuizzesToCurriculumTree,
  flattenCurriculumLessons,
  type CurriculumChapterNode,
} from '@/lib/curriculum/tree';
import { splitQuizzesByScope } from '@/lib/quiz/quizCourse';
import type { CurriculumLesson } from '@/lib/curriculum/tree';
import type { Quiz } from '@/lib/react-query/hooks';

import { CourseHeader } from './_components/CourseHeader';
import { OverviewTab } from './_components/OverviewTab';
import { QuizzesTab } from './_components/QuizzesTab';
import { CurriculumTab } from './_components/CurriculumTab';


type TabType = 'curriculum' | 'overview' | 'quizzes' | 'leaderboard';

type PendingQuizStart = QuizStartInfo & { quizId: string; attemptId?: string };

export default function CourseDetailPage() {
  const { status, session } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const tabParam = searchParams.get('tab') as TabType;
  const validTabs: TabType[] = ['curriculum', 'overview', 'quizzes', 'leaderboard'];
  const initialTab = validTabs.includes(tabParam) ? tabParam : 'curriculum';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);
  const [confirmQuiz, setConfirmQuiz] = useState<PendingQuizStart | null>(null);

  const courseId = params.id as string;

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { quizzes: courseQuizzes, isLoading: quizzesLoading } = useCourseQuizzes(courseId, {
    publishedOnly: true,
  });
  const { data: curriculum = [], isLoading: curriculumLoading } = useCourseCurriculum(courseId);
  const allLessons = useMemo(() => flattenCurriculumLessons(curriculum), [curriculum]);
  const { data: attempts = [], isLoading: attemptsLoading } = useQuizAttempts();
  const startQuizMutation = useStartQuizAttempt();

  const enrollment = useMemo(() => enrollments.find(e => e.course._id === courseId), [enrollments, courseId]);
  
  const { courseLevel: courseLevelQuizzes, chapterScoped: chapterScopedQuizzes, lessonScoped: lessonScopedQuizzes } =
    useMemo(() => splitQuizzesByScope(courseQuizzes), [courseQuizzes]);

  const curriculumWithQuizzes = useMemo(
    () =>
      attachQuizzesToCurriculumTree(
        curriculum as unknown as CurriculumChapterNode[],
        courseQuizzes
      ),
    [curriculum, courseQuizzes]
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
    }
  }, [status, router]);

  useEffect(() => {
    sessionStorage.removeItem(`lesson-active:${courseId}`);
  }, [courseId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleStartQuiz = async (quizId: string) => {
    setStartingQuizId(quizId);
    try {
      const data = await startQuizMutation.mutateAsync(quizId);
      router.push(ROUTES.student.quizTake(data.attempt._id));
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setStartingQuizId(null);
    }
  };

  const openQuizConfirm = (
    quiz: { _id: string; title: string; timeLimit: number; questionCount?: number },
    mode: 'start' | 'retake' | 'continue' = 'start',
    attemptId?: string
  ) => {
    setConfirmQuiz({
      quizId: quiz._id,
      title: quiz.title,
      questionCount: quiz.questionCount,
      timeLimit: quiz.timeLimit,
      mode,
      attemptId,
    });
  };

  const handleConfirmQuizAction = async () => {
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
  };

  const handleContinueQuiz = (attemptId: string) => {
    router.push(ROUTES.student.quizTake(attemptId));
  };

  const handleStartLesson = (lessonId: string) => {
    sessionStorage.setItem(`lesson-active:${courseId}`, '1');
    router.push(ROUTES.student.lesson(courseId, lessonId));
  };

  const renderLessonRow = (lesson: CurriculumLesson) => (
    <div key={lesson._id} className="divide-y divide-[var(--border)]">
      <div
        onClick={() => handleStartLesson(lesson._id)}
        className="flex items-center justify-between p-4 hover:bg-[var(--color-surface-muted)] transition-colors cursor-pointer group/lesson"
      >
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
              lesson.videoUrl ? 'bg-[var(--color-info-light)] text-[var(--color-info)]' : 'bg-[var(--color-warning-light)] text-[var(--color-warning)]'
            )}
          >
            {lesson.videoUrl ? <PlayCircle className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
          </div>
          <p className="text-sm font-medium text-[var(--color-foreground)] group-hover/lesson:text-[var(--student-primary)] transition-colors">
            {lesson.title}
          </p>
        </div>
        <ChevronRight className="w-4 h-4 text-[var(--color-muted-foreground)] group-hover/lesson:translate-x-1 transition-all" />
      </div>
      {lesson.quizzes?.map((quiz) => {
        const statusInfo = getQuizStatus(quiz._id);
        return (
          <LazyCurriculumQuizRow
            key={quiz._id}
            title={quiz.title}
            timeLimit={quiz.timeLimit}
            questionCount={quiz.questionCount}
            status={statusInfo.status}
            score={statusInfo.attempt?.score}
            isLoading={startingQuizId === quiz._id || confirmQuiz?.quizId === quiz._id}
            onAction={() => handleCurriculumQuizAction(quiz)}
          />
        );
      })}
    </div>
  );

  const getQuizStatus = (quizId: string) => {
    const quizAttempts = attempts.filter((a) => a.quiz._id === quizId);
    if (quizAttempts.length === 0) return { status: 'available' as const };

    const completed = quizAttempts.find((a) => a.status === 'completed');
    if (completed) return { status: 'completed' as const, attempt: completed };

    const inProgress = quizAttempts.find((a) => a.status === 'in_progress');
    if (inProgress) return { status: 'in_progress' as const, attempt: inProgress };

    return { status: 'available' as const };
  };

  const handleCurriculumQuizAction = (quiz: {
    _id: string;
    title: string;
    timeLimit: number;
    questionCount?: number;
  }) => {
    const statusInfo = getQuizStatus(quiz._id);
    if (statusInfo.status === 'completed' && statusInfo.attempt) {
      router.push(ROUTES.student.quizResult(statusInfo.attempt._id));
      return;
    }
    if (statusInfo.status === 'in_progress' && statusInfo.attempt) {
      openQuizConfirm(quiz, 'continue', statusInfo.attempt._id);
      return;
    }
    openQuizConfirm(quiz, 'start');
  };

  const renderChapterQuizzes = (quizzes?: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>) => {
    if (!quizzes?.length) return null;
    return quizzes.map((quiz) => {
      const statusInfo = getQuizStatus(quiz._id);
      return (
        <LazyCurriculumQuizRow
          key={quiz._id}
          title={quiz.title}
          timeLimit={quiz.timeLimit}
          questionCount={quiz.questionCount}
          status={statusInfo.status}
          score={statusInfo.attempt?.score}
          isLoading={startingQuizId === quiz._id || confirmQuiz?.quizId === quiz._id}
          onAction={() => handleCurriculumQuizAction(quiz)}
        />
      );
    });
  };

  const renderQuizCard = (quiz: Quiz) => {
    const statusInfo = getQuizStatus(quiz._id);

    if (statusInfo.status === 'completed' && statusInfo.attempt) {
      return (
        <div key={quiz._id} className="h-full min-w-0">
          <LazyQuizCard
            quiz={quiz}
            attempt={statusInfo.attempt}
            type="attempted"
            onStart={handleStartQuiz}
            onContinue={handleContinueQuiz}
            hideCourseBadge
          />
        </div>
      );
    }

    if (statusInfo.status === 'in_progress' && statusInfo.attempt) {
      return (
        <div key={quiz._id} className="h-full min-w-0">
          <LazyQuizCard
            quiz={quiz}
            attempt={statusInfo.attempt}
            type="in_progress"
            onStart={handleStartQuiz}
            onContinue={handleContinueQuiz}
            hideCourseBadge
          />
        </div>
      );
    }

    return (
      <div key={quiz._id} className="min-w-0">
        <LazyQuizCard quiz={quiz} type="available" onStart={handleStartQuiz} hideCourseBadge />
      </div>
    );
  };

  if (status === 'loading' || enrollmentsLoading || quizzesLoading || curriculumLoading || attemptsLoading) {
    return <PageSkeleton />;
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <div className="w-16 h-16 bg-[var(--student-soft)] text-[var(--student-primary)] rounded-2xl flex items-center justify-center mb-6">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">{t('courses.noEnrollmentFound')}</h2>
        <p className="text-[var(--color-muted-foreground)] mb-6">{t('courses.noEnrollmentDesc')}</p>
        <Button onClick={() => router.push(ROUTES.student.courses)} variant="primary">
          {t('courses.backToCourses')}
        </Button>
      </div>
    );
  }

  const { course } = enrollment;

  return (
    <div className="stack-page">
      
      
      {/* Standardized Header Style */}
      <CourseHeader
        courseTitle={course.title}
        category={course.category || ''}
        lessonsCount={allLessons.length}
        quizzesCount={courseQuizzes.length}
        progress={enrollment.progress}
        t={t}
      />

      {/* Tabs - Aligned with dashboard cards style */}

      <div className="rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-[var(--color-surface-muted)]/50 border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-md overflow-x-auto no-scrollbar">
          {[
            { id: 'curriculum', label: t('courses.courseContent'), icon: <BookOpen className="w-4 h-4" /> },
            { id: 'overview', label: t('common.overview'), icon: <Info className="w-4 h-4" /> },
            { id: 'quizzes', label: t('nav.quizzes'), icon: <Target className="w-4 h-4" /> },
            { id: 'leaderboard', label: t('courses.leaderboard'), icon: <Trophy className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-[var(--card-solid)] text-[var(--student-primary)] shadow-sm"
                  : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 card-body">
          
          {/* 1. CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <CurriculumTab
              curriculumWithQuizzes={curriculumWithQuizzes as unknown as import('./_components/CurriculumTab').ChapterWithQuizzes[]}
              courseLevelQuizzes={courseLevelQuizzes}
              expandedChapters={expandedChapters}
              toggleChapter={toggleChapter}
              renderLessonRow={renderLessonRow}
              renderChapterQuizzes={renderChapterQuizzes}
              allLessons={allLessons}
              handleStartLesson={handleStartLesson}
              enrollmentProgress={enrollment.progress}
              t={t}
            />
          )}

          {/* 2. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <OverviewTab
              description={course.description || ''}
              category={course.category || ''}
              progress={enrollment.progress}
              t={t}
            />
          )}

          {/* 3. QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <QuizzesTab
              courseQuizzes={courseQuizzes}
              courseLevelQuizzes={courseLevelQuizzes}
              chapterScopedQuizzes={chapterScopedQuizzes}
              lessonScopedQuizzes={lessonScopedQuizzes}
              renderQuizCard={renderQuizCard}
              t={t}
            />
          )}

          {/* 4. LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto stack-page">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('courses.leaderboard')}</h2>
                <Trophy className="w-6 h-6 text-[var(--color-warning)]" />
              </div>
              <div className="bg-[var(--color-surface-muted)]/50 rounded-2xl border border-[var(--border)] overflow-hidden">
                <LazyCourseLeaderboard
                  courseId={courseId}
                  courseTitle={enrollment.course.title}
                  showUserRank={true}
                  currentUserId={session?.user?.id}
                />
              </div>
            </div>
          )}
          
        </div>
      </div>

      <LazyQuizStartConfirmModal
        quiz={confirmQuiz}
        isOpen={!!confirmQuiz}
        isLoading={!!confirmQuiz && startingQuizId === confirmQuiz.quizId}
        onConfirm={handleConfirmQuizAction}
        onCancel={() => setConfirmQuiz(null)}
      />
    </div>
  );
}
