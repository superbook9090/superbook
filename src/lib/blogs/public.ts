import 'server-only';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import '@/models';
import Blog from '@/models/Blog';
import { getSiteUrl } from '@/lib/seo/config';

export type PublicBlogSummary = {
  _id: string;
  title: string;
  slug: string;
  topic: string;
  language: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  author?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
  isFeatured: boolean;
  viewCount: number;
  readingTimeMinutes: number;
};

export type PublicBlogDetail = PublicBlogSummary & {
  content: string;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function slugifyBlogTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180) || 'blog';
}

function buildExcerpt(content: string, explicitExcerpt?: string | null): string {
  if (explicitExcerpt?.trim()) return explicitExcerpt.trim();
  const plain = stripHtml(content);
  return plain.slice(0, 160).trim() + (plain.length > 160 ? '...' : '');
}

function estimateReadingTime(content: string): number {
  const words = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function buildCanonicalPath(slug: string) {
  return `/blogs/${slug}`;
}

function buildMetaTitle(title: string, explicit?: string | null) {
  return explicit?.trim() || title;
}

function buildMetaDescription(content: string, explicit?: string | null, excerpt?: string | null) {
  return explicit?.trim() || excerpt?.trim() || buildExcerpt(content);
}

function normalizeAuthor(author: unknown): { _id: string; name: string | null } | undefined {
  if (!author || typeof author !== 'object') return undefined;
  const value = author as { _id?: mongoose.Types.ObjectId | string; name?: string | null };
  if (!value._id) return undefined;
  return { _id: value._id.toString(), name: value.name ?? null };
}

async function ensurePublicSlug(
  blog: {
    _id: mongoose.Types.ObjectId | string;
    title: string;
    slug?: string | null;
    content: string;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    language: string;
    topic: string;
    createdAt: Date;
    updatedAt: Date;
    isFeatured?: boolean;
    viewCount?: number;
    author?: unknown;
  }
): Promise<PublicBlogSummary> {
  let slug = blog.slug?.trim().toLowerCase() || '';
  if (!slug) {
    const base = slugifyBlogTitle(blog.title);
    const suffix = blog._id.toString().slice(-6);
    slug = `${base}-${suffix}`;
    await Blog.updateOne({ _id: blog._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] }, { $set: { slug } });
  }

  const excerpt = buildExcerpt(blog.content, blog.excerpt);
  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug,
    topic: blog.topic,
    language: blog.language,
    excerpt,
    metaTitle: buildMetaTitle(blog.title, blog.metaTitle),
    metaDescription: buildMetaDescription(blog.content, blog.metaDescription, blog.excerpt),
    author: normalizeAuthor(blog.author),
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    isFeatured: Boolean(blog.isFeatured),
    viewCount: blog.viewCount ?? 0,
    readingTimeMinutes: estimateReadingTime(blog.content),
  };
}

function publicVisibilityFilter() {
  return {
    isPublished: true,
    $or: [
      { visibility: 'public' },
      {
        $and: [
          { organizationId: null },
          {
            $or: [
              { visibility: { $exists: false } },
              { visibility: null },
            ],
          },
        ],
      },
    ],
  };
}

export async function listPublicBlogTopics(): Promise<string[]> {
  await dbConnect();
  const topics = await Blog.distinct('topic', publicVisibilityFilter());
  return topics.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

export async function listPublicBlogs(params: {
  page?: number;
  limit?: number;
  search?: string;
  topic?: string;
  featuredOnly?: boolean;
  sort?: 'latest' | 'popular';
} = {}) {
  await dbConnect();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(24, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { ...publicVisibilityFilter() };

  if (params.topic && params.topic !== 'all') {
    query.topic = { $regex: new RegExp(`^${params.topic.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
  }

  if (params.search?.trim()) {
    query.$and = [
      ...(Array.isArray(query.$and) ? query.$and : []),
      {
        $or: [
          { title: { $regex: params.search.trim(), $options: 'i' } },
          { topic: { $regex: params.search.trim(), $options: 'i' } },
          { excerpt: { $regex: params.search.trim(), $options: 'i' } },
          { metaDescription: { $regex: params.search.trim(), $options: 'i' } },
        ],
      },
    ];
  }

  if (params.featuredOnly) {
    query.isFeatured = true;
  }

  const sort: Record<string, 1 | -1> = params.sort === 'popular'
    ? { viewCount: -1, createdAt: -1 }
    : { isFeatured: -1, createdAt: -1 };

  const [rows, total] = await Promise.all([
    Blog.find(query)
      .select('title slug topic language excerpt metaTitle metaDescription content createdAt updatedAt isFeatured viewCount author')
      .populate('author', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(query),
  ]);

  const blogs = await Promise.all(rows.map((row) => ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0])));
  return {
    blogs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function getPublicBlogBySlug(slug: string): Promise<PublicBlogDetail | null> {
  await dbConnect();

  const row = await Blog.findOne({
    ...publicVisibilityFilter(),
    slug: slug.toLowerCase(),
  })
    .select('title slug topic language excerpt metaTitle metaDescription content createdAt updatedAt isFeatured viewCount author')
    .populate('author', 'name')
    .lean();

  if (!row) return null;

  const summary = await ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0]);
  return {
    ...summary,
    content: (row as unknown as { content: string }).content,
  };
}

export async function listRelatedPublicBlogs(slug: string, topic: string, limit = 3) {
  await dbConnect();
  const rows = await Blog.find({
    ...publicVisibilityFilter(),
    slug: { $ne: slug.toLowerCase() },
    topic,
  })
    .select('title slug topic language excerpt metaTitle metaDescription content createdAt updatedAt isFeatured viewCount author')
    .populate('author', 'name')
    .sort({ isFeatured: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return Promise.all(rows.map((row) => ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0])));
}

export async function incrementPublicBlogView(slug: string) {
  await dbConnect();
  await Blog.updateOne(
    { ...publicVisibilityFilter(), slug: slug.toLowerCase() },
    { $inc: { viewCount: 1 } }
  );
}

export async function listPublicBlogSlugs(limit = 100) {
  await dbConnect();
  const rows = await Blog.find(publicVisibilityFilter())
    .select('slug title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const slugs = await Promise.all(rows.map(async (row) => {
    const typed = row as unknown as { _id: mongoose.Types.ObjectId; title: string; slug?: string | null };
    if (typed.slug) return typed.slug;
    const slug = `${slugifyBlogTitle(typed.title)}-${typed._id.toString().slice(-6)}`;
    await Blog.updateOne(
      { _id: typed._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] },
      { $set: { slug } }
    );
    return slug;
  }));
  return slugs.filter(Boolean);
}

export function buildPublicBlogCanonical(slug: string) {
  return `${getSiteUrl()}${buildCanonicalPath(slug)}`;
}

export function buildPublicBlogPath(slug: string) {
  return buildCanonicalPath(slug);
}

export function blogTopicSlug(topic: string): string {
  return topic
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
