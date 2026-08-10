export interface Question {
  _id: string;
  order?: number;
  question: string;
  options: string[];
}

export interface Attempt {
  _id: string;
  quiz: {
    _id: string;
    title: string;
    timeLimit: number;
  };
  questions: Question[];
  status: string;
  startedAt: string;
  attemptNumber: number;
  violationCount: number;
}
