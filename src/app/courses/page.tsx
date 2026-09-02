import type { Metadata } from 'next';
import Link from 'next/link';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { listPublicCourses, listPublicCourseCategories } from '@/lib/courses/public';
import { ROUTES } from '@/constants/routes';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';
import PublicCoursesHero from './_components/PublicCoursesHero';
import PublicCoursesExplorer from './_components/PublicCoursesExplorer';
import { BookCheck, Award, Flame, Lightbulb, Sparkles, ArrowRight } from 'lucide-react';

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: 'Free Online Courses & Learning Paths',
  description:
    'Browse free online courses on Quiz Do with structured chapters, interactive quizzes, progress tracking, and verifiable completion certificates.',
  path: '/courses',
  keywords: [
    'free online courses',
    'online learning platform',
    'quiz based courses',
    'exam preparation courses',
    'certificate courses',
  ],
});

export default async function PublicCoursesPage() {
  await ensureFeatureEnabled('enableCourses');

  const [data, categories] = await Promise.all([
    listPublicCourses({ page: 1, limit: 36 }),
    listPublicCourseCategories(),
  ]);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${getSiteUrl()}/courses` },
    ],
  };

  const featureCards = [
    {
      icon: BookCheck,
      title: 'Structured Learning',
      desc: 'Carefully organized chapters, subtopics, and bite-sized lessons designed for maximum retention.',
      color: 'from-violet-500/20 to-purple-500/20 text-violet-600 dark:text-violet-400',
    },
    {
      icon: Flame,
      title: 'Interactive Assessments',
      desc: 'Quizzes embedded directly at every milestone to test understanding before progressing.',
      color: 'from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400',
    },
    {
      icon: Award,
      title: 'Verified Certificates',
      desc: 'Earn verifiable completion certificates to showcase your mastery and skills.',
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: Lightbulb,
      title: 'Paced & Flexible',
      desc: 'Learn on any device, track your progress automatically, and never lose your streak.',
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between">
      <script
        id="jsonld-courses-breadcrumb"
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <MarketingHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-1 w-full space-y-16">
        {/* Hero Section */}
        <PublicCoursesHero totalCourses={data.courses.length} />

        {/* Interactive Course Catalog Explorer */}
        <PublicCoursesExplorer initialCourses={data.courses} categories={categories} />

        {/* Why Learn on Quiz-Do Value Prop Section */}
        <section className="pt-12 border-t border-[var(--border)]">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-[var(--student-primary)]">
              Built For Mastery
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-foreground)] mt-2">
              Why Learn on Quiz-Do?
            </h2>
            <p className="text-sm text-[var(--color-muted-foreground)] mt-2">
              We combine structured curriculum with active retrieval testing so you retain what you study.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[var(--card-solid)] border border-[var(--border)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-[var(--color-foreground)] mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* High Converting Dual CTA Section */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--student-primary)] via-purple-700 to-[var(--teacher-primary)] p-8 sm:p-12 text-white shadow-xl">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Start Your Journey Today</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Ready to Advance Your Skills or Share Your Knowledge?
            </h2>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
              Join thousands of students learning for free, or publish your own curriculum with interactive quizzes.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href={ROUTES.register}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-[var(--student-primary)] font-bold text-sm hover:bg-white/90 shadow-lg transition-all"
              >
                <span>Enroll Free as Student</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`${ROUTES.register}?role=teacher`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm border border-white/20 backdrop-blur-md transition-all"
              >
                <span>Become an Instructor</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
