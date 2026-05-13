'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '@/components/ui/Leaderboard';
import { Loader } from '@/components/ui/Loader';
import { fetchCourseLeaderboard } from '@/lib/api/leaderboard';

interface LeaderboardApiResponse {
  userId: string;
  name: string;
  image?: string;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  quizCount: number;
  completedQuizzes: number;
  rank: number;
  lastCompletedAt: string;
}

interface CourseLeaderboardEntry extends LeaderboardApiResponse {
  score: number; // Add this for compatibility with LeaderboardEntry
}

interface CourseLeaderboardProps {
  courseId: string;
  courseTitle?: string;
  showUserRank?: boolean;
  currentUserId?: string;
}

export default function CourseLeaderboard({ 
  courseId, 
  courseTitle,
  showUserRank = false,
  currentUserId 
}: CourseLeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<CourseLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [courseStats, setCourseStats] = useState({
    totalStudents: 0,
    totalQuizzes: 0
  });

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = (await fetchCourseLeaderboard(courseId)) as {
        leaderboard?: LeaderboardApiResponse[];
        course?: { totalStudents?: number; totalQuizzes?: number };
      };
      // Map course leaderboard data to include score field
      const mappedLeaderboard = (data.leaderboard || []).map(
        (entry: LeaderboardApiResponse): CourseLeaderboardEntry => ({
          ...entry,
          score: entry.averageScore || 0, // Use averageScore as the primary score display
        })
      );
      setLeaderboard(mappedLeaderboard);
      setCourseStats({
        totalStudents: data.course?.totalStudents || 0,
        totalQuizzes: data.course?.totalQuizzes || 0
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) {
      fetchLeaderboard();
    }
  }, [courseId, fetchLeaderboard]);

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
        title={`${courseTitle || 'Course'} Leaderboard`}
        subtitle={`${courseStats.totalStudents} students • ${courseStats.totalQuizzes} quizzes`}
        showUserRank={showUserRank ? currentUserId : undefined}
        type="course"
      />
    </motion.div>
  );
}
