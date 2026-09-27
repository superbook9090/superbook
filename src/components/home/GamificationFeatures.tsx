'use client';

import { motion } from 'framer-motion';
import { Trophy, Timer, Flame, Medal, Target, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Badge from '@/components/ui/Badge';

const features = [
  {
    icon: <Trophy className="w-8 h-8 text-yellow-500" />,
    title: 'Global Leaderboards',
    desc: 'Compete with thousands of students. Climb the ranks and showcase your knowledge.',
  },
  {
    icon: <Timer className="w-8 h-8 text-blue-500" />,
    title: 'Timed Mock Tests',
    desc: 'Experience real exam pressure. Practice with precision timing and auto-submission.',
  },
  {
    icon: <Flame className="w-8 h-8 text-orange-500" />,
    title: 'Daily Streaks',
    desc: 'Consistency is key. Maintain your learning streak and earn exclusive profile badges.',
  },
  {
    icon: <Medal className="w-8 h-8 text-purple-500" />,
    title: 'Achievement Badges',
    desc: 'Unlock special badges for perfect scores, fast completions, and topic mastery.',
  },
  {
    icon: <Target className="w-8 h-8 text-emerald-500" />,
    title: 'Precision Accuracy',
    desc: 'Track your exact accuracy percentages and compare them against global averages.',
  },
  {
    icon: <Zap className="w-8 h-8 text-cyan-500" />,
    title: 'Real-time Scoring',
    desc: 'Instant feedback as you submit. No waiting, know exactly where you stand.',
  },
];

export default function GamificationFeatures() {

  return (
    <section className="relative py-16 sm:py-32 overflow-hidden bg-[var(--background)]">
      {/* Deep Space Background / Aurora Glow */}
      <div className="absolute inset-0 pointer-events-none aria-hidden">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[100px] -z-10 mix-blend-screen" />
        <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-purple-500/10 rounded-full blur-[120px] -z-10 mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-6 px-3 py-1 bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 border-indigo-500/20 text-sm font-semibold rounded-full gap-2">
              <Flame className="w-4 h-4" /> Gamified Learning
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight mb-6">
              Level Up Your Learning Experience
            </h2>
            <p className="text-lg text-[var(--muted)] leading-relaxed">
              Don&apos;t just study—compete, earn rewards, and track your mastery. Our interactive mock tests and dynamic leaderboards turn preparation into an engaging challenge.
            </p>
          </motion.div>
        </div>

        {/* 3D Isometric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 perspective-1000">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, rotateX: 20, y: 40 }}
              whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: idx * 0.1, ease: 'easeOut' }}
              whileHover={{ 
                scale: 1.05, 
                rotateX: 5,
                rotateY: -5,
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                transition: { duration: 0.3 }
              }}
              className="transform-gpu transition-all duration-300"
            >
              <Card className="group relative h-full rounded-3xl antigravity-glass bg-white/5 dark:bg-black/20 border border-white/10 dark:border-white/5 backdrop-blur-xl overflow-hidden">
                {/* Inner Glow on Hover */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <CardContent className="relative z-10 flex flex-col items-center text-center h-full p-6 sm:p-8">
                  <div className="mb-6 p-4 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/10 shadow-inner inline-flex justify-center items-center">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[var(--muted)] text-sm leading-relaxed flex-grow">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
