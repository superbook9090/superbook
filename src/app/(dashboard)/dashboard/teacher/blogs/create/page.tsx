'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  BookOpen,
  Hash,
  FileText,
  Type,
} from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

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

export default function CreateBlogPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
  });
  const [error, setError] = useState('');

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  // Helper to check if content is empty (handles HTML tags)
  const isContentEmpty = (html: string) => {
    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.title.trim() || !formData.topic || isContentEmpty(formData.content)) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isPublished: !isDraft,
        }),
      });

      if (response.ok) {
        router.push('/dashboard/teacher/blogs');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create blog');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create New Blog</h1>
        <p className="text-gray-500 mt-1">Share your knowledge with students</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
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
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(false)}
              className="flex-1 flex items-center justify-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg disabled:opacity-60 transition-all"
            >
              {isLoading && !isDraft ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Eye className="w-5 h-5 mr-2" />
              )}
              Publish Blog
            </button>

            <button
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(true)}
              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 disabled:opacity-60 transition-all"
            >
              {isLoading && isDraft ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <EyeOff className="w-5 h-5 mr-2" />
              )}
              Save as Draft
            </button>
          </div>
        </div>
      </motion.form>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-emerald-50 rounded-xl p-4"
      >
        <h4 className="font-semibold text-emerald-800 mb-2 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Writing Tips
        </h4>
        <ul className="text-sm text-emerald-700 space-y-1">
          <li>• Use clear, descriptive titles</li>
          <li>• Break content into sections with headings</li>
          <li>• Use lists to organize information</li>
          <li>• Add links to reference materials</li>
          <li>• Check for spelling and grammar</li>
        </ul>
      </motion.div>
    </div>
  );
}
