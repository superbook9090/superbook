import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  buildPublicCourseCanonical,
  buildPublicCoursePath,
  getPublicCourseBySlug,
  listPublicCourseSlugs,
} from '@/lib/courses/public';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { ROUTES } from '@/constants/routes';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await listPublicCourseSlugs(50);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) {
    return createPageMetadata({ title: 'Course Not Found', path: `/courses/${slug}`, index: false });
  }

  return createPageMetadata({
    title: course.title,
    description: course.description.slice(0, 160) || `Learn ${course.title} on Quiz-Do`,
    path: buildPublicCoursePath(course.slug),
    keywords: [course.category, course.locale, 'online course', 'free course'],
  });
}

export default async function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  const canonical = buildPublicCourseCanonical(course.slug);

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: canonical,
    provider: { '@type': 'Organization', name: 'Quiz-Do', url: getSiteUrl() },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
    },
    numberOfLessons: course.lessonCount,
    inLanguage: course.locale,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: getSiteUrl() },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${getSiteUrl()}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: canonical },
    ],
  };

  return (
    <main className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <MarketingHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="text-sm text-[var(--color-muted-foreground)] mb-6">
          <Link href="/courses" className="hover:text-[var(--color-primary)]">Courses</Link>
          <span className="mx-2">/</span>
          <span>{course.category}</span>
        </nav>

        {course.thumbnail && (
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden mb-8">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        <header className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[var(--color-primary)] mb-2">
            {course.category}
          </p>
          <h1 className="text-4xl font-bold text-[var(--color-foreground)] mb-4">{course.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[var(--color-muted-foreground)]">
            {course.instructor?.name && <span>By {course.instructor.name}</span>}
            <span>{course.chapterCount} chapters</span>
            <span>{course.lessonCount} lessons</span>
            <span>{course.enrolledCount} enrolled</span>
            <span>{course.price === 0 ? 'Free' : `₹${course.price}`}</span>
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-[var(--color-foreground)] mb-10">
          <p>{course.description}</p>
        </div>

        <div className="rounded-2xl bg-[var(--student-soft)] border border-[var(--student-border)] p-8 text-center">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">Ready to start learning?</h2>
          <p className="text-[var(--color-muted-foreground)] mb-6">
            Sign up free to enroll in this course and access all lessons and quizzes.
          </p>
          <Link
            href={ROUTES.register}
            className="inline-flex items-center px-8 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Enroll Free
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
