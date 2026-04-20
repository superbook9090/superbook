import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import AppSettings from '@/models/AppSettings';
import FavoritesList from './FavoritesList';
import type { IAppSettings } from '@/models/AppSettings';

interface Blog {
  _id: string;
  title: string;
  topic: string;
  content: string;
  createdAt: string;
  author: { name: string };
}

interface Favorite {
  _id: string;
  blog: Blog;
}

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);

  // Auth check
  if (!session?.user) {
    redirect('/login');
  }

  await dbConnect();

  // Check if blogs feature is enabled
  const appSettings = await AppSettings.findOne({}).lean() as IAppSettings | null;
  const enableBlogs = appSettings?.featureToggles?.enableBlogs ?? true;

  if (!enableBlogs) {
    redirect('/dashboard/student');
  }

  // Fetch favorites
  let favorites: Favorite[] = [];
  try {
    const favoritesData = await Favorite.find({ user: session.user.id })
      .populate({
        path: 'blog',
        match: { isPublished: true },
        populate: { path: 'author', select: 'name' },
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out favorites where blog is null (unpublished)
    favorites = favoritesData.filter((fav: any) => fav.blog !== null) as Favorite[];
  } catch (error) {
    console.error('Error fetching favorites:', error);
    favorites = [];
  }

  return <FavoritesList initialFavorites={favorites} />;
}
