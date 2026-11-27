export interface SampleQuizQuestion {
  id: string;
  subject: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
}

export interface GuideTable {
  heading: string;
  caption: string;
  headers: string[];
  rows: string[][];
}

export interface GuideBlock {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface SeoToolGuide {
  interactiveMode: 'quiz' | 'builder';
  interactiveTitle: string;
  interactiveSubtitle: string;
  quickAnswerHeading: string;
  quickAnswer: string;
  keyFacts: Array<{ label: string; value: string }>;
  table: GuideTable;
  sections: GuideBlock[];
  sampleQuestions: SampleQuizQuestion[];
}
