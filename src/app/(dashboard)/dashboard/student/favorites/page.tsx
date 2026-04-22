'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '@/store/useSessionStore';
import FavoritesList from './FavoritesList';
import { useFeature } from '@/contexts/AppSettingsContext';

export default function FavoritesPage() {
  const { status, favoritesLoading, favoritesData } = useSessionStore();
  const router = useRouter();
  const featureEnabled = useFeature('enableBlogs');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated' && !featureEnabled) {
      router.push('/dashboard/student');
    }
  }, [status, router, featureEnabled]);

  if (status === 'loading' || favoritesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return <FavoritesList initialFavorites={favoritesData} />;
}
