'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Hash,
  FileText,
  Type,
} from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import Alert from '@/components/ui/Alert';
import Loader from '@/components/ui/Loader';

const topics = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Literature',
  'Other',
];

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  isPublished: boolean;
}

export default function EditBlogPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const blogId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    isPublished: true,
  });
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && blogId) {
      fetchBlog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, blogId]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${blogId}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const blog: Blog = await response.json();

      setFormData({
        title: blog.title,
        topic: blog.topic,
        content: blog.content,
        isPublished: blog.isPublished,
      });
    } catch {
      const errorMsg = 'Failed to load blog';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check if content is empty (handles HTML tags)
  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    if (!formData.title.trim() || !formData.topic || isContentEmpty(formData.content)) {
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished: !saveAsDraft,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/teacher/blogs');
      } else {
        const data = await response.json();
        const errorMsg = data.message || 'Failed to update blog';
        setError(errorMsg);
        setAlertState({ type: 'error', message: errorMsg });
      }
    } catch {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {alertState && (
        <Alert
          type={alertState.type}
          message={alertState.message}
          onClose={() => setAlertState(null)}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Link
          href="/dashboard/teacher/blogs"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Blog</h1>
        <p className="text-gray-500 mt-1">Update your blog post</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-sm p-6 sm:p-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter an engaging title..."
              className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              maxLength={200}
            />
            <p className="text-xs text-gray-400 mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Topic
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Content
            </label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Write your blog content here... Use the toolbar to format your text."
              theme="emerald"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, false)}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {isSaving && formData.isPublished ? (
                <Loader variant="button" size="sm" />
              ) : (
                <Eye className="w-5 h-5 mr-2" />
              )}
              {formData.isPublished ? 'Update & Publish' : 'Publish'}
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={(e) => handleSubmit(e, true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-all"
            >
              {isSaving && !formData.isPublished ? (
                <Loader variant="button" size="sm" />
              ) : (
                <EyeOff className="w-5 h-5 mr-2" />
              )}
              Save as Draft
            </button>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
