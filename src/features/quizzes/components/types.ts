export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface ExcelRow {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: number; // 0-3 representing A-D
}
