import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { listPublicCourses, listPublicCourseCategories, buildPublicCoursePath } from '@/lib/courses/public';
import { ROUTES } from '@/constants/routes';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';

export const revalidate = 300;

export const metadata: Metadata = createPageMetadata({
  title: 'Free Online Courses',
  description: 'Browse free public courses on Quiz-Do. Structured lessons, chapters, quizzes, and progress tracking for students and competitive exam preparation.',
  path: '/courses',
  keywords: ['free online courses', 'online learning', 'course catalog', 'exam preparation courses'],
});

export default async function PublicCoursesPage() {
  await ensureFeatureEnabled('enableCourses');

  const [data, categories] = await Promise.all([
    listPublicCourses({ page: 1, limit: 24 }),
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

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <MarketingHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-4">Free Online Courses</h1>
          <p className="text-lg text-[var(--color-muted-foreground)]">
            Explore public courses with structured lessons, embedded quizzes, and progress tracking.
            Enroll free to start learning on Quiz-Do.
          </p>
        </header>

        {categories.length > 0 && (
          <nav className="flex flex-wrap justify-center gap-2 mb-10" aria-label="Course categories">
            {categories.map((cat) => (
              <span
                key={cat}
                className="text-sm px-4 py-2 rounded-full bg-[var(--color-surface-muted)] text-[var(--color-foreground)]"
              >
                {cat}
              </span>
            ))}
          </nav>
        )}

        {data.courses.length === 0 ? (
          <div className="text-center py-16 text-[var(--color-muted-foreground)]">
            <p className="text-lg mb-4">No public courses yet. Check back soon!</p>
            <Link href={ROUTES.register} className="text-[var(--color-primary)] font-semibold hover:underline">
              Create the first course →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.courses.map((course) => (
              <article
                key={course._id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card-solid)] overflow-hidden hover:shadow-md transition-shadow"
              >
                {course.thumbnail ? (
                  <div className="relative h-40 bg-[var(--color-surface-muted)]">
                    <Image
                      src={course.thumbnail}
                      alt={course.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                ) : (
                  <div className="h-40 bg-gradient-to-br from-[var(--student-soft)] to-[var(--teacher-soft)] flex items-center justify-center">
                    <span className="text-4xl font-bold text-[var(--color-primary)] opacity-30">
                      {course.title.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-2">
                    {course.category}
                  </p>
                  <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-2">
                    <Link href={buildPublicCoursePath(course.slug)} className="hover:text-[var(--color-primary)]">
                      {course.title}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-[var(--color-muted-foreground)]">
                    <span>{course.chapterCount} chapters · {course.lessonCount} lessons</span>
                    <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="mt-16 pt-10 border-t border-[var(--border)] text-center">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">Want to teach?</h2>
          <p className="text-[var(--color-muted-foreground)] mb-6 max-w-xl mx-auto">
            Create your own course with chapters, lessons, and quizzes. Publish publicly to reach students through search.
          </p>
          <Link
            href={ROUTES.register}
            className="inline-flex items-center px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Start Teaching Free
          </Link>
        </section>
      </div>
      <Footer />
    </main>
  );
}
