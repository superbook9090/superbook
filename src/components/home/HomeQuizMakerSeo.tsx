'use client';

import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { useTranslation } from '@/hooks/useTranslation';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4'] as const;

const FAQS_EN = [
  {
    question: 'What is the best free quiz maker online?',
    answer:
      'Quiz Do is a free online quiz maker that lets teachers and students create MCQ quizzes, timed mock tests, and practice exams. Sign up free, build your quiz in minutes, and share it instantly — no credit card required.',
  },
  {
    question: 'How do I create a quiz for free?',
    answer:
      'Register on Quiz Do, open the quiz builder, add your questions and answers, set a time limit if needed, and publish. Your quiz is ready to share via link or course enrollment.',
  },
  {
    question: 'Can I use Quiz Do as an online quiz maker for teachers?',
    answer:
      'Yes. Quiz Do is built for teachers — create classroom quizzes, homework assignments, UPTET/CTET practice tests, and full test series with automatic grading and student analytics.',
  },
  {
    question: 'Is Quiz Do free for students to take quizzes?',
    answer:
      'Yes. Students can register free, enroll in public courses, take practice quizzes, and track their scores and progress on a personal dashboard.',
  },
];

export default function HomeQuizMakerSeo() {
  const { t } = useTranslation();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS_EN.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="py-16 bg-[var(--card-solid)] border-t border-[var(--border)]" aria-labelledby="quiz-maker-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="quiz-maker-heading" className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
          {t('home.quizMakerSeo.title')}
        </h2>
        <p className="text-lg text-[var(--color-muted-foreground)] leading-relaxed mb-6">
          {t('home.quizMakerSeo.intro')}
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">
              {t('home.quizMakerSeo.cards.onlineQuizMaker.title')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {t('home.quizMakerSeo.cards.onlineQuizMaker.description')}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">
              {t('home.quizMakerSeo.cards.aiQuizGenerator.title')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {t('home.quizMakerSeo.cards.aiQuizGenerator.description')}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">
              {t('home.quizMakerSeo.cards.testSeries.title')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {t('home.quizMakerSeo.cards.testSeries.description')}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">
              {t('home.quizMakerSeo.cards.coursesQuizzes.title')}
            </h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              {t('home.quizMakerSeo.cards.coursesQuizzes.description')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/quiz-maker-free"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {t('home.quizMakerSeo.cta.tryQuizMaker')}
          </Link>
          <Link
            href="/ai-quiz-generator"
            className="inline-flex items-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            {t('home.quizMakerSeo.cta.aiQuizGenerator')}
          </Link>
          <Link
            href={ROUTES.register}
            className="inline-flex items-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            {t('home.quizMakerSeo.cta.createAccount')}
          </Link>
        </div>

        <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">
          {t('seoTools.common.faqTitle')}
        </h3>
        <dl className="flex flex-col gap-4">
          {FAQ_KEYS.map((key) => (
            <div key={key} className="rounded-xl border border-[var(--border)] p-5">
              <dt className="font-semibold text-[var(--color-foreground)] mb-2">
                {t(`home.quizMakerSeo.faqs.${key}.question`)}
              </dt>
              <dd className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">
                {t(`home.quizMakerSeo.faqs.${key}.answer`)}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          {t('home.quizMakerSeo.footer.prefix')}{' '}
          <Link href="/quiz-maker-free" className="text-[var(--color-primary)] hover:underline">
            {t('home.quizMakerSeo.footer.freeQuizMaker')}
          </Link>
          ,{' '}
          <Link href="/mcq-generator" className="text-[var(--color-primary)] hover:underline">
            {t('home.quizMakerSeo.footer.mcqGenerator')}
          </Link>
          ,{' '}
          <Link href="/test-series-maker-free" className="text-[var(--color-primary)] hover:underline">
            {t('home.quizMakerSeo.footer.testSeriesMaker')}
          </Link>
          , {t('home.quizMakerSeo.footer.and')}{' '}
          <Link href={ROUTES.blogs} className="text-[var(--color-primary)] hover:underline">
            {t('home.quizMakerSeo.footer.educationalBlogs')}
          </Link>{' '}
          {t('home.quizMakerSeo.footer.suffix')}
        </p>
      </div>
    </section>
  );
}
