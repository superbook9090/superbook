'use client';

import React from 'react';
import Link from 'next/link';
import { Newspaper, Plus } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { AdminPageBanner } from '@/features/admin/components/AdminPageBanner';

export function AdminBlogsHero({ isSuperAdmin = false }: { isSuperAdmin?: boolean }) {
  const { t } = useTranslation();

  return (
    <AdminPageBanner
      icon={Newspaper}
      eyebrow={t('admin.manageBlogs')}
      title={t('admin.manageBlogs')}
      description={t('admin.manageBlogsDesc')}
      tier={isSuperAdmin ? 'superadmin' : 'admin'}
      actions={
        <Link
          href={ROUTES.teacher.blogCreate}
          className="teacher-cta-btn min-h-[44px] px-4 text-xs sm:text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{t('blog.createBlog')}</span>
        </Link>
      }
    />
  );
}
