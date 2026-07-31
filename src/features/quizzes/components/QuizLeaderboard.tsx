'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '@/components/ui/Leaderboard';
import { Loader } from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';
import { fetchQuizLeaderboard } from '@/lib/api/leaderboard';

interface QuizLeaderboardEntry {
  userId: string;
  name: string;
  image?: string;
  score: number;
  rank: number;
  completedAt: string;
  timeTaken: number; // in seconds
  attemptNumber: number;
}

interface QuizLeaderboardProps {
  quizId: string;
  quizTitle?: string;
  showUserRank?: boolean;
  currentUserId?: string;
}

export default function QuizLeaderboard({
  quizId,
  quizTitle,
  showUserRank = false,
  currentUserId
}: QuizLeaderboardProps) {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState<QuizLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await fetchQuizLeaderboard(quizId)) as { leaderboard?: QuizLeaderboardEntry[] };
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.leaderboardLoadFailed'));
    } finally {
      setLoading(false);
    }
  }, [quizId, t]);

  useEffect(() => {
    if (quizId) {
      fetchLeaderboard();
    }
  }, [quizId, fetchLeaderboard]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--color-error)] font-medium">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 px-4 py-2 bg-[var(--student-primary)] text-white rounded-lg hover:brightness-110 active:brightness-95 transition-all"
        >
          {t('quiz.leaderboard.tryAgain')}
        </button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Leaderboard
        data={leaderboard}
        title={
          quizTitle
            ? `${quizTitle} — ${t('quiz.leaderboard.title')}`
            : t('quiz.leaderboard.quizLeaderboard')
        }
        subtitle={t('quiz.firstAttemptResults')}
        showUserRank={showUserRank ? currentUserId : undefined}
        type="quiz"
      />
    </motion.div>
  );
}
