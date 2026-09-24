import { fetchOpenRouterChat } from '@/lib/ai/openrouter';

export class QuotaExhaustedError extends Error {
  public provider: string;
  public status?: number;

  constructor(message: string, provider = 'AI_PROVIDER', status?: number) {
    super(message);
    this.name = 'QuotaExhaustedError';
    this.provider = provider;
    this.status = status;
  }
}

export interface GeneratedQuestionItem {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface GeneratedLessonNotes {
  content: string;
  summary: string;
}

function isQuotaOrLimitError(error: unknown): boolean {
  if (!error) return false;
  const msg = (error instanceof Error ? error.message : String(error)).toLowerCase();
  return (
    msg.includes('rate limit') ||
    msg.includes('quota') ||
    msg.includes('resource_exhausted') ||
    msg.includes('credits are depleted') ||
    msg.includes('429') ||
    msg.includes('402') ||
    msg.includes('insufficient_quota') ||
    msg.includes('overloaded')
  );
}

/**
 * Robust AI Completion with failover across OpenRouter free models and Google Gemini.
 * Catches quota/rate-limits and throws QuotaExhaustedError when all daily quotas are consumed.
 */
async function callAiWithFallback(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  options?: { maxTokens?: number; temperature?: number; validateOutput?: (text: string) => boolean }
): Promise<string> {
  const maxTokens = options?.maxTokens ?? 3500;
  const temperature = options?.temperature ?? 0.6;

  // 1. Attempt OpenRouter Free Models
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetchOpenRouterChat(messages, {
        maxTokens,
        temperature,
        autoSwitchOnLimit: true,
        timeoutMs: 35000,
        validateOutput: options?.validateOutput,
      });

      if (res?.content?.trim()) {
        return res.content.trim();
      }
    } catch (err) {
      if (isQuotaOrLimitError(err)) {
        console.warn('[CourseAiGenerator] OpenRouter free quota/rate limit encountered:', err);
      } else {
        console.warn('[CourseAiGenerator] OpenRouter error:', err);
      }
    }
  }

  // 2. Attempt Google Gemini API as Fallback
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const geminiModels = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite'];
    const promptCombined = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

    for (const model of geminiModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptCombined }] }],
              generationConfig: {
                temperature,
                maxOutputTokens: maxTokens,
              },
            }),
            signal: controller.signal,
          }
        );

        clearTimeout(timeout);
        const data = await res.json();

        if (res.status === 429 || res.status === 402 || data?.error?.code === 429 || data?.error?.code === 402) {
          console.warn(`[CourseAiGenerator] Gemini model ${model} quota exhausted:`, data?.error?.message);
          continue;
        }

        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof candidateText === 'string' && candidateText.trim()) {
          const trimmed = candidateText.trim();
          if (!options?.validateOutput || options.validateOutput(trimmed)) {
            return trimmed;
          }
        }
      } catch (geminiErr) {
        if (isQuotaOrLimitError(geminiErr)) {
          console.warn(`[CourseAiGenerator] Gemini ${model} quota reached:`, geminiErr);
        }
      }
    }
  }

  // If both OpenRouter and Gemini were attempted and failed due to quota/rate limits:
  throw new QuotaExhaustedError(
    'All AI model providers reached rate limit or daily free quota. Generation safely paused until next renewal.',
    'COMBINED'
  );
}

/**
 * Generate in-depth educational study material for a lesson
 * Formatted with clean HTML tags (concept trees, tables, exam tips, key takeaways).
 */
export async function generateLessonContent(params: {
  chapterTitle: string;
  lessonTitle: string;
  subtopics: string[];
  examTips: string;
}): Promise<GeneratedLessonNotes> {
  const { chapterTitle, lessonTitle, subtopics, examTips } = params;

  const systemPrompt = `You are a premier educational content creator and senior faculty expert for the UPSSSC PET (Uttar Pradesh Preliminary Eligibility Test) examination.
Your task is to write comprehensive, authoritative, student-friendly, and high-yield study material in Hindi with English terms in parentheses (bilingual).
The output MUST be formatted in valid, clean HTML suitable for rendering in an LMS lesson reader.
Do NOT wrap the output in markdown \`\`\`html code blocks. Return ONLY the HTML markup.`;

  const userPrompt = `Generate a comprehensive master study lesson for:
- Subject/Chapter: "${chapterTitle}"
- Topic/Lesson: "${lessonTitle}"
- Key Focus Subtopics: ${subtopics.join(', ')}
- Official Exam Tips / PYQ Focus: ${examTips}

PEDAGOGICAL & FORMAT REQUIREMENTS:
1. Concept Tree Hierarchy: At the top, include a visual ASCII concept tree enclosed in:
   <pre><code class="language-plaintext">
   ${lessonTitle}
   │
   ├── 1. [Subtopic 1]
   │   ├── ...
   ...
   </code></pre>
2. Structure with semantic HTML tags:
   - <h3> headings for major sections
   - <p> for clear, concise conceptual explanations
   - <ul> and <li> for high-yield facts, dates, articles, and formulas
   - <blockquote class="bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-500 rounded my-4"> for "🎯 UPSSSC PET विगत वर्षों के महत्वपूर्ण प्रश्न एवं ट्रिक्स (PYQ High-Yield Notes)"
   - A comparison table <table> if relevant (e.g. comparing dynasties, laws, formulas, rivers)
   - <h4>निष्कर्ष एवं त्वरित दोहराव (Quick Revision Summary)</h4> at the end.
3. Language: Fluent, lucid Hindi with key technical/historical/scientific terms followed by English in parentheses, e.g. "सिंधु घाटी सभ्यता (Indus Valley Civilization)".
4. Length: Thorough and educational (around 600 - 1000 words). Avoid filler text; every paragraph must contain real exam value.`;

  const rawHtml = await callAiWithFallback(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    {
      maxTokens: 3500,
      temperature: 0.5,
      validateOutput: (text) => text.length > 250 && (text.includes('<h3') || text.includes('<p>')),
    }
  );

  const cleaned = rawHtml
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^```html/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  // Generate a concise 1-2 sentence description summary
  const summary = `${chapterTitle} के अंतर्गत "${lessonTitle}" का संपूर्ण अध्ययन नोट्स एवं विगत वर्षों के महत्वपूर्ण परीक्षा उपयोगी तथ्य।`;

  return {
    content: cleaned,
    summary,
  };
}

/**
 * Generate 5-8 multiple choice practice questions for a lesson
 * 4 options, randomized correct answer, points: 1.
 */
export async function generateLessonQuizQuestions(params: {
  chapterTitle: string;
  lessonTitle: string;
  quizTitle: string;
  numQuestions?: number;
}): Promise<GeneratedQuestionItem[]> {
  const { chapterTitle, lessonTitle, quizTitle, numQuestions = 8 } = params;

  const prompt = `You are an expert exam question paper setter for UPSSSC PET (Uttar Pradesh Preliminary Eligibility Test).
Generate EXACTLY ${numQuestions} high-quality, realistic multiple-choice questions for:
- Subject: "${chapterTitle}"
- Topic: "${lessonTitle}"
- Quiz Title: "${quizTitle}"

CRITICAL REQUIREMENTS:
1. STRICTLY RELEVANT TO UP PET: Difficulty should match UPSSSC PET standard (medium to competitive, with real previous-year pattern questions).
2. BILINGUAL PROMPT: The question text MUST include both Hindi and English translation, e.g.:
   "लोथल किस नदी के किनारे स्थित प्राचीन हड़प्पा स्थल है? (Lothal is an ancient Harappan site situated on the banks of which river?)"
3. 4 PLAUSIBLE OPTIONS: Each question must have EXACTLY 4 distinct multiple-choice options in Hindi with English in brackets where applicable.
4. BALANCED CORRECT ANSWER: Distribute the correctAnswer index (0 for A, 1 for B, 2 for C, 3 for D) randomly and evenly across all questions.
5. FORMAT: Return ONLY a valid JSON array of objects without markdown backticks or commentary:
[
  {
    "question": "प्रश्न विवरण (Question text in Hindi & English)",
    "options": ["विकल्प A (Option A)", "विकल्प B (Option B)", "विकल्प C (Option C)", "विकल्प D (Option D)"],
    "correctAnswer": 0
  }
]`;

  const rawJson = await callAiWithFallback(
    [
      { role: 'system', content: 'You output strictly valid JSON arrays of quiz questions.' },
      { role: 'user', content: prompt },
    ],
    {
      maxTokens: 3000,
      temperature: 0.6,
      validateOutput: (text) => text.includes('[') && text.includes(']'),
    }
  );

  let cleaned = rawJson
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  const startIdx = cleaned.indexOf('[');
  const endIdx = cleaned.lastIndexOf(']');
  if (startIdx !== -1 && endIdx !== -1) {
    cleaned = cleaned.substring(startIdx, endIdx + 1);
  }
  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  let parsed: unknown[] = [];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const relaxed = cleaned.replace(/(?<=:\s*"[^"]*)\n(?=[^"]*")/g, '\\n');
    parsed = JSON.parse(relaxed);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI returned empty or invalid questions array');
  }

  return parsed.slice(0, numQuestions).map((item) => {
    const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
    const opts = Array.isArray(obj.options)
      ? obj.options.map((o) => String(o).trim()).filter(Boolean).slice(0, 4)
      : [];
    while (opts.length < 4) {
      opts.push(`विकल्प ${String.fromCharCode(65 + opts.length)}`);
    }
    const correct = typeof obj.correctAnswer === 'number' && obj.correctAnswer >= 0 && obj.correctAnswer <= 3
      ? obj.correctAnswer
      : 0;

    return {
      question: String(obj.question || 'महत्वपूर्ण प्रश्न').trim(),
      options: opts,
      correctAnswer: correct,
    };
  });
}
