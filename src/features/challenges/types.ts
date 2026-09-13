export interface PublicChallengeQuestion {
  id: string;
  prompt: string;
  options: string[];
  points: number;
}

export interface PublicChallengeData {
  id: string;
  slug: string;
  challenger: {
    id?: string;
    name: string;
    image?: string | null;
  };
  quiz: {
    id?: string;
    title: string;
    description?: string;
  };
  targetScore: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  expiresAt: string;
  questions: PublicChallengeQuestion[];
}

export interface ChallengeSubmissionAnswer {
  questionId: string;
  order: number;
  selectedOption: number;
}

export interface GradedChallengeAnswer {
  questionId: string;
  order: number;
  selectedOption: number;
  correctOption: number | null;
  isCorrect: boolean;
}

export interface ChallengeSubmissionResult {
  attemptId: string;
  claimToken: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  timeTaken: number;
  targetScore: number;
  challengerCorrectCount: number;
  challengerTimeTaken: number;
  isWon: boolean;
  isDraw: boolean;
  converted: boolean;
  answers: GradedChallengeAnswer[];
}
