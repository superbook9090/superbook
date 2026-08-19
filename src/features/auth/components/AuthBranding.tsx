'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import Link from 'next/link';
import BrandLogo from '@/components/ui/BrandLogo';
import { ROUTES } from '@/constants/routes';
import {
  Sparkles,
  Trophy,
  BookOpen,
  TrendingUp,
  Users,
  Star,
} from 'lucide-react';

export default function AuthBranding() {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:flex lg:w-[46%] xl:w-[48%] relative overflow-hidden bg-gradient-to-br from-[#3730a3] via-[#581c87] to-[#1e1b4b] text-white flex-col justify-between p-8 xl:p-12 2xl:p-14 h-full select-none">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/30 rounded-full blur-[100px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 -right-20 w-80 h-80 bg-purple-500/25 rounded-full blur-[90px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full blur-[110px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Subtle Geometric Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
      </div>

      {/* Top Header Bar: Logo + Tagline Badge */}
      <div className="relative z-10 flex items-center justify-between gap-4">
        <Link
          href={ROUTES.home}
          className="group inline-flex items-center gap-2 transition-transform hover:scale-[1.02] focus:outline-none rounded-xl"
          aria-label="Back to home"
        >
          <BrandLogo size="md" mono className="text-white opacity-95 group-hover:opacity-100 transition-opacity" />
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-medium text-purple-100 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
          <span>Interactive Learning & Smart Quizzes</span>
        </motion.div>
      </div>

      {/* Center Core Showcase */}
      <div className="relative z-10 my-auto py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-3"
        >
          <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-extrabold tracking-tight leading-[1.12]">
            {t('login.learnSmarter')}{' '}
            <span className="block bg-gradient-to-r from-violet-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
              {t('login.growFaster')}
            </span>
          </h1>
          <p className="text-sm xl:text-base text-purple-100/80 max-w-md font-normal leading-relaxed">
            {t('login.joinThousands')}
          </p>
        </motion.div>

        {/* Live Quiz Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/20 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Live Quiz Arena
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>Top 1% Rank</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-white/95 truncate">
                Full-Stack & Data Structures
              </span>
              <span className="text-purple-200 font-bold">96%</span>
            </div>
            {/* Animated Progress Bar */}
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '96%' }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 rounded-full"
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-purple-100/70">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>2,480 Active Participants</span>
            </div>
            <span className="text-emerald-300 font-medium">Instant Feedback</span>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap gap-2 pt-1"
        >
          {[
            { icon: BookOpen, label: t('login.interactiveCourses') },
            { icon: Trophy, label: t('login.liveQuizzes') },
            { icon: TrendingUp, label: t('login.progressTracking') },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.07] backdrop-blur-md border border-white/10 text-xs font-medium text-white/90 hover:bg-white/15 transition-colors"
              >
                <Icon className="w-3.5 h-3.5 text-indigo-300" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Bottom Metrics Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.45 }}
        className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center"
      >
        <div className="space-y-0.5">
          <div className="text-lg xl:text-xl font-black text-white tracking-tight">50K+</div>
          <div className="text-[11px] text-purple-200/70 font-medium">Students</div>
        </div>
        <div className="space-y-0.5 border-x border-white/10 px-2">
          <div className="text-lg xl:text-xl font-black text-white tracking-tight">1,200+</div>
          <div className="text-[11px] text-purple-200/70 font-medium">Quizzes</div>
        </div>
        <div className="space-y-0.5">
          <div className="inline-flex items-center justify-center gap-1 text-lg xl:text-xl font-black text-white tracking-tight">
            4.9 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[11px] text-purple-200/70 font-medium">Rating</div>
        </div>
      </motion.div>
    </div>
  );
}
