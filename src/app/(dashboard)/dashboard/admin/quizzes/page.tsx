'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  BookOpen,
} from 'lucide-react';
import { PageSkeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import { useSessionStore } from '@/store/useSessionStore';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDate } from '@/lib/dateUtils';
import { listQuizzesAll, patchQuiz, deleteQuiz } from '@/lib/api/quizzes';
import { ApiClientError } from '@/lib/api/http';
import DashboardListFilters, { FilterPanel } from '@/components/filters/DashboardListFilters';
import { buildPublishStatusOptions, type PublishStatusFilter } from '@/components/filters/publishStatusOptions';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  instructor: { _id: string; name: string };
  questionCount?: number;
  timeLimit: number;
  isPublished: boolean;
  createdAt: string;
}

export default function AdminQuizzesPage() {
  const { session, status } = useSessionStore();
  const router = useRouter();
  const { theme } = useRoleTheme();
  const { t } = useTranslation();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<PublishStatusFilter>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const clearFilters = () => {
    setSearchQuery('');
    setFilter('all');
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchQuizzes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchQuizzes = async () => {
    try {
      const data = await listQuizzesAll();
      setQuizzes((data.quizzes || []) as Quiz[]);
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedFetchQuizzes');
      setMessage({ type: 'error', text });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      await patchQuiz(quizId, { isPublished: !currentStatus });
      setMessage({ type: 'success', text: t('admin.quizUpdated') });
      fetchQuizzes();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedUpdateQuiz');
      setMessage({ type: 'error', text });
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      await deleteQuiz(quizId);
      setMessage({ type: 'success', text: t('admin.quizDeleted') });
      setDeleteId(null);
      fetchQuizzes();
    } catch (err) {
      const text =
        err instanceof ApiClientError ? err.message : t('admin.failedDeleteQuiz');
      setMessage({ type: 'error', text });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         quiz.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && quiz.isPublished) ||
                         (filter === 'draft' && !quiz.isPublished);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className={`p-3 ${theme.activeBg} rounded-xl`}>
          <HelpCircle className={`w-6 h-6 ${theme.text}`} />
        </div>
        <div>
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">{t('common.allQuizzes')}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">{t('admin.manageQuizzesDesc')}</p>
        </div>
      </motion.div>

      {/* Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Alert
            type={message.type}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <FilterPanel>
          <DashboardListFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClear={clearFilters}
            searchPlaceholder={t('admin.searchQuizzes')}
            segmentedFilter={{
              value: filter,
              onChange: (id) => setFilter(id as PublishStatusFilter),
              neutralValue: 'all',
              options: buildPublishStatusOptions({
                all: t('admin.allQuizzes'),
                published: t('common.published'),
                draft: t('common.draft'),
              }),
            }}
          />
        </FilterPanel>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{quizzes.length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('admin.totalQuizzes')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{quizzes.filter(q => q.isPublished).length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('common.published')}</p>
        </div>
        <div className="bg-[var(--card-solid)] rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{quizzes.filter(q => !q.isPublished).length}</p>
          <p className="text-sm text-[var(--color-muted-foreground)]">{t('common.draft')}</p>
        </div>
      </motion.div>

      {/* Quizzes Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredQuizzes.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-[var(--card-solid)] rounded-2xl shadow-sm">
            <HelpCircle className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-2">{t('admin.noQuizzesFound')}</h3>
            <p className="text-[var(--color-muted-foreground)]">{t('admin.adjustSearch')}</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[var(--card-solid)] rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-accent)] text-white">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
                    {quiz.isPublished ? t('common.published') : t('common.draft')}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-[var(--color-foreground)] mb-2 line-clamp-2">
                  {quiz.title}
                </h3>

                {/* Description */}
                <p className="text-[var(--color-muted-foreground)] text-sm mb-4 line-clamp-2">
                  {quiz.description || t('courses.noDescription')}
                </p>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {quiz.course.title}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {t('admin.questions', { count: quiz.questionCount ?? 0 })}
                  </div>
                  <div className="flex items-center text-sm text-[var(--color-muted-foreground)]">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(quiz.createdAt)}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                  <button
                    onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                    className="flex-1 flex items-center justify-center min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--color-surface-muted)] text-[var(--color-foreground)] rounded-lg hover:bg-[var(--color-surface-muted)]/80 transition-colors text-sm"
                  >
                    {quiz.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        {t('admin.unpublish')}
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        {t('admin.publish')}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(quiz._id)}
                    className="px-3 py-2 min-h-[44px] sm:min-h-0 bg-[var(--error-light)] text-[var(--error)] rounded-lg hover:bg-[var(--error-light)]/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteId === quiz._id && (
                <div className="px-6 pb-6">
                  <div className="bg-[var(--error-light)] border border-[var(--error)] rounded-xl p-4">
                    <p className="text-sm text-[var(--error)] mb-3">
                      {t('admin.deleteQuizConfirm')}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className={`flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90 transition-colors text-sm`}
                      >
                        {t('common.delete')}
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 bg-[var(--card-solid)] text-[var(--error)] border border-[var(--error)] rounded-lg hover:bg-[var(--error-light)] transition-colors text-sm"
                      >
                        {t('common.cancel')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
