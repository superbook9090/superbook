'use client';

import { useState, lazy, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, BookOpen, Hash, FileText, Type } from 'lucide-react';
import Alert from '@/components/ui/Alert';
import Button from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useSessionStore } from '@/store/useSessionStore';

const RichTextEditor = lazy(() => import('@/components/ui/RichTextEditor'));

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
  const { status } = useSessionStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    topic: '',
    content: '',
    language: 'en',
  });
  const [error, setError] = useState('');
  const [alertState, setAlertState] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

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
      const errorMsg = 'Please fill in all fields';
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
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
        const errorMsg = data.message || 'Failed to create blog';
        setError(errorMsg);
        setAlertState({ type: 'error', message: errorMsg });
      }
    } catch {
      const errorMsg = 'An error occurred. Please try again.';
      setError(errorMsg);
      setAlertState({ type: 'error', message: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

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
          className="inline-flex items-center text-[var(--teacher-primary)] hover:text-[var(--teacher-primary)]/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Link>
        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-foreground)]">Create New Blog</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] mt-1">Share your knowledge with students</p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="bg-[var(--card-solid)] rounded-2xl shadow-sm p-6 sm:p-8"
      >
        {error && (
          <div className="mb-6 p-4 bg-[var(--error-light)] border border-[var(--error)]/20 rounded-xl text-[var(--error)]">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <Type className="w-4 h-4 inline mr-2" />
              Blog Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter an engaging title..."
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
              maxLength={200}
            />
            <p className="text-xs text-[var(--color-muted-foreground)] mt-1">{formData.title.length}/200 characters</p>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <Hash className="w-4 h-4 inline mr-2" />
              Topic
            </label>
            <select
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
            >
              <option value="">Select a topic...</option>
              {topics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <BookOpen className="w-4 h-4 inline mr-2" />
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full min-h-[44px] px-4 py-3 bg-[var(--color-muted)] text-[var(--color-foreground)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--teacher-primary)]/20 focus:border-[var(--teacher-primary)]"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-foreground)] mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Content
            </label>
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog content here... Use the toolbar to format your text."
                theme="emerald"
              />
            </Suspense>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(false)}
              isLoading={isLoading && !isDraft}
              className="flex-1"
            >
              <Eye className="w-5 h-5 mr-2" />
              Publish Blog
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              onClick={() => setIsDraft(true)}
              isLoading={isLoading && isDraft}
              variant="secondary"
              className="flex-1 sm:flex-none"
            >
              <EyeOff className="w-5 h-5 mr-2" />
              Save as Draft
            </Button>
          </div>
        </div>
      </motion.form>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 bg-[var(--success-light)] rounded-xl p-4"
      >
        <h4 className="font-semibold text-[var(--success)] mb-2 flex items-center">
          <BookOpen className="w-4 h-4 mr-2" />
          Writing Tips
        </h4>
        <ul className="text-sm text-[var(--success)] space-y-1">
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
