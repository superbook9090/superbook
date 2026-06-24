import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

const FAQS = [
  {
    question: 'What is the best free quiz maker online?',
    answer:
      'Quiz-Do is a free online quiz maker that lets teachers and students create MCQ quizzes, timed mock tests, and practice exams. Sign up free, build your quiz in minutes, and share it instantly — no credit card required.',
  },
  {
    question: 'How do I create a quiz for free?',
    answer:
      'Register on Quiz-Do, open the quiz builder, add your questions and answers, set a time limit if needed, and publish. Your quiz is ready to share via link or course enrollment.',
  },
  {
    question: 'Can I use Quiz-Do as an online quiz maker for teachers?',
    answer:
      'Yes. Quiz-Do is built for teachers — create classroom quizzes, homework assignments, UPTET/CTET practice tests, and full test series with automatic grading and student analytics.',
  },
  {
    question: 'Is Quiz-Do free for students to take quizzes?',
    answer:
      'Yes. Students can register free, enroll in public courses, take practice quizzes, and track their scores and progress on a personal dashboard.',
  },
];

export default function HomeQuizMakerSeo() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  return (
    <section className="py-16 bg-white border-t border-[var(--border)]" aria-labelledby="quiz-maker-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="quiz-maker-heading" className="text-3xl font-bold text-[var(--color-foreground)] mb-4">
          Free Quiz Maker for Teachers, Students &amp; Coaching Institutes
        </h2>
        <p className="text-lg text-[var(--color-muted-foreground)] leading-relaxed mb-6">
          <strong>Quiz-Do</strong> is a free online <strong>quiz maker</strong> and learning platform.
          Create interactive quizzes, MCQ tests, mock exams, and full test series — then share them
          with one link. Whether you need a <strong>free quiz maker</strong> for classroom assessments,
          competitive exam prep (UPTET, CTET, SSC), or self-study practice, Quiz-Do gives you
          everything in one place.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Online Quiz Maker</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Build MCQ quizzes with time limits, instant auto-grading, and detailed analytics.
              Perfect for teachers who want a fast, free quiz creator.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">AI Quiz Generator</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Paste study notes or a topic and let AI generate quiz questions automatically.
              Review, edit, and publish in under a minute.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Test Series &amp; Mock Exams</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Bundle quizzes into timed test series for exam simulation. Track student performance
              across every attempt.
            </p>
          </div>
          <div className="rounded-xl border border-[var(--border)] p-5">
            <h3 className="font-semibold text-[var(--color-foreground)] mb-2">Courses + Quizzes</h3>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Combine structured lessons with embedded quizzes. One LMS platform for teaching,
              testing, and progress tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-10">
          <Link
            href="/quiz-maker-free"
            className="inline-flex items-center px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Try Free Quiz Maker →
          </Link>
          <Link
            href="/ai-quiz-generator"
            className="inline-flex items-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            AI Quiz Generator
          </Link>
          <Link
            href={ROUTES.register}
            className="inline-flex items-center px-6 py-3 rounded-xl border border-[var(--border)] text-[var(--color-foreground)] font-semibold hover:bg-[var(--color-surface-muted)] transition-colors"
          >
            Create Free Account
          </Link>
        </div>

        <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-4">Frequently Asked Questions</h3>
        <dl className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-[var(--border)] p-5">
              <dt className="font-semibold text-[var(--color-foreground)] mb-2">{faq.question}</dt>
              <dd className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{faq.answer}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm text-[var(--color-muted-foreground)]">
          Explore our{' '}
          <Link href="/quiz-maker-free" className="text-[var(--color-primary)] hover:underline">
            free quiz maker
          </Link>
          ,{' '}
          <Link href="/mcq-generator" className="text-[var(--color-primary)] hover:underline">
            MCQ generator
          </Link>
          ,{' '}
          <Link href="/test-series-maker-free" className="text-[var(--color-primary)] hover:underline">
            test series maker
          </Link>
          , and{' '}
          <Link href={ROUTES.blogs} className="text-[var(--color-primary)] hover:underline">
            educational blogs
          </Link>{' '}
          for study tips and exam preparation guides.
        </p>
      </div>
    </section>
  );
}
