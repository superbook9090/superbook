export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface PromptBuildParams {
  topic: string;
  numQuestions: number;
  difficulty?: string;
  language?: string;
  instructions?: string;
  entityType?: 'quiz' | 'contest';
}

export function buildAiQuizPrompt(params: PromptBuildParams): string {
  const {
    topic,
    numQuestions,
    difficulty = 'medium',
    language = 'English',
    instructions,
    entityType = 'quiz',
  } = params;

  const langLower = language.toLowerCase();
  let scriptInstruction = '';
  if (langLower.includes('hinglish')) {
    scriptInstruction =
      'Write questions and options in Hinglish (Hindi spoken language written using Latin/Roman script, e.g. "Photosynthesis kya hai?").';
  } else if (langLower.includes('hindi')) {
    scriptInstruction =
      'Write questions and options strictly in Hindi using Devanagari script (हिंदी).';
  } else if (!langLower.includes('english')) {
    scriptInstruction = `Write all questions and options strictly in ${language}.`;
  }

  const entityLabel =
    entityType === 'contest'
      ? 'competitive contest multiple-choice questions'
      : 'multiple-choice quiz';

  return `You are a master teacher and expert educational content creator.
Generate a high-quality, realistic, and pedagogically sound ${entityLabel} with EXACTLY ${numQuestions} questions on the topic: "${topic}".

CRITICAL LANGUAGE REQUIREMENT:
- Target Language: ${language}
- ${scriptInstruction || `Write all questions, options, and text strictly in ${language}.`}
- DO NOT default to English unless the Target Language is English.

Parameters:
- Topic: ${topic}
- Target Language: ${language}
- Difficulty Level: ${difficulty}
${instructions ? `- Additional Instructions: ${instructions}` : ''}

CRITICAL QUALITY REQUIREMENTS:
1. Provide EXACTLY ${numQuestions} distinct questions written in ${language}.
2. Each question MUST have EXACTLY 4 distinct, plausible multiple-choice options written in ${language}.
3. Distractors (wrong options) MUST be realistic and relevant to the topic in ${language}.
4. Distribute the "correctAnswer" index (0 for A, 1 for B, 2 for C, 3 for D) randomly across questions so that option A (0) is not always the correct answer.
5. Return ONLY a valid JSON array of question objects matching this exact format without any additional commentary:
[
  {
    "question": "Question text written in ${language}",
    "options": ["Option A in ${language}", "Option B in ${language}", "Option C in ${language}", "Option D in ${language}"],
    "correctAnswer": 0
  }
]`;
}

export function parseQuestionsFromAiOutput(rawText: string, numQuestions: number): GeneratedQuestion[] {
  if (!rawText || !rawText.trim()) return [];

  let cleaned = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const jsonStart = cleaned.indexOf('[');
  const jsonEnd = cleaned.lastIndexOf(']');
  if (jsonStart !== -1) {
    if (jsonEnd > jsonStart) {
      cleaned = cleaned.substring(jsonStart, jsonEnd + 1);
    } else {
      cleaned = cleaned.substring(jsonStart) + '\n]';
    }
  }

  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return sanitizeParsedQuestions(parsed, numQuestions);
    }
  } catch {
    try {
      const relaxed = cleaned.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
      const parsed = JSON.parse(relaxed);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeParsedQuestions(parsed, numQuestions);
      }
    } catch {
      // Regex fallback below
    }
  }

  const questionObjectRegex =
    /\{\s*"question"\s*:\s*"[\s\S]*?"\s*,\s*"options"\s*:\s*\[[\s\S]*?\]\s*(?:,\s*"correctAnswer"\s*:\s*\d+)?\s*\}/gi;
  const matches = rawText.match(questionObjectRegex);
  if (matches && matches.length > 0) {
    const extracted: unknown[] = [];
    for (const match of matches) {
      try {
        const cleanObj = match.replace(/,\s*([\]}])/g, '$1');
        extracted.push(JSON.parse(cleanObj));
      } catch {
        // Skip match
      }
    }
    if (extracted.length > 0) {
      return sanitizeParsedQuestions(extracted, numQuestions);
    }
  }

  return [];
}

export function sanitizeParsedQuestions(
  parsed: unknown[],
  numQuestions: number
): GeneratedQuestion[] {
  return parsed
    .slice(0, numQuestions)
    .map((item: unknown) => {
      const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
      const opts = Array.isArray(obj.options)
        ? obj.options.map((o: unknown) => String(o).trim()).filter(Boolean).slice(0, 4)
        : [];
      while (opts.length < 4) {
        opts.push(`Option ${String.fromCharCode(65 + opts.length)}`);
      }
      return {
        question: String(obj.question || '').trim(),
        options: opts,
        correctAnswer:
          typeof obj.correctAnswer === 'number' && obj.correctAnswer >= 0 && obj.correctAnswer <= 3
            ? obj.correctAnswer
            : 0,
      };
    })
    .filter((q) => q.question.length > 0);
}
