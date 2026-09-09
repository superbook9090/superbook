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
import { useSettingsStore } from '@/store/useSettingsStore';

export default function CourseDetailPage() {
  const { status, session } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const pathname = usePathname();

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

  if (status === 'loading' || enrollmentsLoading || quizzesLoading || curriculumLoading || attemptsLoading) {
    return <PageSkeleton />;
  }

  if (!enrollment) {
    return <EmptyEnrollmentState t={t} />;
  }

  const { course } = enrollment;

  return (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      <CourseHeader
        courseTitle={course.title}
        category={course.category || ''}
        thumbnail={course.thumbnail || course.thumbnailUrl}
        chaptersCount={curriculum.length}
        lessonsCount={allLessons.length}
        quizzesCount={courseQuizzes.length}
        progress={enrollment.progress}
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
            <CourseLeaderboardTab
              courseId={courseId}
              courseTitle={enrollment.course.title}
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
    </div>
  );
}
