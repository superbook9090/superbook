import 'server-only';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import '@/models';
import Course from '@/models/Course';
import Chapter from '@/models/Chapter';
import Lesson from '@/models/Lesson';
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
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  instructor?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
};

function slugifyTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 180);

  if (base.length >= 3) return base;

  // Meaningful fallback for non-Latin / Hindi course titles
  if (/बैंक|bank/i.test(title)) return 'bank-po-exam-course';
  if (/यूपीएससी|upsc/i.test(title)) return 'upsc-preparation-course';
  if (/एसएससी|ssc/i.test(title)) return 'ssc-cgl-course';
  if (/गणित|math|aptitude/i.test(title)) return 'quantitative-aptitude-course';
  if (/रीजनिंग|तर्कशक्ति|reasoning/i.test(title)) return 'reasoning-ability-course';
  if (/अंग्रेजी|english/i.test(title)) return 'english-language-course';
  if (/सामान्य अध्ययन|सामान्य ज्ञान|gk|gs/i.test(title)) return 'general-studies-course';
  if (/विज्ञान|science/i.test(title)) return 'general-science-course';
  return 'online-learning-course';
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
    title: { $not: /^test\d*$/i },
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
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string[];
  instructor?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Promise<PublicCourseSummary> {
  let slug = course.slug?.trim().toLowerCase() || '';
  const updates: Record<string, unknown> = {};

  if (!slug) {
    const base = slugifyTitle(course.title);
    const suffix = course._id.toString().slice(-6);
    slug = `${base}-${suffix}`;
    updates.slug = slug;
  }

  // Ensure high quality SEO metadata fallbacks for all courses
  const metaTitle =
    course.metaTitle?.trim() ||
    `${course.title} - Free Online Course, Syllabus & Quizzes`;

  const metaDescription =
    course.metaDescription?.trim() ||
    (course.description
      ? `${course.description.slice(0, 140)}... Access ${course.chapterCount || 0} chapters, ${course.lessonCount || 0} interactive lessons, and practice quizzes free on Quiz Do.`
      : `Complete ${course.title} preparation course on Quiz Do with structured syllabus chapters, interactive quizzes, and verifiable certificate.`);

  const keywords = Array.isArray(course.keywords) && course.keywords.length > 0
    ? course.keywords
    : [
        course.title,
        `${course.category || 'exam'} preparation`,
        `${course.category || 'competitive'} online course`,
        'free online course',
        'study notes',
        'interactive practice quizzes',
      ];

  if (!course.metaTitle) updates.metaTitle = metaTitle;
  if (!course.metaDescription) updates.metaDescription = metaDescription;
  if (!course.keywords || course.keywords.length === 0) updates.keywords = keywords;

  if (Object.keys(updates).length > 0) {
    await Course.updateOne(
      { _id: course._id },
      { $set: updates }
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
    metaTitle,
    metaDescription,
    keywords,
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
      .select('title slug description category locale thumbnail price chapterCount lessonCount enrolledCount metaTitle metaDescription keywords instructor createdAt updatedAt')
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
    .select('title slug description category locale thumbnail price chapterCount lessonCount enrolledCount metaTitle metaDescription keywords instructor createdAt updatedAt')
    .populate('instructor', 'name')
    .lean();

  if (!row) return null;
  return ensurePublicSlug(row as unknown as Parameters<typeof ensurePublicSlug>[0]);
}

export type PublicLessonCurriculumItem = {
  _id: string;
  title: string;
  order: number;
  duration: number;
  isPreview?: boolean;
};

export type PublicChapterCurriculumItem = {
  _id: string;
  title: string;
  summary?: string;
  order: number;
  lessonCount: number;
  lessons: PublicLessonCurriculumItem[];
};

export async function getPublicCourseCurriculum(courseId: string): Promise<PublicChapterCurriculumItem[]> {
  await dbConnect();

  const [chapters, lessons] = await Promise.all([
    Chapter.find({ course: courseId }).sort({ order: 1 }).lean(),
    Lesson.find({ course: courseId, isPublished: true })
      .select('_id title order duration isPreview chapter')
      .sort({ order: 1 })
      .lean(),
  ]);

  const lessonsByChapter = new Map<string, PublicLessonCurriculumItem[]>();
  for (const lesson of lessons) {
    const chId = lesson.chapter?.toString();
    if (!chId) continue;
    if (!lessonsByChapter.has(chId)) {
      lessonsByChapter.set(chId, []);
    }
    lessonsByChapter.get(chId)!.push({
      _id: lesson._id.toString(),
      title: lesson.title,
      order: lesson.order,
      duration: lesson.duration || 0,
      isPreview: lesson.isPreview ?? false,
    });
  }

  return chapters.map((ch) => ({
    _id: ch._id.toString(),
    title: ch.title,
    summary: ch.summary,
    order: ch.order,
    lessonCount: ch.lessonCount || 0,
    lessons: lessonsByChapter.get(ch._id.toString()) || [],
  }));
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

export type PublicCourseSitemapEntry = {
  slug: string;
  lastModified: Date;
};

export async function listPublicCourseSitemapEntries(limit = 200): Promise<PublicCourseSitemapEntry[]> {
  await dbConnect();
  const rows = await Course.find(publicVisibilityFilter())
    .select('slug title createdAt updatedAt')
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const entries = await Promise.all(
    rows.map(async (row) => {
      const typed = row as unknown as {
        _id: mongoose.Types.ObjectId;
        title: string;
        slug?: string | null;
        createdAt?: Date;
        updatedAt?: Date;
      };
      let slug = typed.slug;
      if (!slug) {
        slug = `${slugifyTitle(typed.title)}-${typed._id.toString().slice(-6)}`;
        await Course.updateOne(
          { _id: typed._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] },
          { $set: { slug } }
        );
      }
      return {
        slug,
        lastModified: typed.updatedAt || typed.createdAt || new Date(),
      };
    })
  );
  return entries.filter((e) => Boolean(e.slug));
}

export function buildPublicCoursePath(slug: string) {
  return `/courses/${slug}`;
}

export function buildPublicCourseCanonical(slug: string) {
  return `${getSiteUrl()}${buildPublicCoursePath(slug)}`;
}
