'use client';
import { ROUTES } from '@/constants/routes';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
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
  Play,
  CheckCircle, 
  ChevronDown, 
  ChevronRight, 
  BookOpen, 
  PlayCircle, 
  Trophy, 
  ArrowLeft,
  Clock,
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

  const renderChapterQuizzes = (quizzes: Array<{ _id: string; title: string; timeLimit: number; questionCount?: number }>) => {
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
    <div className="space-y-6">
      
      {/* Standardized Header Style */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hero-banner"
      >
        <div className="space-y-4">
          <button
            onClick={() => router.push(ROUTES.student.courses)}
            className="flex items-center gap-2 text-xs font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('courses.backToCourses')}
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--color-muted-foreground)]">
                <span className="px-2.5 py-0.5 bg-[var(--primary-soft)] text-[var(--primary)] rounded-lg text-xs font-medium">{course.category || t('courses.course')}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {allLessons.length} {t('dashboard.lessons')}</span>
                <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {courseQuizzes.length} {t('nav.quizzes')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[var(--card-solid)] p-4 rounded-xl border border-[var(--color-border)] shadow-[var(--shadow-sm)]">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted)]">{t('courses.progress')}</p>
                <p className="text-2xl font-bold leading-none mt-1 tabular-nums text-[var(--color-foreground)]">{enrollment.progress}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg gradient-bg text-white flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
        <div className="flex-1 p-6 sm:p-8">
          
          {/* 1. CURRICULUM TAB */}
          {activeTab === 'curriculum' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('courses.courseContent')}</h2>
                <Button 
                  onClick={() => allLessons[0] && handleStartLesson(allLessons[0]._id)}
                  variant="primary"
                  className="flex items-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {enrollment.progress > 0 ? t('courses.continue') : t('courses.start')}
                </Button>
              </div>

              <div className="space-y-4">
                {curriculumWithQuizzes.map((chapter, idx) => (
                  <div key={chapter._id} className="group/chapter">
                    <div className={cn(
                      "rounded-xl border transition-all duration-200",
                      expandedChapters[chapter._id] ? "bg-[var(--card-solid)] border-[var(--student-primary)]/30 shadow-sm" : "bg-[var(--color-surface-muted)]/30 border-[var(--border)] hover:border-[var(--student-primary)]/20"
                    )}>
                      <button 
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                            expandedChapters[chapter._id] ? "bg-[var(--student-primary)] text-white" : "bg-[var(--card-solid)] text-[var(--color-muted-foreground)] border border-[var(--border)]"
                          )}>
                            {idx + 1}
                          </div>
                          <h3 className="font-semibold text-[var(--color-foreground)]">{chapter.title}</h3>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", expandedChapters[chapter._id] && "rotate-180")} />
                      </button>

                      {expandedChapters[chapter._id] && (
                        <div className="border-t border-[var(--border)] divide-y divide-[var(--border)] bg-[var(--card-solid)] rounded-b-xl overflow-hidden">
                          {chapter.lessons?.map(renderLessonRow)}
                          {renderChapterQuizzes(chapter.quizzes)}
                          {chapter.subChapters?.map((sub) => (
                            <div key={sub._id} className="bg-[var(--color-surface-muted)]/40">
                              <button
                                type="button"
                                onClick={() => toggleChapter(sub._id)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--color-surface-muted)] transition-colors"
                              >
                                <p className="text-sm font-semibold text-[var(--color-foreground)] pl-12">{sub.title}</p>
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 transition-transform',
                                    expandedChapters[sub._id] && 'rotate-180'
                                  )}
                                />
                              </button>
                              {expandedChapters[sub._id] && (
                                <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                                  {sub.lessons?.map(renderLessonRow)}
                                  {renderChapterQuizzes(sub.quizzes)}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {courseLevelQuizzes.length > 0 && (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--card-solid)] overflow-hidden">
                    <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
                      <h3 className="font-semibold text-[var(--color-foreground)]">
                        {t('courses.courseLevelQuizzes')}
                      </h3>
                    </div>
                    <div className="divide-y divide-[var(--border)]">
                      {courseLevelQuizzes.map((quiz) => {
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
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 2. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('common.overview')}</h2>
                <p className="text-[var(--color-muted-foreground)] leading-relaxed">
                  {course.description || t('courses.noDescription')}
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[var(--primary-soft)]/50 border border-[var(--primary-border)]/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--primary)] mb-1">{t('courses.category')}</h4>
                  <p className="text-base font-bold text-[var(--primary-dark)]">{course.category || 'General'}</p>
                </div>
                <div className="p-5 rounded-2xl bg-[var(--color-success-light)] border border-[var(--color-success)]/20">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-success)] mb-1">{t('dashboard.progress')}</h4>
                  <p className="text-base font-bold text-[var(--color-foreground)]">{enrollment.progress}% {t('dashboard.completed')}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="mx-auto w-full max-w-6xl space-y-6">
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('nav.quizzes')}</h2>
              {courseQuizzes.length === 0 ? (
                <div className="py-16 text-center text-sm opacity-60">{t('courses.noQuizzes')}</div>
              ) : (
                <div className="space-y-8">
                  {courseLevelQuizzes.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                        {t('courses.courseLevelQuizzes')}
                      </h3>
                      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {courseLevelQuizzes.map(renderQuizCard)}
                      </div>
                    </div>
                  )}
                  {chapterScopedQuizzes.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                        {t('courses.chapterQuizzes')}
                      </h3>
                      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {chapterScopedQuizzes.map(renderQuizCard)}
                      </div>
                    </div>
                  )}
                  {lessonScopedQuizzes.length > 0 && (
                    <div>
                      <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                        {t('courses.lessonQuizzes')}
                      </h3>
                      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {lessonScopedQuizzes.map(renderQuizCard)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 4. LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto space-y-6">
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
