'use client';

import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Sparkles,
  Trophy,
  BookOpen,
  TrendingUp,
  Users,
  Star,
  GraduationCap,
} from 'lucide-react';

interface AuthBrandingProps {
  mode?: 'login' | 'register';
  className?: string;
}

export default function AuthBranding({ mode = 'login', className = '' }: AuthBrandingProps) {
  const { t } = useTranslation();
  const isRegister = mode === 'register';

  return (
    <div
      className={`hidden lg:flex relative overflow-hidden bg-gradient-to-br from-[#2e1065] via-[#4338ca] to-[#1e1b4b] text-white flex-col justify-between p-6 xl:p-8 select-none ${className}`}
    >
      {/* Background Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <motion.div
          className="absolute -top-20 -left-20 w-72 h-72 bg-indigo-500/25 rounded-full blur-[80px]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 -right-20 w-72 h-72 bg-purple-500/25 rounded-full blur-[80px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-20 left-10 w-72 h-72 bg-pink-500/20 rounded-full blur-[90px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Geometric Micro Dots */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:22px_22px] opacity-40" />
      </div>

      {/* Top Header Badge */}
      <div className="relative z-10 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-semibold text-purple-100 shadow-sm"
        >
          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
          <span>{isRegister ? 'Join 50,000+ Learners' : 'Interactive Learning & Quizzes'}</span>
        </motion.div>

        <div className="flex items-center gap-1.5 text-[11px] text-purple-200/80 font-medium">
          <span className="size-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Live Platform</span>
        </div>
      </div>

      {/* Center Core Showcase */}
      <div className="relative z-10 my-auto py-3 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold tracking-tight leading-[1.15]">
            {isRegister ? (
              <>
                Unlock Your Potential.{' '}
                <span className="block bg-gradient-to-r from-violet-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  Start Today for Free.
                </span>
              </>
            ) : (
              <>
                {t('login.learnSmarter')}{' '}
                <span className="block bg-gradient-to-r from-violet-200 via-pink-200 to-amber-200 bg-clip-text text-transparent">
                  {t('login.growFaster')}
                </span>
              </>
            )}
          </h2>
          <p className="text-xs xl:text-sm text-purple-100/80 max-w-sm font-normal leading-relaxed">
            {t('login.joinThousands')}
          </p>
        </motion.div>

        {/* Live Quiz Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative rounded-2xl bg-white/[0.08] backdrop-blur-xl border border-white/15 p-3.5 sm:p-4 shadow-[0_12px_32px_rgba(0,0,0,0.25)] overflow-hidden"
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
                {isRegister ? 'Weekly Quiz Tournament' : 'Live Quiz Arena'}
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-300/20">
              <Trophy className="w-3 h-3" />
              <span>{isRegister ? 'Top Rewards' : 'Top 1% Rank'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-white/95 truncate">
                Full-Stack & System Design
              </span>
              <span className="text-purple-200 font-bold">96%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '96%' }}
                transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 rounded-full"
              />
            </div>
          </div>

          <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs text-purple-100/75">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-300" />
              <span>2,480 Active Learners</span>
            </div>
            <span className="text-emerald-300 font-medium">Instant AI Feedback</span>
          </div>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap gap-2 pt-0.5"
        >
          {[
            { icon: BookOpen, label: t('login.interactiveCourses') },
            { icon: Trophy, label: t('login.liveQuizzes') },
            { icon: TrendingUp, label: t('login.progressTracking') },
            ...(isRegister ? [{ icon: GraduationCap, label: 'Verified Certificates' }] : []),
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.08] backdrop-blur-md border border-white/10 text-xs font-medium text-white/90 hover:bg-white/15 transition-colors"
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
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 pt-3 border-t border-white/10 grid grid-cols-3 gap-2 text-center"
      >
        <div className="space-y-0.5">
          <div className="text-base xl:text-lg font-black text-white tracking-tight">50K+</div>
          <div className="text-[10px] sm:text-[11px] text-purple-200/75 font-medium">Students</div>
        </div>
        <div className="space-y-0.5 border-x border-white/10 px-2">
          <div className="text-base xl:text-lg font-black text-white tracking-tight">1,200+</div>
          <div className="text-[10px] sm:text-[11px] text-purple-200/75 font-medium">Quizzes</div>
        </div>
        <div className="space-y-0.5">
          <div className="inline-flex items-center justify-center gap-1 text-base xl:text-lg font-black text-white tracking-tight">
            4.9 <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          </div>
          <div className="text-[10px] sm:text-[11px] text-purple-200/75 font-medium">Rating</div>
        </div>
      </motion.div>
    </div>
  );
}
