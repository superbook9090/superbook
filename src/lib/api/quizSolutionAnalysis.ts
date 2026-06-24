import { apiJsonData } from '@/lib/api/http';

export type AnalyzeQuizSolutionInput = {
  attemptId: string;
  questionId: string;
};

export type AnalyzeQuizSolutionResponse = {
  analysis: string;
};

export async function analyzeQuizSolution(
  input: AnalyzeQuizSolutionInput
): Promise<AnalyzeQuizSolutionResponse> {
  const { data } = await apiJsonData<AnalyzeQuizSolutionResponse>(
    '/api/quiz-attempts/analyze-solution',
    {
      method: 'POST',
      body: input,
    }
  );
  return data;
}
