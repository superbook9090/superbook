'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Heart,
  ArrowLeft,
  Bookmark,
  Calendar,
  User,
  ArrowRight,
  Trash2,
  BookOpen,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    try {
      const response = await fetch('/api/favorites');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setFavorites(data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: string, blogId: string) => {
    try {
      const response = await fetch(`/api/favorites/${blogId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setFavorites(favorites.filter((fav) => fav._id !== favoriteId));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <Link
            href="/dashboard/student/blogs"
            className="inline-flex items-center text-gray-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Blogs
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bookmark className="w-7 h-7 text-rose-500" />
            My Favorites
          </h1>
          <p className="text-gray-500 mt-1">
            Your saved blog posts for quick access
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-6 text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="w-7 h-7 fill-white" />
          </div>
          <div>
            <p className="text-3xl font-bold">{favorites.length}</p>
            <p className="text-rose-100">Saved Articles</p>
          </div>
        </div>
      </motion.div>

      {/* Favorites List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {favorites.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-2xl shadow-sm">
            <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-500 mb-6">
              Start exploring blogs and save your favorites!
            </p>
            <Link
              href="/dashboard/student/blogs"
              className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Explore Blogs
            </Link>
          </div>
        ) : (
          favorites.map((favorite, index) => {
            const blog = favorite.blog;
            // Strip HTML tags for excerpt
            const plainText = blog.content.replace(/<[^>]*>/g, '');
            const excerpt =
              plainText.substring(0, 100) +
              (plainText.length > 100 ? '...' : '');

            return (
              <motion.div
                key={favorite._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="primary" size="sm">
                      {blog.topic}
                    </Badge>
                    <button
                      onClick={() => removeFavorite(favorite._id, blog._id)}
                      className="p-2 rounded-full text-rose-500 hover:bg-rose-50 transition-colors"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {blog.author?.name || 'Teacher'}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Read More */}
                  <Link
                    href={`/dashboard/student/blogs/${blog._id}`}
                    className="mt-4 inline-flex items-center text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
                  >
                    Read Article
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>
    </div>
  );
}
