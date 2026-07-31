'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  Bell,
  BarChart,
  User,
  Users,
  Video,
  FileText,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { landing } from '@/components/home/landingStyles';
import BrandLogo from '@/components/ui/BrandLogo';

function Accordion({ title, children }: { title: string; children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-[var(--border)] rounded-2xl bg-[var(--color-surface-muted)] overflow-hidden mb-4 hover:bg-[var(--card-solid)] hover:shadow-md transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--student-primary)]"
      >
        <h3 className="text-lg font-semibold text-[var(--color-foreground)]">{title}</h3>
        <ChevronDown
          className={`w-5 h-5 text-[var(--color-muted-foreground)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''
            }`}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-5 pt-0 text-[var(--color-muted-foreground)] border-t border-[var(--border)] mt-4 leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TimelineItem({ icon: Icon, title, description, isLast = false, theme = 'student' }: {
  icon: React.ElementType;
  title: string;
  description: string;
  isLast?: boolean;
  theme?: 'student' | 'teacher' | 'admin';
}) {
  const isStudent = theme === 'student';

  return (
    <div className="relative flex gap-6 pb-10">
      {!isLast && (
        <div className={`absolute left-6 top-10 bottom-0 w-[2px] -translate-x-1/2 border-l-2 border-dashed ${isStudent ? 'border-[var(--student-border)]' : 'border-[var(--teacher-border)]'}`} />
      )}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm ${isStudent ? 'bg-[var(--student-soft)] border-[var(--student-border)] text-[var(--student-primary)]' : 'bg-[var(--teacher-soft)] border-[var(--teacher-border)] text-[var(--teacher-primary)]'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-lg font-bold text-[var(--color-foreground)] mb-1">
          {title}
        </h4>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}

export default function HowItWorksClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--background)] pb-20">
      {/* Header bar */}
      <header className="sticky top-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className={`${landing.container} h-16 flex items-center justify-between`}>
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <div className="flex items-center">
              <BrandLogo size="md" className="text-[var(--color-foreground)]" />
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href={ROUTES.login}
              className="text-sm font-medium text-[var(--color-foreground)] hover:text-[var(--student-primary)] transition-colors"
            >
              {t('home.login')}
            </Link>
          </div>
        </div>
      </header>

      <div className={landing.container}>
        <PageWrapper>
          <div className="py-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--student-soft)] rounded-full border border-[var(--student-border)] mb-6">
              <Sparkles className="w-4 h-4 text-[var(--student-primary)]" aria-hidden />
              <span className="text-sm font-semibold text-[var(--student-primary)]">
                {t('home.howItWorksPage.title')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-foreground)] mb-6 leading-tight">
              {t('home.howItWorksPage.title')}
            </h1>
            <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed">
              {t('home.howItWorksPage.subtitle')}
            </p>
          </div>

          <div className="space-y-16">
            {/* Section 1: Overview */}
            <section>
              <div className="bg-gradient-to-br from-[var(--student-primary)] to-[var(--teacher-primary)] rounded-[32px] p-[2px] shadow-xl">
                <div className="bg-[var(--card-solid)] rounded-[30px] p-8 sm:p-12 h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--student-soft)] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden />
                  <h2 className="text-3xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-3 relative z-10">
                    <GraduationCap className="w-8 h-8 text-[var(--student-primary)]" />
                    {t('home.howItWorksPage.platformOverview.title')}
                  </h2>
                  <div className="space-y-4 text-lg text-[var(--color-muted-foreground)] leading-relaxed relative z-10 max-w-4xl">
                    <p>{t('home.howItWorksPage.platformOverview.intro')}</p>
                    <p>{t('home.howItWorksPage.platformOverview.benefits')}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Journeys Split View */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
              {/* Student Journey */}
              <section className="bg-[var(--card-solid)] border-2 border-[var(--student-border)] rounded-[32px] p-8 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--student-primary)] to-[var(--student-accent)]" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[var(--student-soft)] rounded-2xl flex items-center justify-center border border-[var(--student-border)]">
                    <User className="w-7 h-7 text-[var(--student-primary)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--color-foreground)]">
                    {t('home.howItWorksPage.studentJourney.title')}
                  </h2>
                </div>
                <p className="text-lg text-[var(--color-muted-foreground)] mb-10 pb-6 border-b border-[var(--border)]">
                  {t('home.howItWorksPage.studentJourney.desc')}
                </p>

                <div className="pl-2">
                  <TimelineItem theme="student" icon={User} title={t('home.howItWorksPage.studentJourney.steps.register').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.register').split(':')[1]} />
                  <TimelineItem theme="student" icon={Users} title={t('home.howItWorksPage.studentJourney.steps.joinOrg').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.joinOrg').split(':')[1]} />
                  <TimelineItem theme="student" icon={BookOpen} title={t('home.howItWorksPage.studentJourney.steps.browse').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.browse').split(':')[1]} />
                  <TimelineItem theme="student" icon={Lock} title={t('home.howItWorksPage.studentJourney.steps.joinPrivate').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.joinPrivate').split(':')[1]} />
                  <TimelineItem theme="student" icon={CheckCircle} title={t('home.howItWorksPage.studentJourney.steps.enroll').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.enroll').split(':')[1]} />
                  <TimelineItem theme="student" icon={Video} title={t('home.howItWorksPage.studentJourney.steps.learn').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.learn').split(':')[1]} />
                  <TimelineItem theme="student" icon={FileText} title={t('home.howItWorksPage.studentJourney.steps.quiz').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.quiz').split(':')[1]} />
                  <TimelineItem theme="student" icon={BarChart} title={t('home.howItWorksPage.studentJourney.steps.track').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.track').split(':')[1]} />
                  <TimelineItem theme="student" icon={CheckCircle} title={t('home.howItWorksPage.studentJourney.steps.results').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.results').split(':')[1]} />
                  <TimelineItem theme="student" icon={FileText} title={t('home.howItWorksPage.studentJourney.steps.blogs').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.blogs').split(':')[1]} />
                  <TimelineItem theme="student" icon={Bell} title={t('home.howItWorksPage.studentJourney.steps.notify').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.notify').split(':')[1]} isLast />
                </div>
              </section>

              {/* Teacher Journey */}
              <section className="bg-[var(--card-solid)] border-2 border-[var(--teacher-border)] rounded-[32px] p-8 sm:p-10 shadow-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[var(--teacher-primary)] to-[var(--teacher-accent)]" />
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-[var(--teacher-soft)] rounded-2xl flex items-center justify-center border border-[var(--teacher-border)]">
                    <GraduationCap className="w-7 h-7 text-[var(--teacher-primary)]" />
                  </div>
                  <h2 className="text-3xl font-bold text-[var(--color-foreground)]">
                    {t('home.howItWorksPage.teacherJourney.title')}
                  </h2>
                </div>
                <p className="text-lg text-[var(--color-muted-foreground)] mb-10 pb-6 border-b border-[var(--border)]">
                  {t('home.howItWorksPage.teacherJourney.desc')}
                </p>

                <div className="pl-2">
                  <TimelineItem theme="teacher" icon={BookOpen} title={t('home.howItWorksPage.teacherJourney.steps.createCourse').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.createCourse').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={Video} title={t('home.howItWorksPage.teacherJourney.steps.addContent').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.addContent').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={FileText} title={t('home.howItWorksPage.teacherJourney.steps.createQuizzes').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.createQuizzes').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={CheckCircle} title={t('home.howItWorksPage.teacherJourney.steps.publish').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.publish').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={Users} title={t('home.howItWorksPage.teacherJourney.steps.manageStudents').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.manageStudents').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={BarChart} title={t('home.howItWorksPage.teacherJourney.steps.analytics').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.analytics').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={FileText} title={t('home.howItWorksPage.teacherJourney.steps.blogs').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.blogs').split(':')[1]} />
                  <TimelineItem theme="teacher" icon={Lock} title={t('home.howItWorksPage.teacherJourney.steps.privateAccess').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.privateAccess').split(':')[1]} isLast />
                </div>
              </section>
            </div>

            {/* Deep Dives via Accordions */}
            <section className="max-w-4xl mx-auto mt-16">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                Deep Dive into Features
              </h2>
              <div className="space-y-4">
                <Accordion title={t('home.howItWorksPage.orgWorkflow.title')}>
                  <p className="mb-4">{t('home.howItWorksPage.orgWorkflow.desc')}</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('home.howItWorksPage.orgWorkflow.adminRoles')}</li>
                    <li>{t('home.howItWorksPage.orgWorkflow.teacherRoles')}</li>
                    <li>{t('home.howItWorksPage.orgWorkflow.studentRoles')}</li>
                    <li>{t('home.howItWorksPage.orgWorkflow.isolation')}</li>
                  </ul>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.courseSystem.title')}>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('home.howItWorksPage.courseSystem.public')}</li>
                    <li>{t('home.howItWorksPage.courseSystem.private')}</li>
                    <li>{t('home.howItWorksPage.courseSystem.path')}</li>
                  </ul>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.quizSystem.title')}>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('home.howItWorksPage.quizSystem.placement')}</li>
                    <li>{t('home.howItWorksPage.quizSystem.attempts')}</li>
                    <li>{t('home.howItWorksPage.quizSystem.analytics')}</li>
                  </ul>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.blogSystem.title')}>
                  <p>{t('home.howItWorksPage.blogSystem.desc')}</p>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.progressTracking.title')}>
                  <p className="mb-4">{t('home.howItWorksPage.progressTracking.desc')}</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>{t('home.howItWorksPage.progressTracking.studentInsights')}</li>
                    <li>{t('home.howItWorksPage.progressTracking.teacherInsights')}</li>
                  </ul>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.notifications.title')}>
                  <p>{t('home.howItWorksPage.notifications.desc')}</p>
                </Accordion>

                <Accordion title={t('home.howItWorksPage.securityPrivacy.title')}>
                  <p>{t('home.howItWorksPage.securityPrivacy.desc')}</p>
                </Accordion>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-20 px-4 bg-[var(--student-primary)] text-white rounded-[40px] mt-20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--student-primary)] to-[var(--teacher-primary)]" />
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

              <div className="relative z-10">
                <h2 className="text-4xl font-bold mb-6">
                  {t('home.cta.title')}
                </h2>
                <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t('home.cta.subtitle')}
                </p>
                <Link
                  href={ROUTES.register}
                  className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold rounded-2xl text-[var(--student-primary)] bg-white hover:bg-white/90 transition-colors shadow-xl"
                >
                  {t('home.cta.button')}
                </Link>
              </div>
            </section>
          </div>
        </PageWrapper>
      </div>
    </div>
  );
}
