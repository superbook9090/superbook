'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import { useSessionStore } from '@/store/useSessionStore';
import { useFeature } from '@/contexts/AppSettingsContext';
import { useFavorites } from '@/lib/react-query/hooks';
import { PageSkeleton } from '@/components/ui/Skeleton';
import FavoritesList from './FavoritesList';

export default function FavoritesPage() {
  const { status } = useSessionStore();
  const router = useRouter();
  const featureEnabled = useFeature('enableBlogs');
  const { data, isLoading } = useFavorites();
  const favorites = data?.favorites ?? [];
  const totalFavorites = data?.meta?.total ?? favorites.length;

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(ROUTES.login);
      return;
    }
    if (status === 'authenticated' && !featureEnabled) {
      router.push(ROUTES.student.root);
    }
  }, [status, router, featureEnabled]);

  if (status === 'loading' || isLoading) {
    return <PageSkeleton />;
  }

  return <FavoritesList initialFavorites={favorites} totalCount={totalFavorites} />;
}
