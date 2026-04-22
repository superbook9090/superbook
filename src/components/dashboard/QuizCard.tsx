'use client';

import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useRoleTheme } from '@/contexts/RoleThemeContext';
import {
  HelpCircle,
  Clock,
  BookOpen,
  Play,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import Loader from '@/components/ui/Loader';

interface Quiz {
  _id: string;
  title: string;
  description: string;
  timeLimit: number;
  questions: { question: string; options: string[]; correctAnswer: number }[];
  course: { _id: string; title: string };
  isPublished: boolean;
}

interface Attempt {
  _id: string;
  quiz: Quiz;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  status: string;
  attemptNumber: number;
  submittedAt?: string;
  startedAt: string;
}

interface QuizCardProps {
  quiz: Quiz;
  attempt?: Attempt;
  type: 'available' | 'attempted';
  onStart?: (quizId: string) => Promise<void>;
}

function QuizCard({ quiz, attempt, type, onStart }: QuizCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme } = useRoleTheme();
  const [isLoading, setIsLoading] = useState(false);

  const handleStart = async () => {
    if (!onStart) return;
    setIsLoading(true);
    try {
      await onStart(quiz._id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReview = () => {
    if (attempt) {
      router.push(`/dashboard/student/quizzes/${attempt._id}/result`);
    }
  };

  const handleRetake = async () => {
    if (!onStart) return;
    setIsLoading(true);
    try {
      await onStart(quiz._id);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreVariant = (score: number) => {
    if (score >= 70) return 'success';
    if (score >= 50) return 'warning';
    return 'error';
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Header Gradient */}
      <div className={`relative h-32 bg-gradient-to-br ${theme.gradient}`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-4 left-6 right-6">
          <Badge variant="success" size="sm" icon={<BookOpen className="w-3 h-3" />}>
            {quiz.course?.title || t('quiz.course')}
          </Badge>
        </div>
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full text-sm font-medium text-gray-700 shadow-sm">
            <HelpCircle className="w-4 h-4" />
            {quiz.questions?.length || 0} {t('quiz.questions')}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className={`text-lg font-bold text-gray-900 mb-2 group-hover:${theme.text} transition-colors`}>
          {quiz.title}
        </h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">
          {quiz.description || t('quiz.noDescription')}
        </p>

        {/* Time Limit */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4" />
          <span>{t('quiz.timeLimit')}: <span className="font-medium text-gray-700">{quiz.timeLimit} {t('quiz.min')}</span></span>
        </div>

        {/* Attempt Results */}
        {attempt && (
          <div className="mb-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <Badge variant={getScoreVariant(attempt.score)} size="sm">
                {attempt.score}% {t('quiz.quizScore')}
              </Badge>
              <span className="text-xs text-gray-400">{t('quiz.attempt')}{attempt.attemptNumber}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-gray-600">{attempt.correctCount}/{attempt.totalQuestions} {t('quiz.correct')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500" />
                <span className="text-gray-600">{formatTime(attempt.timeTaken)}</span>
              </div>
            </div>
            {attempt.submittedAt && (
              <p className="text-xs text-gray-400 mt-2">
                {t('quiz.completed')} {new Date(attempt.submittedAt).toLocaleString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'available' ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStart}
              disabled={isLoading}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <Loader size="sm" />
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  {t('quiz.startQuiz')}
                </>
              )}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReview}
                className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${theme.gradient} text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-all`}
              >
                <CheckCircle className="w-4 h-4" />
                {t('quiz.review')}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRetake}
                disabled={isLoading}
                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 ${theme.border} ${theme.text} rounded-xl font-semibold ${theme.activeBg} hover:opacity-80 transition-all disabled:opacity-50`}
              >
                {isLoading ? (
                  <Loader size="sm" />
                ) : (
                  <>
                    <RotateCcw className="w-4 h-4" />
                    {t('quiz.retake')}
                  </>
                )}
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const QuizCardMemo = memo(QuizCard);
export default QuizCardMemo;
