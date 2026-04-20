'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  course: { _id: string; title: string };
  instructor: { _id: string; name: string };
  questions: Question[];
  timeLimit: number;
  isPublished: boolean;
  createdAt: string;
}

interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function AdminQuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    ((value: string) => {
      const timer = setTimeout(() => setSearchTerm(value), 300);
      return () => clearTimeout(timer);
    }),
    []
  );

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchQuizzes();
    }
  }, [session, status]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('/api/quizzes');
      if (!response.ok) throw new Error('Failed to fetch quizzes');
      const data = await response.json();
      setQuizzes(data.quizzes || []);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to fetch quizzes' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePublish = async (quizId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update quiz');
      setMessage({ type: 'success', text: 'Quiz updated successfully' });
      fetchQuizzes();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update quiz' });
    }
  };

  const handleDelete = async (quizId: string) => {
    try {
      const response = await fetch(`/api/quizzes/${quizId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete quiz');
      setMessage({ type: 'success', text: 'Quiz deleted successfully' });
      setDeleteId(null);
      fetchQuizzes();
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to delete quiz' });
    }
  };

  const filteredQuizzes = quizzes.filter(quiz => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quiz.instructor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && quiz.isPublished) ||
                         (filter === 'draft' && !quiz.isPublished);
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return <Loader variant="inline" size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-3 bg-indigo-100 rounded-xl">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">All Quizzes</h1>
          <p className="text-gray-500 mt-1">Manage all quizzes on the platform</p>
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
        className="bg-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search quizzes..."
            defaultValue={searchTerm}
            onChange={(e) => debouncedSearchHandler(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
            className="px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="all">All Quizzes</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-indigo-600">{quizzes.length}</p>
          <p className="text-sm text-gray-500">Total Quizzes</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{quizzes.filter(q => q.isPublished).length}</p>
          <p className="text-sm text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{quizzes.filter(q => !q.isPublished).length}</p>
          <p className="text-sm text-gray-500">Drafts</p>
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
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <Badge variant={quiz.isPublished ? 'primary' : 'default'} size="sm">
                    {quiz.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {quiz.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {quiz.description || 'No description'}
                </p>

                {/* Meta */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="w-4 h-4 mr-2" />
                    {quiz.course.title}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    {quiz.questions.length} questions
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleTogglePublish(quiz._id, quiz.isPublished)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    {quiz.isPublished ? (
                      <>
                        <EyeOff className="w-4 h-4 mr-1" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 mr-1" />
                        Publish
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setDeleteId(quiz._id)}
                    className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Delete Confirmation */}
              {deleteId === quiz._id && (
                <div className="px-6 pb-6">
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-800 mb-3">
                      Are you sure you want to delete this quiz? This action cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className={`flex-1 px-3 py-2 bg-gradient-to-r ${theme.gradient} text-white rounded-lg hover:opacity-90 transition-colors text-sm`}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteId(null)}
                        className="flex-1 px-3 py-2 bg-white text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm"
                      >
                        Cancel
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
