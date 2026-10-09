import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import {
  buildPublicCourseCanonical,
  buildPublicCoursePath,
  getPublicCourseBySlug,
  getPublicCourseCurriculum,
  listPublicCourseSlugs,
} from '@/lib/courses/public';
import { BANK_PO_COURSE_SLUG, BANK_PO_SEO_DATA } from '@/lib/courses/bankPoSyllabus';
import { createPageMetadata } from '@/lib/seo/metadata';
import { getSiteUrl } from '@/lib/seo/config';
import { ROUTES } from '@/constants/routes';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { ensureFeatureEnabled } from '@/lib/settingsHelpers';
import AutoEnrollHandler from '@/components/courses/AutoEnrollHandler';
import PublicCourseCurriculum from '../_components/PublicCourseCurriculum';
import PublicCourseFaq, { FaqItem } from '../_components/PublicCourseFaq';
import { BookOpen, Award, Clock, CheckCircle2, ShieldCheck, Flame } from 'lucide-react';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const slugs = await listPublicCourseSlugs(50);
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.warn('[generateStaticParams] Could not prefetch course slugs at build time. Falling back to on-demand generation.', error);
    return [];
  }
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

  const siteUrl = getSiteUrl();
  const ogImage = course.thumbnail || `${siteUrl}/og-image.png`;
  const isBankPo = course.slug === BANK_PO_COURSE_SLUG;

  const title =
    course.metaTitle ||
    (isBankPo ? BANK_PO_SEO_DATA.metaTitle : `${course.title} - Free Online Course, Syllabus & Quizzes`);

  const description =
    course.metaDescription ||
    (isBankPo
      ? BANK_PO_SEO_DATA.metaDescription
      : `${course.description.slice(0, 140)}... Access ${course.chapterCount} chapters, ${course.lessonCount} interactive lessons, and practice quizzes free on Quiz Do.`);

  const mergedKeywords = Array.from(
    new Set([
      course.title,
      `${course.category} syllabus`,
      `${course.category} online course`,
      `${course.category} preparation`,
      'free online course',
      'interactive practice quizzes',
      'exam preparation notes',
      'course certificate',
      course.locale === 'hi' ? 'हिंदी माध्यम अध्ययन नोट्स' : 'bilingual study guides and notes',
      ...(course.keywords || []),
      ...(isBankPo ? BANK_PO_SEO_DATA.keywords : []),
    ])
  );

  return createPageMetadata({
    title,
    description,
    path: buildPublicCoursePath(course.slug),
    ogType: 'website',
    images: [ogImage],
    keywords: mergedKeywords,
  });
}

export default async function PublicCourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await ensureFeatureEnabled('enableCourses');

  const { slug } = await params;
  const course = await getPublicCourseBySlug(slug);
  if (!course) notFound();

  const siteUrl = getSiteUrl();
  const canonical = buildPublicCourseCanonical(course.slug);
  const curriculum = await getPublicCourseCurriculum(course._id);
  const isBankPo = course.slug === BANK_PO_COURSE_SLUG;

  const totalDurationMinutes = curriculum.reduce(
    (acc, ch) => acc + ch.lessons.reduce((sub, l) => sub + (l.duration || 0), 0),
    0
  );
  const totalDurationHours = Math.round((totalDurationMinutes / 60) * 10) / 10;

  const faqItems: FaqItem[] = isBankPo
    ? BANK_PO_SEO_DATA.faq
    : [
        {
          question: `Is the "${course.title}" course free on Quiz Do?`,
          answer:
            course.price === 0
              ? 'Yes! This course is 100% free with unlimited access to all chapters, lesson notes, and practice quizzes.'
              : `This course is available for ₹${course.price} with full access to all curriculum materials.`,
        },
        {
          question: 'How many chapters and lessons are included?',
          answer: `The course includes ${course.chapterCount} structured chapters and ${course.lessonCount} focused lessons designed for maximum retention.`,
        },
        {
          question: 'Are practice quizzes included with each lesson?',
          answer:
            'Yes, each individual lesson comes with milestone practice questions and quizzes to test your understanding before advancing.',
        },
        {
          question: 'Will I receive a completion certificate?',
          answer:
            'Yes! Once you complete all lessons and achieve passing scores on milestone quizzes, you can claim a verifiable digital certificate.',
        },
      ];

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.metaTitle || course.title,
    description: course.metaDescription || course.description,
    url: canonical,
    image: course.thumbnail || `${siteUrl}/og-image.png`,
    inLanguage: course.locale,
    isAccessibleForFree: course.price === 0,
    provider: {
      '@type': 'Organization',
      name: 'Quiz Do',
      url: siteUrl,
      sameAs: siteUrl,
    },
    offers: {
      '@type': 'Offer',
      price: course.price,
      priceCurrency: 'INR',
      category: course.price === 0 ? 'Free' : 'Paid',
      availability: 'https://schema.org/InStock',
    },
    numberOfLessons: course.lessonCount,
    educationalCredentialAwarded: 'Certificate of Completion',
    hasCourseInstance: [
      {
        '@type': 'CourseInstance',
        courseMode: 'Online',
        courseWorkload: `PT${Math.max(1, Math.round(totalDurationHours || course.chapterCount * 2))}H`,
        instructor: course.instructor?.name
          ? { '@type': 'Person', name: course.instructor.name }
          : { '@type': 'Organization', name: 'Quiz Do Faculty Expert Team', url: siteUrl },
      },
    ],
    hasPart: curriculum.slice(0, 20).map((ch, idx) => ({
      '@type': 'Course',
      name: ch.title,
      description: ch.summary || `${ch.lessons.length} lessons in this chapter`,
      position: idx + 1,
    })),
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Courses', item: `${siteUrl}/courses` },
      { '@type': 'ListItem', position: 3, name: course.title, item: canonical },
    ],
  };

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-[var(--background)] flex flex-col justify-between">
      <script
        id={`jsonld-course-${course._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />
      <script
        id={`jsonld-course-breadcrumb-${course._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        id={`jsonld-course-faq-${course._id}`}
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <MarketingHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12 flex-1 w-full">
        {/* Navigation Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-[var(--color-muted-foreground)] flex items-center gap-2">
          <Link href="/courses" className="hover:text-[var(--color-primary)] transition-colors">Courses</Link>
          <span>/</span>
          <span className="text-[var(--color-foreground)] font-medium truncate">{course.category}</span>
        </nav>

        {/* Thumbnail Preview if present */}
        {course.thumbnail && (
          <div className="relative h-56 sm:h-72 rounded-2xl overflow-hidden bg-[var(--color-surface-muted)] border border-[var(--border)]">
            <Image
              src={course.thumbnail}
              alt=""
              fill
              aria-hidden
              className="object-cover blur-md opacity-25 scale-110"
            />
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-contain p-2"
              priority
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        {/* Header Section */}
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-[var(--student-soft)] text-[var(--student-primary)] border border-[var(--student-border)]">
            <Flame className="w-3.5 h-3.5" />
            {course.category}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--color-foreground)] leading-tight">
            {course.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs sm:text-sm text-[var(--color-muted-foreground)] pt-1">
            <span className="inline-flex items-center gap-1.5 font-medium text-[var(--color-foreground)]">
              <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
              {course.chapterCount} Chapters
            </span>
            <span>•</span>
            <span>{course.lessonCount} Lessons</span>
            {totalDurationHours > 0 && (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  ~{totalDurationHours} hrs
                </span>
              </>
            )}
            <span>•</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {course.price === 0 ? '100% Free' : `₹${course.price}`}
            </span>
            {course.instructor?.name && (
              <>
                <span>•</span>
                <span>By {course.instructor.name}</span>
              </>
            )}
          </div>
        </header>

        {/* Value Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Interactive Quizzes', icon: CheckCircle2, text: 'Milestone Tests' },
            { label: 'Verified Certificate', icon: Award, text: 'Upon Completion' },
            { label: 'Flexible Paced', icon: Clock, text: 'Self-Directed' },
            { label: 'Comprehensive', icon: ShieldCheck, text: 'Exam Aligned' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--color-surface)] flex flex-col gap-1 text-center items-center shadow-xs"
              >
                <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                <span className="text-xs font-bold text-[var(--color-foreground)]">{item.label}</span>
                <span className="text-[11px] text-[var(--color-muted-foreground)]">{item.text}</span>
              </div>
            );
          })}
        </div>

        {/* Course Overview */}
        <section className="space-y-3">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--color-foreground)]">
            About this Course
          </h2>
          <div className="prose prose-sm sm:prose-base max-w-none text-[var(--color-foreground)]/90 leading-relaxed bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--border)] shadow-xs">
            <p>{course.description}</p>
          </div>
        </section>

        {/* Course Curriculum & Syllabus */}
        <PublicCourseCurriculum chapters={curriculum} totalLessons={course.lessonCount} />

        {/* FAQ Section */}
        <PublicCourseFaq faqs={faqItems} courseTitle={course.title} />

        {/* Auto Enroll Handler for redirect flows */}
        <Suspense fallback={null}>
          <AutoEnrollHandler courseId={course._id} />
        </Suspense>

        {/* CTA Banner */}
        <div className="rounded-2xl bg-gradient-to-br from-[var(--student-soft)] to-[var(--color-surface)] border border-[var(--student-border)] p-8 sm:p-10 text-center shadow-sm space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)]">
            Ready to Begin Your Preparation?
          </h2>
          <p className="text-sm sm:text-base text-[var(--color-muted-foreground)] max-w-xl mx-auto">
            Sign up free to enroll in this course, track your progress, attempt milestone quizzes, and claim your certificate.
          </p>
          <div>
            <Link
              href={`${ROUTES.register}?callbackUrl=${encodeURIComponent(`/courses/${course.slug}?enroll=true`)}`}
              className="inline-flex items-center px-8 py-3.5 rounded-xl bg-[var(--color-primary)] text-white font-bold hover:opacity-90 transition-opacity shadow-md text-sm sm:text-base"
            >
              Enroll Free & Start Learning
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
