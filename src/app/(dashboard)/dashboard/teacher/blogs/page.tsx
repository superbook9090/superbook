'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  BookOpen,
  Search,
  Filter,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

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
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useTranslation();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [languageFilter, setLanguageFilter] = useState<'all' | 'en' | 'hi'>('all');
  const [featureEnabled, setFeatureEnabled] = useState(true);
  const [checkingFeature, setCheckingFeature] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    // Check if blogs feature is enabled
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!data.featureToggles?.enableBlogs) {
          setFeatureEnabled(false);
          router.push('/dashboard/teacher');
        }
      })
      .catch(err => console.error('Error fetching settings:', err))
      .finally(() => setCheckingFeature(false));
  }, [router]);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (languageFilter !== 'all') {
        params.append('language', languageFilter);
      }
      const url = `/api/blogs${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      // Filter blogs by current user
      const myBlogs = data.blogs.filter(
        (blog: Blog) => blog.author?._id === session?.user?.id
      );
      setBlogs(myBlogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && featureEnabled) {
      fetchBlogs();
    }
  }, [status, router, languageFilter, featureEnabled]);

  if (checkingFeature) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!featureEnabled) {
    return null; // Will redirect
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      const response = await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBlogs(blogs.filter(blog => blog._id !== id));
      } else {
        alert('Failed to delete blog');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Failed to delete blog');
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
        setBlogs(
          blogs.map(blog =>
            blog._id === id ? { ...blog, isPublished: !currentStatus } : blog
          )
        );
      }
    } catch (error) {
      console.error('Error updating blog:', error);
    }
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
                         (filter === 'published' && blog.isPublished) ||
                         (filter === 'draft' && !blog.isPublished);
    const matchesLanguage = languageFilter === 'all' || blog.language === languageFilter;
    return matchesSearch && matchesFilter && matchesLanguage;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Blogs</h1>
          <p className="text-gray-500 mt-1">Manage your blog posts and content</p>
        </div>
        <Link
          href="/dashboard/teacher/blogs/create"
          className="inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Blog
        </Link>
      </motion.div>

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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="all">All Blogs</option>
              <option value="published">Published</option>
              <option value="draft">Drafts</option>
            </select>
          </div>

          {/* Language Filter */}
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-gray-400" />
            <select
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value as 'all' | 'en' | 'hi')}
              className="px-4 py-2.5 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
        className="grid grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">{blogs.length}</p>
          <p className="text-sm text-gray-500">Total Blogs</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-emerald-600">
            {blogs.filter(b => b.isPublished).length}
          </p>
          <p className="text-sm text-gray-500">Published</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-2xl font-bold text-gray-600">
            {blogs.filter(b => !b.isPublished).length}
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
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
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
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Blog
              </Link>
            )}
          </div>
        ) : (
          filteredBlogs.map((blog, index) => (
            <motion.div
              key={blog._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{blog.title}</h3>
                    <Badge
                      variant={blog.isPublished ? 'success' : 'default'}
                      size="sm"
                    >
                      {blog.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <Badge variant="primary" size="sm">{blog.topic}</Badge>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(blog._id, blog.isPublished)}
                    className={`p-2 rounded-lg transition-colors ${
                      blog.isPublished
                        ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={blog.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {blog.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <Link
                    href={`/dashboard/teacher/blogs/edit/${blog._id}`}
                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(blog._id)}
                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
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
    </div>
  );
}
