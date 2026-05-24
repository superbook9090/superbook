'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/utils';
import { 
  useEnrollments, 
  useQuizzes, 
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
import CourseLeaderboard from '@/features/courses/components/CourseLeaderboard';
import { flattenCurriculumLessons } from '@/lib/curriculum/tree';
import type { Lesson } from '@/lib/react-query/hooks';

type TabType = 'curriculum' | 'overview' | 'quizzes' | 'leaderboard';

export default function CourseDetailPage() {
  const { status, session } = useSessionStore();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('curriculum');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  const courseId = params.id as string;

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useEnrollments();
  const { data: allQuizzes = [], isLoading: quizzesLoading } = useQuizzes('public');
  const { data: curriculum = [], isLoading: curriculumLoading } = useCourseCurriculum(courseId);
  const allLessons = useMemo(() => flattenCurriculumLessons(curriculum), [curriculum]);
  const { data: attempts = [], isLoading: attemptsLoading } = useQuizAttempts();
  const startQuizMutation = useStartQuizAttempt();

  const enrollment = useMemo(() => enrollments.find(e => e.course._id === courseId), [enrollments, courseId]);
  
  const courseQuizzes = useMemo(() => {
    return allQuizzes.filter(q => q.course?._id === courseId && q.isPublished);
  }, [allQuizzes, courseId]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      const data = await startQuizMutation.mutateAsync(quizId);
      router.push(`/dashboard/student/quizzes/take?attemptId=${data.attempt._id}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleContinueQuiz = (attemptId: string) => {
    router.push(`/dashboard/student/quizzes/take?attemptId=${attemptId}`);
  };

  const handleReviewQuiz = (attemptId: string) => {
    router.push(`/dashboard/student/quizzes/${attemptId}/result`);
  };

  const handleStartLesson = (lessonId: string) => {
    router.push(`/dashboard/student/courses/${courseId}/lessons/${lessonId}`);
  };

  const renderLessonRow = (lesson: Lesson) => (
    <div
      key={lesson._id}
      onClick={() => handleStartLesson(lesson._id)}
      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group/lesson"
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
            lesson.videoUrl ? 'bg-blue-50 text-blue-500' : 'bg-orange-50 text-orange-500'
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
  );

  const getQuizStatus = (quizId: string) => {
    const quizAttempts = attempts.filter(a => a.quiz._id === quizId);
    if (quizAttempts.length === 0) return { status: 'available' as const };
    
    const completed = quizAttempts.find(a => a.status === 'completed');
    if (completed) return { status: 'completed' as const, attempt: completed };
    
    const inProgress = quizAttempts.find(a => a.status === 'in_progress');
    if (inProgress) return { status: 'in_progress' as const, attempt: inProgress };
    
    return { status: 'available' as const };
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
        <button onClick={() => router.push('/dashboard/student/courses')} className="px-6 py-2 bg-[var(--student-primary)] text-white rounded-xl font-medium">
          {t('courses.backToCourses')}
        </button>
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
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)] p-6 sm:p-8 text-white shadow-xl"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10 space-y-4">
          <button 
            onClick={() => router.push('/dashboard/student/courses')}
            className="flex items-center gap-2 text-xs font-medium text-white/80 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {t('courses.backToCourses')}
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-white/80">
                <span className="px-2.5 py-0.5 bg-white/20 rounded-lg backdrop-blur-sm text-xs font-medium">{course.category || t('courses.course')}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {allLessons.length} {t('dashboard.lessons')}</span>
                <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {courseQuizzes.length} {t('nav.quizzes')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">{t('courses.progress')}</p>
                <p className="text-2xl font-bold leading-none mt-1">{enrollment.progress}%</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs - Aligned with dashboard cards style */}
      <div className="rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 bg-gray-50/50 border-b border-[var(--border)] sticky top-0 z-20 backdrop-blur-md overflow-x-auto no-scrollbar">
          {[
            { id: 'curriculum', label: t('courses.courseContent'), icon: <BookOpen className="w-4 h-4" /> },
            { id: 'overview', label: t('common.overview'), icon: <Info className="w-4 h-4" /> },
            { id: 'quizzes', label: t('nav.quizzes'), icon: <Target className="w-4 h-4" /> },
            { id: 'leaderboard', label: t('courses.leaderboard'), icon: <Trophy className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id 
                  ? "bg-white text-[var(--student-primary)] shadow-sm" 
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
                <button 
                  onClick={() => allLessons[0] && handleStartLesson(allLessons[0]._id)}
                  className="flex items-center gap-2 px-5 py-2 bg-[var(--student-primary)] text-white rounded-lg text-sm font-bold shadow-md hover:opacity-90 transition-opacity"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  {enrollment.progress > 0 ? t('courses.continue') : t('courses.start')}
                </button>
              </div>

              <div className="space-y-4">
                {curriculum.map((chapter, idx) => (
                  <div key={chapter._id} className="group/chapter">
                    <div className={cn(
                      "rounded-xl border transition-all duration-200",
                      expandedChapters[chapter._id] ? "bg-white border-[var(--student-primary)]/30 shadow-sm" : "bg-gray-50/30 border-[var(--border)] hover:border-[var(--student-primary)]/20"
                    )}>
                      <button 
                        onClick={() => toggleChapter(chapter._id)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all",
                            expandedChapters[chapter._id] ? "bg-[var(--student-primary)] text-white" : "bg-white text-[var(--color-muted-foreground)] border border-[var(--border)]"
                          )}>
                            {idx + 1}
                          </div>
                          <h3 className="font-semibold text-[var(--color-foreground)]">{chapter.title}</h3>
                        </div>
                        <ChevronDown className={cn("w-4 h-4 transition-transform", expandedChapters[chapter._id] && "rotate-180")} />
                      </button>

                      {expandedChapters[chapter._id] && (
                        <div className="border-t border-[var(--border)] divide-y divide-[var(--border)] bg-white rounded-b-xl overflow-hidden">
                          {chapter.lessons?.map(renderLessonRow)}
                          {chapter.subChapters?.map((sub) => (
                            <div key={sub._id} className="bg-gray-50/40">
                              <button
                                type="button"
                                onClick={() => toggleChapter(sub._id)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
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
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">{t('dashboard.progress')}</h4>
                  <p className="text-base font-bold text-emerald-900">{enrollment.progress}% {t('dashboard.completed')}</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('nav.quizzes')}</h2>
              <div className="grid gap-4">
                {courseQuizzes.length === 0 ? (
                  <div className="text-center py-16 opacity-60 text-sm">{t('courses.noQuizzes')}</div>
                ) : (
                  courseQuizzes.map(quiz => {
                    const statusInfo = getQuizStatus(quiz._id);
                    return (
                      <div key={quiz._id} className="bg-white border border-[var(--border)] p-4 sm:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center">
                            {statusInfo.status === 'completed' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <Target className="w-5 h-5 text-gray-400" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-[var(--color-foreground)]">{quiz.title}</h4>
                            <p className="text-[10px] font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                              {quiz.questionCount} {t('dashboard.questions')} • {quiz.timeLimit} {t('dashboard.mins')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            if (statusInfo.status === 'available') handleStartQuiz(quiz._id);
                            else if (statusInfo.status === 'in_progress' && statusInfo.attempt) handleContinueQuiz(statusInfo.attempt._id);
                            else if (statusInfo.status === 'completed' && statusInfo.attempt) handleReviewQuiz(statusInfo.attempt._id);
                          }}
                          className={cn(
                            "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                            statusInfo.status === 'completed' 
                              ? "bg-gray-100 text-gray-600" 
                              : "bg-[var(--student-primary)] text-white hover:opacity-90"
                          )}
                        >
                          {statusInfo.status === 'completed' ? t('courses.review') : statusInfo.status === 'in_progress' ? t('courses.continue') : t('courses.start')}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* 4. LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[var(--color-foreground)]">{t('courses.leaderboard')}</h2>
                <Trophy className="w-6 h-6 text-amber-500" />
              </div>
              <div className="bg-gray-50/50 rounded-2xl border border-[var(--border)] overflow-hidden">
                <CourseLeaderboard
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
    </div>
  );
}
