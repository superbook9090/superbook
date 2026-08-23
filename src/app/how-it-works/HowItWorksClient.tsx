'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { motion } from 'framer-motion';
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
  Sparkles
} from 'lucide-react';
import { PageWrapper } from '@/components/layout';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';
import { landing } from '@/components/home/landingStyles';
import MarketingHeader from '@/components/home/MarketingHeader';
import Footer from '@/components/home/Footer';
import { Accordion } from '@/components/ui/Accordion';

function TimelineItem({ icon: Icon, title, description, isLast = false, theme = 'student', index = 0 }: {
  icon: React.ElementType;
  title: string;
  description: string;
  isLast?: boolean;
  theme?: 'student' | 'teacher' | 'admin';
  index?: number;
}) {
  const isStudent = theme === 'student';

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative flex gap-6 pb-10 group"
    >
      {!isLast && (
        <div className={`absolute left-6 top-10 bottom-0 w-[2px] -translate-x-1/2 border-l-2 border-dashed ${isStudent ? 'border-[var(--student-border)] group-hover:border-[var(--student-primary)]/50' : 'border-[var(--teacher-border)] group-hover:border-[var(--teacher-primary)]/50'} transition-colors duration-300`} />
      )}
      <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${isStudent ? 'bg-[var(--student-soft)] border-[var(--student-border)] text-[var(--student-primary)] group-hover:shadow-[0_0_15px_rgba(var(--student-primary-rgb),0.3)]' : 'bg-[var(--teacher-soft)] border-[var(--teacher-border)] text-[var(--teacher-primary)] group-hover:shadow-[0_0_15px_rgba(var(--teacher-primary-rgb),0.3)]'}`}>
        <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
      </div>
      <div className="flex-1 pt-1 transition-transform duration-300 group-hover:translate-x-1">
        <h4 className={`text-lg font-bold text-[var(--color-foreground)] mb-1 transition-colors duration-300 ${isStudent ? 'group-hover:text-[var(--student-primary)]' : 'group-hover:text-[var(--teacher-primary)]'}`}>
          {title}
        </h4>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HowItWorksClient() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      <MarketingHeader forceScrolled />

      <div className={`${landing.container} flex-1 mt-20 sm:mt-24 pb-20`}>
        <PageWrapper>
          {/* Hero Section */}
          <div className="relative py-24 sm:py-32 text-center max-w-4xl mx-auto overflow-hidden rounded-[3rem]">
            {/* Dynamic Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--surface-muted)]/30 to-transparent backdrop-blur-3xl border border-white/10 dark:border-white/5 z-0" />
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 blur-[120px] rounded-full pointer-events-none z-0" />
            <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-[var(--primary-accent)]/10 blur-[120px] rounded-full pointer-events-none z-0" />
            
            <div className="relative z-10 px-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[var(--student-soft)] to-transparent rounded-full border border-[var(--student-border)] mb-8 shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[var(--student-primary)]" aria-hidden />
                <span className="text-sm font-bold tracking-wide text-[var(--student-primary)] uppercase">
                  {t('home.howItWorksPage.title')}
                </span>
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-foreground)] to-[var(--color-muted-foreground)] mb-6 leading-tight tracking-tight"
              >
                {t('home.howItWorksPage.title')}
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-xl sm:text-2xl text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl mx-auto font-medium"
              >
                {t('home.howItWorksPage.subtitle')}
              </motion.p>
            </div>
          </div>

          <div className="space-y-24 mt-16">
            {/* Section 1: Overview */}
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative overflow-hidden bg-white/40 dark:bg-[#101319]/60 backdrop-blur-xl border border-[var(--color-border)] rounded-[2.5rem] p-8 sm:p-14 shadow-lg hover:shadow-xl transition-shadow duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/5 to-transparent pointer-events-none" />
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[var(--student-soft)] rounded-3xl flex items-center justify-center border border-[var(--student-border)] mb-8 shadow-sm">
                    <GraduationCap className="w-10 h-10 text-[var(--student-primary)]" />
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] mb-6 tracking-tight">
                    {t('home.howItWorksPage.platformOverview.title')}
                  </h2>
                  <div className="space-y-6 text-lg sm:text-xl text-[var(--color-muted-foreground)] leading-relaxed max-w-3xl font-medium">
                    <p>{t('home.howItWorksPage.platformOverview.intro')}</p>
                    <p>{t('home.howItWorksPage.platformOverview.benefits')}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Journeys Split View */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12">
              {/* Student Journey */}
              <section className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-[32px] p-6 sm:p-10 shadow-[var(--shadow-sm)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'var(--student-gradient)' }} />
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
                  <TimelineItem index={0} theme="student" icon={User} title={t('home.howItWorksPage.studentJourney.steps.register').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.register').split(':')[1]} />
                  <TimelineItem index={1} theme="student" icon={Users} title={t('home.howItWorksPage.studentJourney.steps.joinOrg').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.joinOrg').split(':')[1]} />
                  <TimelineItem index={2} theme="student" icon={BookOpen} title={t('home.howItWorksPage.studentJourney.steps.browse').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.browse').split(':')[1]} />
                  <TimelineItem index={3} theme="student" icon={Lock} title={t('home.howItWorksPage.studentJourney.steps.joinPrivate').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.joinPrivate').split(':')[1]} />
                  <TimelineItem index={4} theme="student" icon={CheckCircle} title={t('home.howItWorksPage.studentJourney.steps.enroll').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.enroll').split(':')[1]} />
                  <TimelineItem index={5} theme="student" icon={Video} title={t('home.howItWorksPage.studentJourney.steps.learn').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.learn').split(':')[1]} />
                  <TimelineItem index={6} theme="student" icon={FileText} title={t('home.howItWorksPage.studentJourney.steps.quiz').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.quiz').split(':')[1]} />
                  <TimelineItem index={7} theme="student" icon={BarChart} title={t('home.howItWorksPage.studentJourney.steps.track').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.track').split(':')[1]} />
                  <TimelineItem index={8} theme="student" icon={CheckCircle} title={t('home.howItWorksPage.studentJourney.steps.results').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.results').split(':')[1]} />
                  <TimelineItem index={9} theme="student" icon={FileText} title={t('home.howItWorksPage.studentJourney.steps.blogs').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.blogs').split(':')[1]} />
                  <TimelineItem index={10} theme="student" icon={Bell} title={t('home.howItWorksPage.studentJourney.steps.notify').split(':')[0]} description={t('home.howItWorksPage.studentJourney.steps.notify').split(':')[1]} isLast />
                </div>
              </section>

              {/* Teacher Journey */}
              <section className="bg-[var(--card-solid)] border border-[var(--color-border)] rounded-[32px] p-6 sm:p-10 shadow-[var(--shadow-sm)] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[3px]" style={{ background: 'var(--teacher-gradient)' }} />
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
                  <TimelineItem index={0} theme="teacher" icon={BookOpen} title={t('home.howItWorksPage.teacherJourney.steps.createCourse').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.createCourse').split(':')[1]} />
                  <TimelineItem index={1} theme="teacher" icon={Video} title={t('home.howItWorksPage.teacherJourney.steps.addContent').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.addContent').split(':')[1]} />
                  <TimelineItem index={2} theme="teacher" icon={FileText} title={t('home.howItWorksPage.teacherJourney.steps.createQuizzes').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.createQuizzes').split(':')[1]} />
                  <TimelineItem index={3} theme="teacher" icon={CheckCircle} title={t('home.howItWorksPage.teacherJourney.steps.publish').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.publish').split(':')[1]} />
                  <TimelineItem index={4} theme="teacher" icon={Users} title={t('home.howItWorksPage.teacherJourney.steps.manageStudents').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.manageStudents').split(':')[1]} />
                  <TimelineItem index={5} theme="teacher" icon={BarChart} title={t('home.howItWorksPage.teacherJourney.steps.analytics').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.analytics').split(':')[1]} />
                  <TimelineItem index={6} theme="teacher" icon={FileText} title={t('home.howItWorksPage.teacherJourney.steps.blogs').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.blogs').split(':')[1]} />
                  <TimelineItem index={7} theme="teacher" icon={Lock} title={t('home.howItWorksPage.teacherJourney.steps.privateAccess').split(':')[0]} description={t('home.howItWorksPage.teacherJourney.steps.privateAccess').split(':')[1]} isLast />
                </div>
              </section>
            </div>

            {/* Deep Dives via Accordions */}
            <section className="max-w-4xl mx-auto mt-16">
              <h2 className="text-3xl font-bold text-center text-[var(--color-foreground)] mb-10">
                {t('home.howItWorksPage.deepDive')}
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
            <section className="py-24 sm:py-32 relative overflow-hidden text-center w-full rounded-[3rem] mt-10">
              {/* Immersive Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#101319] to-black z-0" />
              <div className="absolute inset-0 bg-[var(--primary)]/10 mix-blend-color z-0" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[var(--primary)]/20 blur-[150px] rounded-full pointer-events-none z-0" />
              <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay pointer-events-none z-0" />

              {/* Floating particles simulation */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full bg-white/20 blur-[2px]"
                    style={{
                      width: Math.random() * 8 + 2 + 'px',
                      height: Math.random() * 8 + 2 + 'px',
                      left: Math.random() * 100 + '%',
                      top: Math.random() * 100 + '%',
                    }}
                    animate={{
                      y: [0, -40, 0],
                      opacity: [0.3, 0.8, 0.3],
                    }}
                    transition={{
                      duration: Math.random() * 4 + 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>

              <div className="relative max-w-4xl mx-auto px-4 z-10 flex flex-col items-center">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white mb-6 drop-shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)]">
                    {t('home.cta.title')}
                  </h2>
                  <p className="text-base sm:text-lg text-white/70 font-medium max-w-xl mx-auto mb-10 leading-relaxed">
                    {t('home.cta.subtitle')}
                  </p>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-block"
                  >
                    <Link
                      href={ROUTES.register}
                      className="group relative inline-flex items-center justify-center px-10 py-5 rounded-2xl text-sm font-black uppercase tracking-widest text-[var(--primary-dark)] bg-white overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-[var(--primary-light)] to-white opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <span className="relative z-10 flex items-center gap-2 group-hover:text-[var(--primary-dark)] transition-colors">
                        {t('home.cta.button')}
                        <span className="group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </section>
          </div>
        </PageWrapper>
      </div>
      <Footer />
    </div>
  );
}
