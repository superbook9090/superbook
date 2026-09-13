import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import dbConnect from '@/lib/db';
import { Challenge, Quiz, QuizQuestion, User } from '@/models';
import { createPageMetadata } from '@/lib/seo/metadata';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { ChallengeArenaClient } from '@/features/challenges/components/ChallengeArenaClient';
import { ExpiredChallengeView } from '@/features/challenges/components/ExpiredChallengeView';
import type { PublicChallengeData } from '@/features/challenges/types';

interface ChallengePageProps {
  params: Promise<{ slug: string }>;
}

interface ChallengePopulatedDoc {
  _id: { toString(): string };
  slug: string;
  creator?: { _id?: { toString(): string }; name?: string; image?: string | null } | null;
  quiz?: { _id?: { toString(): string }; title?: string; description?: string } | null;
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  selectedQuestions: Array<{ toString(): string }>;
  status: string;
  expiresAt?: Date;
}

interface QuestionDoc {
  _id: { toString(): string };
  prompt: string;
  options: string[];
  points?: number;
}

async function getChallenge(slug: string) {
  await dbConnect();
  const challenge = (await Challenge.findOne({ slug })
    .populate({ path: 'creator', model: User, select: 'name image' })
    .populate({ path: 'quiz', model: Quiz, select: 'title description' })
    .lean()) as unknown as ChallengePopulatedDoc | null;

  if (!challenge || challenge.status === 'disabled') {
    return null;
  }

  // Fetch question details without answers
  const questions = (await QuizQuestion.find({
    _id: { $in: challenge.selectedQuestions },
  })
    .select('_id prompt options points')
    .lean()) as unknown as QuestionDoc[];

  const qMap = new Map<string, QuestionDoc>(questions.map((q) => [q._id.toString(), q]));
  const selectedIds: Array<{ toString(): string }> = challenge.selectedQuestions || [];
  const orderedQuestions: Array<{ id: string; prompt: string; options: string[]; points: number }> = [];

  for (const id of selectedIds) {
    const q = qMap.get(id.toString());
    if (q) {
      orderedQuestions.push({
        id: q._id.toString(),
        prompt: q.prompt,
        options: q.options,
        points: q.points || 1,
      });
    }
  }

  const isExpired = Boolean(challenge.expiresAt && new Date(challenge.expiresAt) < new Date());

  return {
    challenge: {
      id: challenge._id.toString(),
      slug: challenge.slug,
      challenger: {
        id: challenge.creator?._id?.toString(),
        name: challenge.creator?.name || 'Quizdo Scholar',
        image: challenge.creator?.image || null,
      },
      quiz: {
        id: challenge.quiz?._id?.toString(),
        title: challenge.quiz?.title || 'Quiz Challenge',
        description: challenge.quiz?.description || '',
      },
      targetScore: challenge.targetScore,
      correctCount: challenge.correctCount,
      totalQuestions: challenge.totalQuestions,
      timeTaken: challenge.timeTaken,
      expiresAt: challenge.expiresAt ? challenge.expiresAt.toISOString() : '',
      questions: orderedQuestions,
    } as PublicChallengeData,
    isExpired,
  };
}

export async function generateMetadata({ params }: ChallengePageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getChallenge(slug);

  if (!data) {
    return createPageMetadata({
      title: 'Challenge Not Found | Quizdo',
      description: 'The requested quiz challenge could not be found or has expired.',
      path: `/challenge/${slug}`,
      index: false,
    });
  }

  const { challenge } = data;
  const challengerName = challenge.challenger.name || 'A Quizdo Student';
  const quizTitle = challenge.quiz.title;

  return createPageMetadata({
    title: `⚔️ Can you beat ${challengerName}'s ${challenge.targetScore}% in ${quizTitle}?`,
    description: `${challengerName} scored ${challenge.targetScore}% in "${quizTitle}". Take this ${challenge.totalQuestions ? `${challenge.totalQuestions}-question ` : ''}quiz challenge on Quizdo — no login required!`,
    path: `/challenge/${slug}`,
    keywords: ['quiz challenge', 'beat friend quiz', 'online mock test challenge', quizTitle],
  });
}

export default async function ChallengePage({ params }: ChallengePageProps) {
  const { slug } = await params;
  const data = await getChallenge(slug);

  if (!data) {
    notFound();
  }

  const { challenge, isExpired } = data;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-background)]">
      <MarketingHeader forceScrolled />

      <main className="flex-1 flex flex-col pt-16 sm:pt-20">
        {isExpired ? (
          <ExpiredChallengeView />
        ) : (
          <ChallengeArenaClient challenge={challenge} />
        )}
      </main>

      <Footer />
    </div>
  );
}
