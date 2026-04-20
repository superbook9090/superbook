'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { debounce } from '@/lib/debounce';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  BookOpen,
  Search,
  Filter,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Edit2,
  Plus,
} from 'lucide-react';
import Loader from '@/components/ui/Loader';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import ConfirmModal from '@/components/ui/ConfirmModal';
import useSWR from 'swr';
import { fetcher } from '@/lib/swrFetcher';
import { useSessionStore } from '@/store/useSessionStore';

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  language: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  author?: { _id: string; name: string };
}

interface FeatureToggles {
  enableBlogs: boolean;
  enableQuizzes: boolean;
  enableCourses: boolean;
  enableAnalytics: boolean;
}

export default function TeacherBlogsPage() {
  const session = useSessionStore((s) => s.session);
  const status = useSessionStore((s) => s.status);
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Debounced search handler
  const debouncedSearchHandler = useCallback(
    debounce((value: string) => setSearchTerm(value), 300),
    []
  );

  // SWR hook for data fetching with automatic caching and deduplication
  const { data: blogsData, mutate } = useSWR(session ? '/api/blogs?includeDrafts=true' : null, fetcher);

  // Filter blogs by current user
  const allBlogs = blogsData?.blogs || [];
  const blogs = allBlogs.filter(
    (blog: Blog) => blog.author?._id === session?.user?.id
  );

  const isLoading = status === 'loading' || !blogsData;

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/blogs/${deleteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutate(); // Revalidate SWR cache
        setShowDeleteModal(false);
        setDeleteId(null);
      } else {
        setAlertState({ type: 'error', message: 'Failed to delete blog' });
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      setAlertState({ type: 'error', message: 'Failed to delete blog' });
    }
  };

  const togglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });

      if (response.ok) {
        mutate(); // Revalidate SWR cache
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  const filteredBlogs = blogs.filter((blog: Blog) => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && blog.isPublished) ||
                         (filter === 'draft' && !blog.isPublished);
    const matchesLanguage = languageFilter === 'all' || blog.language === languageFilter;
    return matchesSearch && matchesFilter && matchesLanguage;
  });

  if (isLoading) {
    return <Loader variant="inline" size="lg" />;
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Blogs</h1>
          <p className="text-gray-500 mt-1">Manage your blog posts and content</p>
        </div>
        <Link
          href="/dashboard/teacher/blogs/create"
          className={`inline-flex items-center justify-center px-4 py-2.5 sm:w-auto w-full bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all`}
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Blog
        </Link>
      </motion.div>

      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search blogs..."
              defaultValue={searchTerm}
              onChange={(e) => debouncedSearchHandler(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Blogs</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400 flex-shrink-0" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'hi')}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Languages</option>
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>{blogs.length}</p>
          <p className="text-sm text-gray-500">Total Blogs</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className={`text-2xl font-bold ${theme.text}`}>
            {blogs.filter((b: Blog) => b.isPublished).length}
          </p>
          <p className="text-sm text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-600">
            {blogs.filter((b: Blog) => !b.isPublished).length}
          </p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
      </motion.div>

      {/* Blogs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-sm">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No blogs found' : 'No blogs yet'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchTerm
                ? 'Try adjusting your search or filters'
                : 'Create your first blog post to get started'}
            </p>
            {!searchTerm && (
              <Link
                href="/dashboard/teacher/blogs/create"
                className={`inline-flex items-center justify-center px-4 py-2.5 sm:w-auto w-full bg-gradient-to-r ${theme.gradient} text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all touch-manipulation`}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Blog
              </Link>
            )}
          </div>
        ) : (
          filteredBlogs.map((blog: Blog, index: number) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{blog.title}</h3>
                    <Badge
                      variant={blog.isPublished ? 'success' : 'default'}
                      size="sm"
                    >
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <Badge variant="primary" size="sm">{blog.topic}</Badge>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-1">
                  <button
                    onClick={() => togglePublish(blog._id, blog.isPublished)}
                    className={`p-2.5 sm:p-2 rounded-lg transition-colors touch-manipulation ${
                      blog.isPublished
                        ? `${theme.activeBg} ${theme.text} hover:opacity-80`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {blog.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <Link
                    href={`/dashboard/teacher/blogs/edit/${blog._id}`}
                    className="p-2.5 sm:p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2.5 sm:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors touch-manipulation"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this blog? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeleteId(null);
        }}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
