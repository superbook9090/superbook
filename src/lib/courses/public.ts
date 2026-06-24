import 'server-only';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import '@/models';
import Course from '@/models/Course';
import { publicCourseFilter } from '@/lib/courseAccess';
import { getSiteUrl } from '@/lib/seo/config';

export type PublicCourseSummary = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  locale: string;
  thumbnail: string;
  price: number;
  chapterCount: number;
  lessonCount: number;
  enrolledCount: number;
  instructor?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
};

function slugifyTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180) || 'course';
}

function normalizeInstructor(instructor: unknown): { _id: string; name: string | null } | undefined {
  if (!instructor || typeof instructor !== 'object') return undefined;
  const value = instructor as { _id?: mongoose.Types.ObjectId | string; name?: string | null };
  if (!value._id) return undefined;
  return { _id: value._id.toString(), name: value.name ?? null };
}

function publicVisibilityFilter() {
  return {
    isPublished: true,
    ...publicCourseFilter(),
    organizationId: null,
  };
}

async function ensurePublicSlug(course: {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  slug?: string | null;
  description?: string;
  category?: string;
  locale?: string;
  thumbnail?: string;
  price?: number;
  chapterCount?: number;
  lessonCount?: number;
  enrolledCount?: number;
  instructor?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Promise<PublicCourseSummary> {
  let slug = course.slug?.trim().toLowerCase() || '';
  if (!slug) {
    const base = slugifyTitle(course.title);
    const suffix = course._id.toString().slice(-6);
    slug = `${base}-${suffix}`;
    await Course.updateOne(
      { _id: course._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] },
      { $set: { slug } }
    );
  }

  return {
    _id: course._id.toString(),
    slug,
    title: course.title,
    description: course.description ?? '',
    category: course.category ?? 'General',
    locale: course.locale ?? 'en',
    thumbnail: course.thumbnail ?? '',
    price: course.price ?? 0,
    chapterCount: course.chapterCount ?? 0,
    lessonCount: course.lessonCount ?? 0,
    enrolledCount: course.enrolledCount ?? 0,
    instructor: normalizeInstructor(course.instructor),
    createdAt: course.createdAt.toISOString(),
    updatedAt: course.updatedAt.toISOString(),
  };
}

export async function listPublicCourses(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
} = {}) {
  await dbConnect();

  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(24, Math.max(1, params.limit ?? 12));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = { ...publicVisibilityFilter() };

  if (params.category && params.category !== 'all') {
    query.category = { $regex: new RegExp(`^${params.category.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') };
  }

  if (params.search?.trim()) {
    query.$and = [
      ...(Array.isArray(query.$and) ? query.$and : []),
      {
        $or: [
          { title: { $regex: params.search.trim(), $options: 'i' } },
          { description: { $regex: params.search.trim(), $options: 'i' } },
          { category: { $regex: params.search.trim(), $options: 'i' } },
        ],
      },
    ];
  }

  const [rows, total] = await Promise.all([
    Course.find(query)
      .select('title slug description category locale thumbnail price chapterCount lessonCount enrolledCount instructor createdAt updatedAt')
      .populate('instructor', 'name')
      .sort({ enrolledCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Course.countDocuments(query),
  ]);

  const courses = await Promise.all(
    rows.map((row) => ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0]))
  );

  return {
    courses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function listPublicCourseCategories(): Promise<string[]> {
  await dbConnect();
  const categories = await Course.distinct('category', publicVisibilityFilter());
  return categories.filter(Boolean).sort((a, b) => a.localeCompare(b));
}

export async function getPublicCourseBySlug(slug: string): Promise<PublicCourseSummary | null> {
  await dbConnect();

  const row = await Course.findOne({
    ...publicVisibilityFilter(),
    slug: slug.toLowerCase(),
  })
    .select('title slug description category locale thumbnail price chapterCount lessonCount enrolledCount instructor createdAt updatedAt')
    .populate('instructor', 'name')
    .lean();

  if (!row) return null;
  return ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0]);
}

export async function listPublicCourseSlugs(limit = 200) {
  await dbConnect();
  const rows = await Course.find(publicVisibilityFilter())
    .select('slug title')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const slugs = await Promise.all(
    rows.map(async (row) => {
      const typed = row as unknown as { _id: mongoose.Types.ObjectId; title: string; slug?: string | null };
      if (typed.slug) return typed.slug;
      const slug = `${slugifyTitle(typed.title)}-${typed._id.toString().slice(-6)}`;
      await Course.updateOne(
        { _id: typed._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] },
        { $set: { slug } }
      );
      return slug;
    })
  );
  return slugs.filter(Boolean);
}

export function buildPublicCoursePath(slug: string) {
  return `/courses/${slug}`;
}

export function buildPublicCourseCanonical(slug: string) {
  return `${getSiteUrl()}${buildPublicCoursePath(slug)}`;
}
