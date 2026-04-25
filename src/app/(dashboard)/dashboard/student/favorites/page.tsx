'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import FavoritesList from './FavoritesList';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useFavorites } from '@/lib/react-query/hooks';

export default function FavoritesPage() {
  const { status } = useSessionStore();
  const router = useRouter();
  const featureEnabled = useFeature('enableBlogs');
  const { data: favorites = [], isLoading } = useFavorites();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !featureEnabled) {
      router.push('/dashboard/student');
    }
  }, [status, router, featureEnabled]);

  if (status === 'loading' || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--student-primary)]"></div>
      </div>
    );
  }

  return <FavoritesList initialFavorites={favorites} />;
}
