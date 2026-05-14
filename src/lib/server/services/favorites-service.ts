import dbConnect from '@/lib/db';
import Favorite from '@/models/Favorite';
import Blog from '@/models/Blog';
import type { Types } from 'mongoose';

type FavoriteIdsLean = { blogs?: Types.ObjectId[] };

type BlogListLean = {
  _id: Types.ObjectId;
  title: string;
  topic: string;
  content?: string;
  language?: string;
  createdAt?: Date;
  author?: { name?: string };
};

function excerptFromHtml(html: string | undefined, max = 160): string {
  if (!html) return '';
  const plain = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max)}...`;
}

export interface FavoriteBlogSummary {
  _id: string;
  title: string;
  topic: string;
  excerpt: string;
  /** Only when `includeContent` is requested (legacy / detail use). */
  content?: string;
  language?: string;
  createdAt: string;
  author?: { name: string };
}

export interface FavoriteListRow {
  /** Legacy shape: same as blog id (one Favorite doc per user; rows are materialized from Blog). */
  _id: string;
  blog: FavoriteBlogSummary;
  createdAt: string;
}

export async function getFavoriteBlogIds(userId: string): Promise<string[]> {
  await dbConnect();
  const doc = (await Favorite.findOne({ user: userId }).select('blogs').lean()) as FavoriteIdsLean | null;
  if (!doc?.blogs?.length) return [];
  return doc.blogs.map((id) => id.toString());
}

export async function listFavoritesPage(
  userId: string,
  options: { page: number; limit: number; skip: number; includeContent?: boolean }
): Promise<{ items: FavoriteListRow[]; total: number }> {
  await dbConnect();

  const doc = (await Favorite.findOne({ user: userId }).select('blogs').lean()) as FavoriteIdsLean | null;
  if (!doc?.blogs?.length) {
    return { items: [], total: 0 };
  }

  const blogIds = doc.blogs;

  const filter = { _id: { $in: blogIds }, isPublished: true };

  const [total, blogs] = await Promise.all([
    Blog.countDocuments(filter),
    Blog.find(filter)
      .select('title topic content language createdAt author')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(options.skip)
      .limit(options.limit)
      .lean(),
  ]);

  const items: FavoriteListRow[] = (blogs as unknown as BlogListLean[]).map((b) => {
    const id = b._id.toString();
    const created = b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString();
    const author = b.author;

    const summary: FavoriteBlogSummary = {
      _id: id,
      title: b.title,
      topic: b.topic,
      excerpt: excerptFromHtml(b.content),
      language: b.language,
      createdAt: created,
      ...(author?.name ? { author: { name: author.name } } : {}),
    };

    if (options.includeContent && b.content) {
      summary.content = b.content;
    }

    return {
      _id: id,
      blog: summary,
      createdAt: created,
    };
  });

  return { items, total };
}

export type AddFavoriteResult =
  | { ok: true; favorite: FavoriteListRow }
  | { ok: false; reason: 'not_found' | 'duplicate' };

export async function addFavoriteForUser(userId: string, blogId: string): Promise<AddFavoriteResult> {
  await dbConnect();

  const current = (await Favorite.findOne({ user: userId }).select('blogs').lean()) as FavoriteIdsLean | null;
  if (current?.blogs?.some((id: Types.ObjectId) => id.toString() === blogId)) {
    return { ok: false, reason: 'duplicate' };
  }

  const exists = (await Blog.findOne({ _id: blogId, isPublished: true })
    .select('title topic content language createdAt author')
    .populate('author', 'name')
    .lean()) as BlogListLean | null;
  if (!exists) {
    return { ok: false, reason: 'not_found' };
  }

  await Favorite.findOneAndUpdate({ user: userId }, { $addToSet: { blogs: blogId } }, { upsert: true, new: true });

  const id = exists._id.toString();
  const createdAt = exists.createdAt ? new Date(exists.createdAt).toISOString() : new Date().toISOString();
  const author = exists.author;

  const summary: FavoriteBlogSummary = {
    _id: id,
    title: exists.title,
    topic: exists.topic,
    excerpt: excerptFromHtml(exists.content),
    content: exists.content,
    language: exists.language,
    createdAt: createdAt,
    ...(author?.name ? { author: { name: author.name } } : {}),
  };

  return {
    ok: true,
    favorite: {
      _id: id,
      blog: summary,
      createdAt,
    },
  };
}

export type RemoveFavoriteResult = 'removed' | 'not_in_list' | 'no_document';

export async function removeFavoriteBlog(userId: string, blogId: string): Promise<RemoveFavoriteResult> {
  await dbConnect();
  const result = await Favorite.updateOne({ user: userId }, { $pull: { blogs: blogId } });
  if (result.matchedCount === 0) return 'no_document';
  if (result.modifiedCount === 0) return 'not_in_list';
  return 'removed';
}
