import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import dbConnect from '@/lib/db';
import Contest from '@/models/Contest';

export const dynamic = 'force-dynamic';

interface ContestPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
  const { slug } = await params;
  await dbConnect();

  const contest = await Contest.findOne({ slug }).lean();

  if (!contest) {
    return {
      title: 'Contest Not Found | Quiz-Do',
    };
  }

  const title = contest.metaTitle || `${contest.title} | Quiz-Do Contests`;
  const description = contest.metaDescription || contest.description || 'Join this exciting contest on Quiz-Do and win amazing prizes!';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function ContestPublicPage({ params }: ContestPageProps) {
  const { slug } = await params;
  await dbConnect();

  const contest = await Contest.findOne({ slug }).lean();

  if (!contest) {
    notFound();
  }

  // Redirect to the dashboard where the actual contest UI lives
  redirect(`/dashboard/student/contests/${contest._id.toString()}/take`);
}
