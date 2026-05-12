// src/features/ai/prompts/index.ts

import { QuizAnalysisRequest } from '../types';

// Main quiz analysis prompt template
export const generateQuizAnalysisPrompt = (request: QuizAnalysisRequest): string => {
  const {
    question,
    options,
    selectedAnswer,
    correctAnswer,
    userAnswerText,
    correctAnswerText,
    questionType = 'multiple-choice',
    difficulty = 'medium',
    subject = 'general'
  } = request;

  const selectedText = userAnswerText || options[selectedAnswer] || `Option ${selectedAnswer + 1}`;
  const correctText = correctAnswerText || options[correctAnswer] || `Option ${correctAnswer + 1}`;
  const isCorrect = selectedAnswer === correctAnswer;

  return `You are an expert educational tutor. Analyze this quiz question and provide helpful feedback.

Question: ${question}
Options: ${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}
Student chose: ${selectedAnswer + 1}. ${selectedText}
Correct answer: ${correctAnswer + 1}. ${correctText}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Provide your analysis exactly in this format:

SUMMARY: [One sentence about the result]
WHY_${isCorrect ? 'CORRECT' : 'INCORRECT'}: [Why the student's answer is right or wrong]
WHY_CORRECT_ANSWER: [Why the correct answer is right]
CONCEPT: [Key concept behind this question]
STUDY_TIP: [Practical advice for learning]
CONFIDENCE: [Number 0-100]

Important:
- Each response should be clear and educational
- Use simple language students can understand
- Be encouraging and helpful
- Keep explanations concise but complete
- Do not use markdown or special formatting`;
};

// Simplified explanation prompt
export const generateSimplerExplanationPrompt = (originalAnalysis: string, targetLevel: 'beginner' | 'very-simple' = 'beginner'): string => {
  const complexity = targetLevel === 'very-simple' 
    ? 'like explaining to a 10-year-old' 
    : 'like explaining to someone new to the topic';

  return `Simplify this educational explanation ${complexity}. Keep it very short and easy to understand.

Original analysis:
${originalAnalysis}

Provide a simplified version focusing on:
1. What the question is really asking
2. The most important concept to remember
3. A simple way to think about it

Keep it under 50 words total. Use very simple language.`;
};

// Example generation prompt
export const generateExamplePrompt = (question: string, concept: string): string => {
  return `Create a simple, real-world example to help understand this concept.

QUESTION: ${question}
KEY CONCEPT: ${concept}

Generate one clear example that:
- Is relatable and easy to understand
- Shows how the concept works in practice
- Helps remember the concept better
- Is 2-3 sentences maximum

Make it practical and memorable.`;
};

// Similar question generation prompt
export const generateSimilarQuestionPrompt = (originalQuestion: string, difficulty: string): string => {
  return `Create a similar practice question to help reinforce learning.

ORIGINAL QUESTION: ${originalQuestion}
DIFFICULTY: ${difficulty}

Create a new question that:
- Tests the same concept
- Has similar difficulty
- Uses different wording/context
- Has 4 clear options (A, B, C, D)
- Is multiple choice format

Format:
QUESTION: [new question]
A) [option 1]
B) [option 2]  
C) [option 3]
D) [option 4]
CORRECT: [A/B/C/D]`;
};

// Follow-up question prompt
export const generateFollowUpPrompt = (question: string, studentAnswer: string, isCorrect: boolean): string => {
  const context = isCorrect 
    ? 'answered correctly but might want deeper understanding'
    : 'answered incorrectly and needs clarification';

  return `Generate a helpful follow-up question for a student who ${context}.

ORIGINAL QUESTION: ${question}
STUDENT'S ANSWER: ${studentAnswer}
RESULT: ${isCorrect ? 'Correct' : 'Incorrect'}

Create a follow-up question that:
- Helps clarify the concept
- Encourages deeper thinking
- Is open-ended (not multiple choice)
- Is one sentence maximum
- Promotes understanding

Make it thought-provoking but simple.`;
};

// Input validation and sanitization
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/['"]/g, '') // Remove quotes
    .slice(0, 2000); // Limit length
};

export const validateQuizAnalysisRequest = (request: QuizAnalysisRequest): string[] => {
  const errors: string[] = [];

  if (!request.question || request.question.trim().length < 10) {
    errors.push('Question must be at least 10 characters');
  }

  if (!request.options || request.options.length < 2) {
    errors.push('At least 2 options are required');
  }

  if (request.selectedAnswer < 0 || request.selectedAnswer >= request.options.length) {
    errors.push('Selected answer index is invalid');
  }

  if (request.correctAnswer < 0 || request.correctAnswer >= request.options.length) {
    errors.push('Correct answer index is invalid');
  }

  if (request.question.trim().length > 2000) {
    errors.push('Question is too long (max 2000 characters)');
  }

  return errors;
};

// Prompt optimization for different models
export const optimizePromptForModel = (prompt: string, model: string): string => {
  // Adjust prompt based on model capabilities
  switch (model) {
    case 'tinyllama':
      // Very simple prompts for tiny models
      return prompt
        .replace(/Requirements:.*$/, '')
        .replace(/Provide a concise analysis in exactly this format:.*$/, 'Analyze this quiz question:')
        .slice(0, 500); // Very short prompt
    case 'gemma3:1b':
    case 'gemma:2b':
      // Standard prompts for Gemma models
      return prompt;
    case 'phi3-mini':
      // Can handle more detailed prompts
      return prompt;
    default:
      return prompt;
  }
};

// Response parsing utilities
export const parseAnalysisResponse = (response: string) => {
  const lines = response.split('\n').map(line => line.trim());
  const result: any = {};

  // Default fallback values
  result.summary = 'Analysis completed';
  result.whySelectedAnswerIsRightOrWrong = 'Answer analysis not available';
  result.whyCorrectAnswerIsCorrect = 'Correct answer explanation not available';
  result.keyConceptExplanation = 'Concept explanation not available';
  result.studyTip = 'Study tip not available';
  result.confidenceLevel = 75;

  lines.forEach(line => {
    // Handle exact format matches
    if (line.startsWith('SUMMARY:')) {
      result.summary = line.replace('SUMMARY:', '').trim();
    } else if (line.startsWith('WHY_CORRECT:')) {
      result.whySelectedAnswerIsRightOrWrong = line.replace('WHY_CORRECT:', '').trim();
    } else if (line.startsWith('WHY_INCORRECT:')) {
      result.whySelectedAnswerIsRightOrWrong = line.replace('WHY_INCORRECT:', '').trim();
    } else if (line.startsWith('WHY_CORRECT_ANSWER:')) {
      result.whyCorrectAnswerIsCorrect = line.replace('WHY_CORRECT_ANSWER:', '').trim();
    } else if (line.startsWith('CONCEPT:')) {
      result.keyConceptExplanation = line.replace('CONCEPT:', '').trim();
    } else if (line.startsWith('STUDY_TIP:')) {
      result.studyTip = line.replace('STUDY_TIP:', '').trim();
    } else if (line.startsWith('CONFIDENCE:')) {
      const confidence = parseInt(line.replace('CONFIDENCE:', '').trim());
      result.confidenceLevel = isNaN(confidence) ? 75 : Math.min(100, Math.max(0, confidence));
    }
    
    // Handle loose format matches (case insensitive, with brackets)
    else if (line.toLowerCase().includes('summary:') || line.toLowerCase().includes('[summary]')) {
      const match = line.match(/summary:\s*(.+)/i) || line.match(/\[summary\]\s*(.+)/i);
      if (match) result.summary = match[1].trim();
    } else if (line.toLowerCase().includes('why_correct:') || line.toLowerCase().includes('[why_correct]')) {
      const match = line.match(/why_correct:\s*(.+)/i) || line.match(/\[why_correct\]\s*(.+)/i);
      if (match) result.whySelectedAnswerIsRightOrWrong = match[1].trim();
    } else if (line.toLowerCase().includes('why_incorrect:') || line.toLowerCase().includes('[why_incorrect]')) {
      const match = line.match(/why_incorrect:\s*(.+)/i) || line.match(/\[why_incorrect\]\s*(.+)/i);
      if (match) result.whySelectedAnswerIsRightOrWrong = match[1].trim();
    } else if (line.toLowerCase().includes('why_correct_answer:') || line.toLowerCase().includes('[why_correct_answer]')) {
      const match = line.match(/why_correct_answer:\s*(.+)/i) || line.match(/\[why_correct_answer\]\s*(.+)/i);
      if (match) result.whyCorrectAnswerIsCorrect = match[1].trim();
    } else if (line.toLowerCase().includes('concept:') || line.toLowerCase().includes('[concept]')) {
      const match = line.match(/concept:\s*(.+)/i) || line.match(/\[concept\]\s*(.+)/i);
      if (match) result.keyConceptExplanation = match[1].trim();
    } else if (line.toLowerCase().includes('study_tip:') || line.toLowerCase().includes('[study_tip]')) {
      const match = line.match(/study_tip:\s*(.+)/i) || line.match(/\[study_tip\]\s*(.+)/i);
      if (match) result.studyTip = match[1].trim();
    } else if (line.toLowerCase().includes('confidence:') || line.toLowerCase().includes('[confidence]')) {
      const match = line.match(/confidence:\s*(.+)/i) || line.match(/\[confidence\]\s*(.+)/i);
      if (match) {
        const confidence = parseInt(match[1].trim());
        result.confidenceLevel = isNaN(confidence) ? 75 : Math.min(100, Math.max(0, confidence));
      }
    }
  });

  // If no structured data found, try to extract from free text
  if (!result.summary || result.summary === 'Analysis completed') {
    // Try to extract meaningful content from the response
    const cleanResponse = response.replace(/[#*`]/g, '').trim();
    if (cleanResponse.length > 10) {
      result.summary = cleanResponse.split('.')[0] + '.';
      result.whySelectedAnswerIsRightOrWrong = cleanResponse.substring(0, 100) + '...';
    }
  }

  return result;
};
