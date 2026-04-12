'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

export default function QuizCard({ quiz, attempt, type, onStart }: QuizCardProps) {
  const router = useRouter();
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
      router.push(`/dashboard/student/quizzes/${attempt._id}/review`);
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

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {quiz.course?.title || 'Course'}
          </span>
          <span className="text-sm text-gray-500">
            {quiz.questions?.length || 0} questions
          </span>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{quiz.description || 'No description available'}</p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span>Time Limit: {quiz.timeLimit} min</span>
          {attempt && (
            <span className={`font-medium ${attempt.score >= 70 ? 'text-green-600' : attempt.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              Score: {attempt.score}%
            </span>
          )}
        </div>

        {attempt && (
          <div className="bg-gray-50 rounded-md p-3 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                Correct: {attempt.correctCount}/{attempt.totalQuestions}
              </span>
              <span className="text-gray-600">
                Time: {formatTime(attempt.timeTaken)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Attempt #{attempt.attemptNumber} • {attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleDateString() : 'In Progress'}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {type === 'available' ? (
            <button
              onClick={handleStart}
              disabled={isLoading}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Starting...' : 'Start Quiz'}
            </button>
          ) : (
            <>
              <button
                onClick={handleReview}
                className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Review
              </button>
              <button
                onClick={handleRetake}
                disabled={isLoading}
                className="px-4 py-2 border border-green-600 text-green-600 rounded-md hover:bg-green-50 transition-colors disabled:opacity-50"
              >
                Retake
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
