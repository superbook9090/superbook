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
  type Quiz,
} from '@/lib/react-query/hooks';
import { BookOpen, Trophy, Target, Info } from 'lucide-react';
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
import { CourseHeader } from './_components/CourseHeader';
import { OverviewTab } from './_components/OverviewTab';
import { QuizzesTab } from './_components/QuizzesTab';
import { CurriculumTab, type ChapterWithQuizzes } from './_components/CurriculumTab';
import CurriculumLessonRow from './_components/CurriculumLessonRow';

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

  const enrollment = useMemo(() => enrollments.find((e) => e.course._id === courseId), [enrollments, courseId]);

  const { courseLevel: courseLevelQuizzes, chapterScoped: chapterScopedQuizzes, lessonScoped: lessonScopedQuizzes } =
    useMemo(() => splitQuizzesByScope(courseQuizzes), [courseQuizzes]);

  const curriculumWithQuizzes = useMemo(
    () => attachQuizzesToCurriculumTree(curriculum as unknown as CurriculumChapterNode[], courseQuizzes),
    [curriculum, courseQuizzes]
  );

  useEffect(() => {
    if (status === 'unauthenticated') router.push(ROUTES.login);
  }, [status, router]);

  useEffect(() => {
    sessionStorage.removeItem(`lesson-active:${courseId}`);
  }, [courseId]);

  useEffect(() => {
    if (curriculum.length > 0 && Object.keys(expandedChapters).length === 0) {
      const initial: Record<string, boolean> = {};
      curriculum.forEach((ch, idx) => {
        initial[ch._id] = idx === 0 || curriculum.length <= 4;
      });
      setExpandedChapters(initial);
    }
  }, [curriculum, expandedChapters]);

  const allExpanded = useMemo(() => {
    if (!curriculum.length) return false;
    return curriculum.every((ch) => expandedChapters[ch._id]);
  }, [curriculum, expandedChapters]);

  const toggleAllChapters = () => {
    const nextState = !allExpanded;
    const updated: Record<string, boolean> = {};
    curriculum.forEach((ch) => {
      updated[ch._id] = nextState;
    });
    setExpandedChapters(updated);
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const handleStartLesson = (lessonId: string) => {
    sessionStorage.setItem(`lesson-active:${courseId}`, '1');
    router.push(ROUTES.student.lesson(courseId, lessonId));
  };

  const getQuizStatus = (quizId: string) => {
    const quizAttempts = attempts.filter((a) => a.quiz._id === quizId);
    if (quizAttempts.length === 0) return { status: 'available' as const };
    const completed = quizAttempts.find((a) => a.status === 'completed');
    if (completed) return { status: 'completed' as const, attempt: completed };
    const inProgress = quizAttempts.find((a) => a.status === 'in_progress');
    if (inProgress) return { status: 'in_progress' as const, attempt: inProgress };
    return { status: 'available' as const };
  };

  const handleCurriculumQuizAction = (quiz: { _id: string; title: string; timeLimit: number; questionCount?: number }) => {
    const statusInfo = getQuizStatus(quiz._id);
    if (statusInfo.status === 'completed' && statusInfo.attempt) {
      router.push(ROUTES.student.quizResult(statusInfo.attempt._id));
      return;
    }
    if (statusInfo.status === 'in_progress' && statusInfo.attempt) {
      setConfirmQuiz({ quizId: quiz._id, title: quiz.title, questionCount: quiz.questionCount, timeLimit: quiz.timeLimit, mode: 'continue', attemptId: statusInfo.attempt._id });
      return;
    }
    setConfirmQuiz({ quizId: quiz._id, title: quiz.title, questionCount: quiz.questionCount, timeLimit: quiz.timeLimit, mode: 'start' });
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
      <CourseHeader
        courseTitle={course.title}
        category={course.category || ''}
        chaptersCount={curriculum.length}
        lessonsCount={allLessons.length}
        quizzesCount={courseQuizzes.length}
        progress={enrollment.progress}
        t={t}
      />

      <div className="rounded-3xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-2 bg-[var(--color-surface-muted)]/50 border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-md overflow-x-auto no-scrollbar">
          {[
            { id: 'curriculum', label: t('courses.courseContent'), icon: <BookOpen className="w-4 h-4" /> },
            { id: 'overview', label: t('common.overview'), icon: <Info className="w-4 h-4" /> },
            { id: 'quizzes', label: t('nav.quizzes'), icon: <Target className="w-4 h-4" />, count: courseQuizzes.length },
            { id: 'leaderboard', label: t('courses.leaderboard'), icon: <Trophy className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as TabType)}
              className={cn(
                'flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-[var(--student-primary)] text-white shadow-md'
                  : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)]'
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count ? (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-black',
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-[var(--color-surface-muted)] text-[var(--color-muted-foreground)]'
                )}>
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex-1 p-5 sm:p-8">
          {activeTab === 'curriculum' && (
            <CurriculumTab
              curriculumWithQuizzes={curriculumWithQuizzes as unknown as ChapterWithQuizzes[]}
              courseLevelQuizzes={courseLevelQuizzes}
              expandedChapters={expandedChapters}
              toggleChapter={toggleChapter}
              toggleAllChapters={toggleAllChapters}
              allExpanded={allExpanded}
              renderLessonRow={(lesson) => (
                <CurriculumLessonRow
                  key={lesson._id}
                  lesson={lesson}
                  onStartLesson={handleStartLesson}
                  getQuizStatus={getQuizStatus}
                  onQuizAction={handleCurriculumQuizAction}
                  startingQuizId={startingQuizId}
                  confirmQuizId={confirmQuiz?.quizId}
                />
              )}
              renderChapterQuizzes={(quizzes) =>
                quizzes?.map((quiz) => {
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
                })
              }
              allLessons={allLessons}
              handleStartLesson={handleStartLesson}
              enrollmentProgress={enrollment.progress}
              t={t}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewTab description={course.description || ''} category={course.category || ''} progress={enrollment.progress} t={t} />
          )}

          {activeTab === 'quizzes' && (
            <QuizzesTab
              courseQuizzes={courseQuizzes}
              courseLevelQuizzes={courseLevelQuizzes}
              chapterScopedQuizzes={chapterScopedQuizzes}
              lessonScopedQuizzes={lessonScopedQuizzes}
              renderQuizCard={(quiz: Quiz) => {
                const statusInfo = getQuizStatus(quiz._id);
                return (
                  <div key={quiz._id} className="min-w-0">
                    <LazyQuizCard
                      quiz={quiz}
                      attempt={statusInfo.attempt}
                      type={statusInfo.status === 'completed' ? 'attempted' : statusInfo.status === 'in_progress' ? 'in_progress' : 'available'}
                      onStart={handleConfirmQuizAction}
                      onContinue={(attemptId) => router.push(ROUTES.student.quizTake(attemptId))}
                      hideCourseBadge
                    />
                  </div>
                );
              }}
              t={t}
            />
          )}

          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('courses.leaderboard')}</h2>
                <Trophy className="w-5 h-5 text-[var(--color-warning)]" />
              </div>
              <div className="bg-[var(--color-surface-muted)]/50 rounded-2xl border border-[var(--border)] overflow-hidden">
                <LazyCourseLeaderboard courseId={courseId} courseTitle={enrollment.course.title} showUserRank={true} currentUserId={session?.user?.id} />
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
