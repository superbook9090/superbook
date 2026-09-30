'use client';

import { ROUTES } from '@/constants/routes';
import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams, useSearchParams, usePathname } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import {
  useEnrollments,
  useCourseQuizzes,
  useQuizAttempts,
  useCourseCurriculum,
  type Quiz,
} from '@/lib/react-query/hooks';
import {
  LazyCurriculumQuizRow,
  LazyQuizCard,
  LazyQuizStartConfirmModal,
} from '@/lib/lazy';
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
import { DoubtsTab } from './_components/DoubtsTab';
import { CourseDetailNavTabs, type TabType } from './_components/CourseDetailNavTabs';
import { CourseLeaderboardTab } from './_components/CourseLeaderboardTab';
import { EmptyEnrollmentState } from './_components/EmptyEnrollmentState';
import { useCourseQuizActions } from './_components/useCourseQuizActions';
import { useCurriculumAccordion } from './_components/useCurriculumAccordion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAlert } from '@/components/ui/AlertContainer';
import { isSuperAdmin } from '@/lib/roles';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AiCourseActionModal, type AiActionType } from './_components/AiCourseActionModal';

export default function CourseDetailPage() {
  const { status, session, fetchSession } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    if (!session) {
      void fetchSession();
    }
  }, [session, fetchSession]);

  const { isFeatureEnabled } = useSettingsStore();
  const doubtsEnabled = isFeatureEnabled('enableCourseDoubts');

  const tabParam = searchParams.get('tab') as TabType;
  const validTabs: TabType[] = ['curriculum', 'overview', 'quizzes', 'leaderboard', ...(doubtsEnabled ? ['doubts' as TabType] : [])];
  const initialTab = validTabs.includes(tabParam) ? tabParam : 'curriculum';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const courseId = params.id as string;

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { quizzes: courseQuizzes, isLoading: quizzesLoading } = useCourseQuizzes(courseId, { publishedOnly: true });
  const { data: curriculum = [], isLoading: curriculumLoading } = useCourseCurriculum(courseId);
  const allLessons = useMemo(() => flattenCurriculumLessons(curriculum), [curriculum]);
  const { data: attempts = [], isLoading: attemptsLoading } = useQuizAttempts();

  const { expandedChapters, allExpanded, toggleAllChapters, toggleChapter } = useCurriculumAccordion(curriculum);

  const {
    startingQuizId,
    confirmQuiz,
    setConfirmQuiz,
    getQuizStatus,
    handleCurriculumQuizAction,
    handleConfirmQuizAction,
  } = useCourseQuizActions(attempts);

  const queryClient = useQueryClient();
  const { addAlert } = useAlert();
  const isSuperAdminUser =
    isSuperAdmin(session?.user?.role) ||
    (session?.user as { role?: string } | undefined)?.role === 'superadmin';

  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    action: AiActionType | null;
    chapter?: { _id: string; title: string } | null;
    lesson?: { _id: string; title: string } | null;
  }>({ isOpen: false, action: null, chapter: null, lesson: null });

  const handleOpenAiModal = (
    action: AiActionType,
    chapter?: { _id: string; title: string },
    lesson?: { _id: string; title: string }
  ) => {
    setAiModal({ isOpen: true, action, chapter: chapter || null, lesson: lesson || null });
  };

  const handleAiModalSuccess = (message: string) => {
    addAlert({ type: 'success', message });
    queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'curriculum'] });
    queryClient.invalidateQueries({ queryKey: ['courses', courseId, 'quizzes'] });
  };

  const enrollment = useMemo(() => enrollments.find((e) => e.course._id === courseId), [enrollments, courseId]);

  // If superadmin is not enrolled, load course data directly
  const { data: directCourse, isLoading: directCourseLoading } = useQuery({
    queryKey: ['courses', courseId, 'direct'],
    queryFn: async () => {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.course || null;
    },
    enabled: !!courseId && isSuperAdminUser && !enrollment,
  });

  const course = enrollment?.course || directCourse;
  const courseProgress = enrollment?.progress ?? 0;

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

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('tab', tab);
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
  };

  const handleStartLesson = (lessonId: string) => {
    sessionStorage.setItem(`lesson-active:${courseId}`, '1');
    router.push(ROUTES.student.lesson(courseId, lessonId));
  };

  if (
    status === 'loading' ||
    enrollmentsLoading ||
    quizzesLoading ||
    curriculumLoading ||
    attemptsLoading ||
    (isSuperAdminUser && !enrollment && directCourseLoading)
  ) {
    return <PageSkeleton />;
  }

  if (!course) {
    return <EmptyEnrollmentState t={t} />;
  }

  return (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      <CourseHeader
        courseTitle={course.title}
        category={course.category || ''}
        thumbnail={course.thumbnail || course.thumbnailUrl}
        chaptersCount={curriculum.length}
        lessonsCount={allLessons.length}
        quizzesCount={courseQuizzes.length}
        progress={courseProgress}
        t={t}
      />

      <div className="rounded-2xl border border-[var(--border)] antigravity-glass shadow-lg overflow-hidden flex flex-col">
        <CourseDetailNavTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          courseQuizzesCount={courseQuizzes.length}
          doubtsEnabled={doubtsEnabled}
          t={t}
        />

        <div className="flex-1 p-3.5 sm:p-5">
          {activeTab === 'curriculum' && (
            <CurriculumTab
              curriculumWithQuizzes={curriculumWithQuizzes as unknown as ChapterWithQuizzes[]}
              courseLevelQuizzes={courseLevelQuizzes}
              expandedChapters={expandedChapters}
              toggleChapter={toggleChapter}
              toggleAllChapters={toggleAllChapters}
              allExpanded={allExpanded}
              isSuperAdmin={isSuperAdminUser}
              onOpenAiModal={handleOpenAiModal}
              renderLessonRow={(lesson, chapterId, chapterTitle) => (
                <CurriculumLessonRow
                  key={lesson._id}
                  lesson={lesson}
                  onStartLesson={handleStartLesson}
                  getQuizStatus={getQuizStatus}
                  onQuizAction={handleCurriculumQuizAction}
                  startingQuizId={startingQuizId}
                  confirmQuizId={confirmQuiz?.quizId}
                  isSuperAdmin={isSuperAdminUser}
                  onOpenAiModal={handleOpenAiModal}
                  chapterId={chapterId}
                  chapterTitle={chapterTitle}
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
              enrollmentProgress={courseProgress}
              t={t}
            />
          )}

          {activeTab === 'overview' && (
            <OverviewTab description={course.description || ''} category={course.category || ''} progress={courseProgress} t={t} />
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
            <CourseLeaderboardTab
              courseId={courseId}
              courseTitle={course.title}
              currentUserId={session?.user?.id}
              t={t}
            />
          )}

          {activeTab === 'doubts' && doubtsEnabled && (
            <DoubtsTab courseId={courseId} />
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

      <AiCourseActionModal
        isOpen={aiModal.isOpen}
        onClose={() => setAiModal({ isOpen: false, action: null, chapter: null, lesson: null })}
        actionType={aiModal.action}
        courseId={courseId}
        courseTitle={course?.title || ''}
        chapter={aiModal.chapter}
        lesson={aiModal.lesson}
        onSuccess={handleAiModalSuccess}
        onError={(msg) => addAlert({ type: 'error', message: msg })}
      />
    </div>
  );
}
