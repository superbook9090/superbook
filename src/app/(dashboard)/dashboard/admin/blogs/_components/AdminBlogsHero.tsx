'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Newspaper, Plus, Sparkles, Check, Loader2 } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';
import { useSessionStore } from '@/store/useSessionStore';
import { isSuperAdmin, isAdmin } from '@/lib/roles';
import { useAlert } from '@/components/ui/AlertContainer';
import { useQueryClient } from '@tanstack/react-query';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface Props {
  onSeedSuccess?: () => void;
}

export function AdminBlogsHero({ onSeedSuccess }: Props) {
  const { t } = useTranslation();
  const { session } = useSessionStore();
  const { addAlert } = useAlert();
  const queryClient = useQueryClient();

  const [showConfirm, setShowConfirm] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [hasSeeded, setHasSeeded] = useState(false);
  const canSeed = isSuperAdmin(session?.user?.role) || isAdmin(session?.user?.role);

  React.useEffect(() => {
    if (!canSeed) return;
    let isMounted = true;
    fetch('/api/admin/blogs/seed')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.isSeeded) {
          setHasSeeded(true);
        }
      })
      .catch(() => {
        // Silently ignore check errors
      });
    return () => {
      isMounted = false;
    };
  }, [canSeed]);

  const handleSeed = async () => {
    setIsSeeding(true);
    setShowConfirm(false);
    try {
      const res = await fetch('/api/admin/blogs/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to seed articles');
      }

      setHasSeeded(true);
      addAlert({
        type: 'success',
        message:
          data.message ||
          'Successfully seeded 8 educational articles and unpublished test drafts for Google AdSense compliance!',
      });
      await queryClient.invalidateQueries({ queryKey: ['blogs'] });
      onSeedSuccess?.();
    } catch (err) {
      addAlert({
        type: 'error',
        message: (err as Error).message || 'Failed to seed articles',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <>
      <div className="hero-banner flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 sm:p-8 rounded-3xl">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--teacher-soft)] text-[var(--teacher-primary)] border border-[var(--teacher-border)] shadow-xs">
            <Newspaper className="w-3.5 h-3.5" />
            <span>{t('admin.manageBlogs') || 'All Platform Blogs'}</span>
          </div>
          <h1 className="heading-xl">{t('admin.manageBlogs') || 'Blog Management'}</h1>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)]">
            {t('admin.manageBlogsDesc') ||
              'Review, publish, and moderate educational articles across the entire platform.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {canSeed && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isSeeding || hasSeeded}
              className={`inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all ${
                hasSeeded
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 cursor-default'
                  : 'bg-[var(--primary)] text-white border-transparent hover:opacity-90 shadow-md'
              }`}
            >
              {isSeeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Seeding Articles...</span>
                </>
              ) : hasSeeded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Articles Seeded ✓</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Seed AdSense Articles</span>
                </>
              )}
            </button>
          )}

          <Link
            href={ROUTES.teacher.blogCreate}
            className="btn-premium inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{t('blog.createBlog') || 'Create Blog'}</span>
          </Link>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        title="Seed High-Quality Educational Articles"
        message="This will seed 8 comprehensive educational articles (800+ words each across Math, Science, Physics, Biology, and Pedagogy) and automatically unpublish test/placeholder drafts for Google AdSense compliance. This is designed to run once."
        confirmText="Seed Articles Now"
        cancelText="Cancel"
        type="info"
        isLoading={isSeeding}
        onConfirm={handleSeed}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
