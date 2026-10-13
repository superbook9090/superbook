import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublicContestBySlug } from '@/lib/contests/public';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import {
  Trophy,
  Clock,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Award,
  ArrowRight,
  ShieldCheck,
  Flame,
  Sparkles,
  BookOpen,
  ChevronRight,
  Zap,
} from 'lucide-react';

export const revalidate = 60;
export const dynamicParams = true;

interface ContestPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ContestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const contest = await getPublicContestBySlug(slug);

  if (!contest) {
    return createPageMetadata({
      title: 'Contest Not Found | Quiz-Do',
      path: `/contests/${slug}`,
      index: false,
    });
  }

  const title = contest.metaTitle || `${contest.title} | Live Daily Contest - Quiz-Do`;
  const description =
    contest.metaDescription ||
    contest.description ||
    'Participate in the live Mixed GK & GS online contest on Quiz-Do. Test speed and accuracy with real-time leaderboard ranking.';

  const keywords = [
    contest.title,
    'mixed gk gs contest',
    'दैनिक सामान्य ज्ञान प्रतियोगिता',
    'online live quiz contest',
    'competitive exam mock test',
    'upsc ssc test series',
    'railway rrb live test',
    'quiz do contest arena',
    'live leaderboard competition',
  ];

  return createPageMetadata({
    title,
    description,
    path: `/contests/${slug}`,
    ogType: 'website',
    keywords,
  });
}

export default async function PublicContestLandingPage({ params }: ContestPageProps) {
  const { slug } = await params;
  const contest = await getPublicContestBySlug(slug);

  if (!contest) {
    notFound();
  }

  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}/contests/${contest.slug}`;

  const now = new Date();
  const startTime = new Date(contest.startTime);
  const endTime = new Date(contest.endTime);

  const isUpcoming = startTime > now;
  const isEnded = contest.status === 'completed' || endTime < now;
  const isLive = !isUpcoming && !isEnded;

  // JSON-LD Structured Data: Quiz Schema
  const quizJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: contest.title,
    description: contest.description,
    url: canonicalUrl,
    timeRequired: `PT${contest.duration}M`,
    educationalLevel: 'Intermediate (Medium Hardness)',
    assesses: 'General Knowledge & General Studies (History, Polity, Geography, Economy, Science)',
    provider: {
      '@type': 'Organization',
      name: 'Quiz-Do Learning Platform',
      url: siteUrl,
    },
  };

  // JSON-LD Structured Data: BreadcrumbList
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Contests', item: `${siteUrl}/contests` },
      { '@type': 'ListItem', position: 3, name: contest.title, item: canonicalUrl },
    ],
  };

  // Syllabus breakdown sections for Mixed GK & GS
  const syllabusItems = [
    { title: 'भारतीय इतिहास', desc: 'प्राचीन, मध्यकालीन एवं आधुनिक भारत का स्वतंत्रता संग्राम', icon: BookOpen },
    { title: 'भारतीय राजव्यवस्था', desc: 'संविधान, मौलिक अधिकार, संसद एवं न्यायिक प्रणाली', icon: ShieldCheck },
    { title: 'भूगोल एवं पर्यावरण', desc: 'भारत एवं विश्व का भूगोल, नदियाँ, पर्वत एवं पारिस्थितिकी', icon: Sparkles },
    { title: 'भारतीय अर्थव्यवस्था', desc: 'बजट, मौद्रिक नीति, रिजर्व बैंक एवं प्रमुख आर्थिक योजनाएं', icon: Award },
    { title: 'सामान्य विज्ञान', desc: 'दैनिक जीवन में भौतिक विज्ञान, रसायन एवं जीव विज्ञान', icon: Zap },
    { title: 'स्टेटिक जीके व संस्थान', desc: 'महत्वपूर्ण राष्ट्रीय व अंतरराष्ट्रीय संस्थाएं, पुरस्कार एवं दिवस', icon: Flame },
  ];

  const contestActionUrl = isEnded
    ? `/dashboard/student/contests/${contest._id}/result`
    : `/dashboard/student/contests/${contest._id}/take`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
      <script
        id={`jsonld-contest-${contest._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(quizJsonLd) }}
      />
      <script
        id={`jsonld-contest-breadcrumb-${contest._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[var(--color-muted-foreground)] flex items-center gap-2">
        <Link href="/" className="hover:text-[var(--color-primary)] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/contests" className="hover:text-[var(--color-primary)] transition-colors">Contests</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[var(--color-foreground)] font-medium truncate max-w-xs sm:max-w-md">{contest.title}</span>
      </nav>

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-indigo-950 via-purple-900 to-slate-900 text-white p-6 sm:p-10 md:p-12 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            {isLive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                🔴 Live Contest Now
              </span>
            )}
            {isUpcoming && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Clock className="w-3.5 h-3.5" />
                Upcoming Live Contest
              </span>
            )}
            {isEnded && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed — Solutions Available
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 border border-white/15 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Mixed GK & GS Championship
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
              {contest.title}
            </h1>
            <p className="text-white/80 text-sm sm:text-base md:text-lg max-w-2xl leading-relaxed">
              {contest.description}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                <HelpCircle className="w-4 h-4 text-purple-300" /> Questions
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                {contest.questionCount} MCQs
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                <Clock className="w-4 h-4 text-blue-300" /> Time Limit
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                {contest.duration} Minutes
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                <Award className="w-4 h-4 text-yellow-300" /> Total Marks
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                {contest.totalPoints} Marks
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15">
              <div className="flex items-center gap-2 text-white/70 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-300" /> Marking Scheme
              </div>
              <div className="text-lg sm:text-xl font-bold text-white mt-1">
                +1 / -0.25 Mark
              </div>
            </div>
          </div>

          {/* CTA Action Section */}
          <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Link
              href={contestActionUrl}
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 rounded-xl font-bold text-base sm:text-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isLive ? (
                <>
                  <Zap className="w-5 h-5 fill-slate-950" />
                  Enter Contest Arena & Start Quiz
                </>
              ) : isEnded ? (
                <>
                  <Trophy className="w-5 h-5 text-slate-950" />
                  View Solutions & Leaderboard
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5 text-slate-950" />
                  Join When Live Arena Opens
                </>
              )}
            </Link>

            <Link
              href="/contests"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-colors"
            >
              Explore All Live Contests
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Contest Syllabus & Balanced Mix */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-primary)]" />
            Mixed GK & GS Syllabus Breakdown
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            This contest features a balanced mix of 10 medium-difficulty questions crafted for UPSC, SSC, Railways & State PSC aspirants.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {syllabusItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]/20 space-y-2 hover:border-[var(--color-primary)]/40 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-semibold text-sm sm:text-base text-[var(--color-foreground)]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-xs text-[var(--color-muted-foreground)] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rules & Guidelines */}
      <section className="p-6 sm:p-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
          Contest Rules & Examination Guidelines
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-[var(--color-muted-foreground)]">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>1 Mark per Question:</strong> Each correct response awards +1 point to your score.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Negative Marking:</strong> Each incorrect answer deducts 0.25 marks (-0.25).</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Single Attempt:</strong> Aspirants are allowed exactly 1 official attempt for leaderboard ranking.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Live Leaderboard:</strong> Your real-time rank is computed instantly based on score and submission speed.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>Detailed Explanations:</strong> Comprehensive answer solutions and conceptual notes unlock upon completion.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span><strong>100% Free:</strong> No registration fee or payment required to participate.</span>
          </li>
        </ul>
      </section>

      {/* FAQ Section */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
          Frequently Asked Questions (FAQ)
        </h2>
        <div className="space-y-3">
          <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-1.5">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">
              Who is eligible to participate in this contest?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              Anyone preparing for competitive exams like UPSC, SSC CGL/CHSL, Railway RRB NTPC, Banking, or State PSCs can freely join and evaluate their speed and accuracy.
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-1.5">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">
              How are ranks determined if two participants have identical scores?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              When scores are tied, the participant who completed the contest in less time is awarded the higher rank on the live leaderboard.
            </p>
          </div>
          <div className="p-4 sm:p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]/30 space-y-1.5">
            <h3 className="font-semibold text-sm text-[var(--color-foreground)]">
              Will I be able to review the answers after submission?
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
              Yes! Once you submit the contest, you will be redirected to the solutions page where every question includes a fact-checked explanation.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Sticky Action Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-purple-900/40 via-indigo-900/40 to-slate-900/40 border border-purple-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-base sm:text-lg text-[var(--color-foreground)]">
            Ready to test your Mixed GK & GS knowledge?
          </div>
          <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)]">
            Join thousands of active students competing in today&apos;s live arena.
          </p>
        </div>
        <Link
          href={contestActionUrl}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md transition-all shrink-0"
        >
          {isLive ? 'Start Contest Now' : isEnded ? 'View Results' : 'Join Arena'}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
