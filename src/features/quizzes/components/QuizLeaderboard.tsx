'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '@/components/ui/Leaderboard';
import Loader from '@/components/ui/Loader';
import { useTranslation } from '@/hooks/useTranslation';

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

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/leaderboard/quiz/${quizId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) {
      fetchLeaderboard();
    }
  }, [quizId]);

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
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchLeaderboard}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try Again
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
        title={`${quizTitle || 'Quiz'} Leaderboard`}
        subtitle={t('quiz.firstAttemptResults')}
        showUserRank={showUserRank ? currentUserId : undefined}
        type="quiz"
      />
    </motion.div>
  );
}
