'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X, ChevronRight } from 'lucide-react';
import { useFeature } from '@/contexts/AppSettingsContext';
import { ROUTES } from '@/constants/routes';

export default function ContestMarketingPopup() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const enableContestMarketingPopup = useFeature('enableContestMarketingPopup');

  useEffect(() => {
    if (!enableContestMarketingPopup) return;
    
    // Only show if the user just logged in or registered
    const justLoggedIn = sessionStorage.getItem('quizdo_just_logged_in');
    if (justLoggedIn === 'true') {
      // Delay slightly for better UX (let dashboard render first)
      const timer = setTimeout(() => {
        setIsVisible(true);
        sessionStorage.removeItem('quizdo_just_logged_in');
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [enableContestMarketingPopup]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          onClick={() => setIsVisible(false)}
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[var(--card-solid)] border border-[var(--color-border)] rounded-3xl shadow-2xl overflow-hidden z-10 pointer-events-auto"
        >
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-yellow-400 to-orange-500 opacity-20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 p-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-surface-muted)] rounded-full transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', duration: 0.8, delay: 0.2 }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 rounded-2xl flex items-center justify-center shadow-inner border border-yellow-300/30"
            >
              <Trophy className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
            </motion.div>

            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold tracking-tight text-[var(--color-foreground)]">
                Compete & Win!
              </h2>
              <p className="text-[var(--color-muted-foreground)] text-sm leading-relaxed">
                Join our latest exciting contests. Challenge your peers, test your knowledge, and climb the leaderboard.
              </p>
            </div>

            <button
              onClick={() => {
                setIsVisible(false);
                router.push(ROUTES.student.contests);
              }}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] hover:shadow-[0_6px_20px_rgba(249,115,22,0.23)] hover:scale-[1.02] active:scale-[0.98] transition-all group"
            >
              <span>View Contests</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
