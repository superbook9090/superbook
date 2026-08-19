'use client';

import { motion } from 'framer-motion';
import { Award, BookOpen, CheckCircle, Sparkles, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface PublicCoursesHeroProps {
  totalCourses: number;
}

export default function PublicCoursesHero({ totalCourses }: PublicCoursesHeroProps) {
  const { t } = useTranslation();

  const highlights = [
    { icon: BookOpen, label: 'Structured Lessons', color: 'text-violet-500 bg-violet-500/10' },
    { icon: CheckCircle, label: 'Embedded Quizzes', color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: Award, label: 'Certificates', color: 'text-amber-500 bg-amber-500/10' },
    { icon: Users, label: 'Free Enrollment', color: 'text-blue-500 bg-blue-500/10' },
  ];

  return (
    <section className="relative pt-8 pb-12 overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[var(--student-primary)]/15 via-[var(--teacher-accent)]/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center px-4">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--student-soft)] border border-[var(--student-border)] text-xs font-bold text-[var(--student-primary)] mb-6 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-[var(--student-primary)]" />
          <span>{t('courses.availableCourses')}: {totalCourses}</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl lg:text-6xl font-black text-[var(--color-foreground)] tracking-tight mb-5 leading-tight"
        >
          {t('courses.exploreTitle')}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-base sm:text-lg text-[var(--color-muted-foreground)] max-w-2xl mx-auto mb-8 leading-relaxed"
        >
          {t('courses.exploreSubtitle')}
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[var(--card-solid)] border border-[var(--border)] shadow-sm text-xs font-semibold text-[var(--color-foreground)]"
              >
                <div className={`p-1 rounded-lg ${item.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
