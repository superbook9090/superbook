import 'server-only';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';
import { getSiteUrl } from '@/lib/seo/config';

export type PublicContestSummary = {
  _id: string;
  slug: string;
  title: string;
  description: string;
  instructions?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  questionCount: number;
  duration: number; // in minutes
  totalPoints: number;
  enableNegativeMarking?: boolean;
  negativeMarks?: number;
  status: string;
  startTime: string;
  endTime: string;
  solutionsReleaseAt: string;
  leaderboardVisibility: string;
  instructor?: { _id: string; name: string | null };
  createdAt: string;
  updatedAt: string;
};

export type PublicContestSitemapEntry = {
  slug: string;
  lastModified: Date;
};

function slugifyContestTitle(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160);

  if (base.length >= 3) return base;

  // Meaningful fallback for non-Latin / Hindi titles
  if (/gk|gs|सामान्य/i.test(title)) return 'daily-mixed-gk-gs-contest';
  if (/upsc|ias/i.test(title)) return 'upsc-mock-contest';
  if (/ssc/i.test(title)) return 'ssc-cgl-contest';
  if (/bank/i.test(title)) return 'banking-exam-contest';
  return 'online-live-contest';
}

function publicContestVisibilityFilter() {
  return {
    visibility: 'public',
    status: { $in: ['published', 'completed'] },
    title: { $not: /^test\d*$/i },
    organizationId: null,
  };
}

export async function ensurePublicContestSlug(contest: {
  _id: mongoose.Types.ObjectId | string;
  title: string;
  slug?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  description?: string;
  instructions?: string;
  questionCount?: number;
  duration?: number;
  totalPoints?: number;
  enableNegativeMarking?: boolean;
  negativeMarks?: number;
  status: string;
  startTime: Date;
  endTime: Date;
  solutionsReleaseAt: Date;
  leaderboardVisibility?: string;
  instructor?: unknown;
  createdAt: Date;
  updatedAt: Date;
}): Promise<PublicContestSummary> {
  let slug = contest.slug?.trim().toLowerCase() || '';

  if (!slug) {
    const base = slugifyContestTitle(contest.title);
    const suffix = contest._id.toString().slice(-6);
    slug = `${base}-${suffix}`;
    await Contest.updateOne(
      { _id: contest._id, $or: [{ slug: null }, { slug: { $exists: false } }, { slug: '' }] },
      { $set: { slug } }
    );
  }

  // Ensure high-quality meta fallbacks if missing
  const metaTitle =
    contest.metaTitle ||
    `${contest.title} | Live Quiz Contest`;
  const metaDescription =
    contest.metaDescription ||
    (contest.description
      ? contest.description.slice(0, 160)
      : `Participate in ${contest.title} on Quiz-Do. Test speed & accuracy with live leaderboard ranking.`);

  const instructorObj = contest.instructor as { _id?: mongoose.Types.ObjectId | string; name?: string } | undefined;

  return {
    _id: contest._id.toString(),
    slug,
    title: contest.title,
    description: contest.description || '',
    instructions: contest.instructions,
    metaTitle,
    metaDescription,
    questionCount: contest.questionCount || 10,
    duration: contest.duration || 10,
    totalPoints: contest.totalPoints || 10,
    enableNegativeMarking: contest.enableNegativeMarking ?? true,
    negativeMarks: contest.negativeMarks ?? 0.25,
    status: contest.status,
    startTime: contest.startTime.toISOString(),
    endTime: contest.endTime.toISOString(),
    solutionsReleaseAt: contest.solutionsReleaseAt.toISOString(),
    leaderboardVisibility: contest.leaderboardVisibility || 'live',
    instructor: instructorObj?._id ? { _id: instructorObj._id.toString(), name: instructorObj.name ?? null } : undefined,
    createdAt: contest.createdAt.toISOString(),
    updatedAt: contest.updatedAt.toISOString(),
  };
}

export async function getPublicContestBySlug(slug: string): Promise<PublicContestSummary | null> {
  await dbConnect();

  const contest = await Contest.findOne({
    slug,
    ...publicContestVisibilityFilter(),
  })
    .populate('instructor', 'name')
    .lean();

  if (contest) {
    return ensurePublicContestSlug(contest as unknown as Parameters<typeof ensurePublicContestSlug>[0]);
  }

  // Fallback: try by ObjectId in case a link used the database id
  if (mongoose.Types.ObjectId.isValid(slug)) {
    const byId = await Contest.findOne({
      _id: slug,
      ...publicContestVisibilityFilter(),
    })
      .populate('instructor', 'name')
      .lean();

    if (byId) {
      return ensurePublicContestSlug(byId as unknown as Parameters<typeof ensurePublicContestSlug>[0]);
    }
  }

  return null;
}

export async function listPublicContestSitemapEntries(limit = 200): Promise<PublicContestSitemapEntry[]> {
  await dbConnect();

  const rows = await Contest.find(publicContestVisibilityFilter())
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
        slug = `${slugifyContestTitle(typed.title)}-${typed._id.toString().slice(-6)}`;
        await Contest.updateOne(
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

export function buildPublicContestPath(slug: string) {
  return `/contests/${slug}`;
}

export function buildPublicContestCanonical(slug: string) {
  return `${getSiteUrl()}${buildPublicContestPath(slug)}`;
}
