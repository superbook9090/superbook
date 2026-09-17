export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  points?: number;
  negativePoints?: number;
  explanation?: string;
}

export interface ExcelRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number; // 0-3 representing A-D
  explanation?: string;
}
