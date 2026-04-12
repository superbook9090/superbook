// src/app/(dashboard)/dashboard/student/quizzes/take/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Attempt {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    timeLimit: number;
    questions: Question[];
  };
  status: string;
  startedAt: string;
}

export default function TakeQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    if (!attemptId) {
      router.push('/dashboard/student/quizzes');
      return;
    }

    fetchAttempt();
  }, [session, status, attemptId, router]);

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0 || !attempt) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto-submit when time runs out
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, attempt]);

  const fetchAttempt = async () => {
    try {
      const response = await fetch('/api/quiz-attempts');
      const data = await response.json();

      if (response.ok) {
        const foundAttempt = data.attempts.find((a: Attempt) => a._id === attemptId);
        if (foundAttempt && foundAttempt.status === 'in_progress') {
          setAttempt(foundAttempt);
          // Calculate remaining time
          const elapsedSeconds = Math.floor(
            (Date.now() - new Date(foundAttempt.startedAt).getTime()) / 1000
          );
          const totalSeconds = foundAttempt.quiz.timeLimit * 60;
          const remaining = Math.max(0, totalSeconds - elapsedSeconds);
          setTimeRemaining(remaining);
        } else {
          setError('Quiz attempt not found or already completed');
        }
      } else {
        setError(data.message || 'Failed to load quiz');
      }
    } catch (err) {
      setError('Error loading quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = useCallback(async (autoSubmit = false) => {
    if (!attempt) return;

    if (!autoSubmit && !confirm('Are you sure you want to submit? You cannot change your answers after submission.')) {
      return;
    }

    setIsSubmitting(true);

    // Format answers for API
    const formattedAnswers = Object.entries(answers).map(([questionIndex, selectedOption]) => ({
      questionIndex: parseInt(questionIndex),
      selectedOption,
    }));

    // Add unanswered questions as -1
    attempt.quiz.questions.forEach((_, index) => {
      if (!(index in answers)) {
        formattedAnswers.push({
          questionIndex: index,
          selectedOption: -1,
        });
      }
    });

    const timeTaken = attempt.quiz.timeLimit * 60 - timeRemaining;

    try {
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: attempt.quiz._id,
          action: 'submit',
          answers: formattedAnswers,
          timeTaken,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/dashboard/student/quizzes/${data.attempt._id}/result`);
      } else {
        setError(data.message || 'Failed to submit quiz');
        setIsSubmitting(false);
      }
    } catch (err) {
      setError('Error submitting quiz');
      setIsSubmitting(false);
    }
  }, [attempt, answers, timeRemaining, router]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (status === 'loading' || isLoading) {
    return <div className="text-center py-8">Loading quiz...</div>;
  }

  if (error || !attempt) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Quiz not found'}</p>
        <button
          onClick={() => router.push('/dashboard/student/quizzes')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md"
        >
          Back to Quizzes
        </button>
      </div>
    );
  }

  const questions = attempt.quiz.questions;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{attempt.quiz.title}</h1>
            <p className="text-gray-600 mt-1">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>
          <div className={`text-right ${timeRemaining < 60 ? 'text-red-600' : 'text-gray-900'}`}>
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="text-2xl font-bold font-mono">{formatTime(timeRemaining)}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-1">
            <span>{answeredCount} answered</span>
            <span>{questions.length - answeredCount} remaining</span>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          {questions[currentQuestion].question}
        </h3>

        <div className="space-y-3">
          {questions[currentQuestion].options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(currentQuestion, index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                answers[currentQuestion] === index
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                    answers[currentQuestion] === index
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="text-gray-900">{option}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
          disabled={currentQuestion === 0}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {/* Question dots */}
        <div className="flex space-x-2">
          {questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentQuestion
                  ? 'bg-indigo-600'
                  : answers[index] !== undefined
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {currentQuestion < questions.length - 1 ? (
          <button
            onClick={() => setCurrentQuestion((prev) => Math.min(questions.length - 1, prev + 1))}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>

      {/* Warning if time is low */}
      {timeRemaining < 300 && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-sm text-red-700">
            Less than 5 minutes remaining! Please submit your answers soon.
          </p>
        </div>
      )}
    </div>
  );
}
