'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';

export function AdminBlogsHero() {
  const { t } = useTranslation();

  return (
    <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
      <div className="space-y-1.5 max-w-xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shadow-xs">
          <Newspaper className="w-3.5 h-3.5" />
          <span>{t('admin.manageBlogs') || 'All Platform Blogs'}</span>
        </div>
        <h1 className="heading-xl">{t('admin.manageBlogs') || 'Blog Management'}</h1>
        <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
          {t('admin.manageBlogsDesc') || 'Review, publish, and moderate educational articles across the entire platform.'}
        </p>
      </div>

      <Link
        href={ROUTES.teacher.blogCreate}
        className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all self-start sm:self-auto"
      >
        <Plus className="w-4 h-4" />
        <span>{t('blog.createBlog') || 'Create Blog'}</span>
      </Link>
    </div>
  );
}
