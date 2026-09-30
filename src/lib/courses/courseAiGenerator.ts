import { fetchOpenRouterChat } from '@/lib/ai/openrouter';
import { fetchStockanlyzerChat } from '@/lib/stockanlyzer/chat';

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
 * Robust AI Completion with failover across OpenRouter free models, Google Gemini, and Stockanlyzer.
 * Catches quota/rate-limits and throws QuotaExhaustedError when all daily quotas are consumed.
 */
async function callAiWithFallback(
  messages: Array<{ role: 'system' | 'user'; content: string }>,
  options?: { maxTokens?: number; temperature?: number; validateOutput?: (text: string) => boolean }
): Promise<string> {
  const maxTokens = options?.maxTokens ?? 1800;
  const temperature = options?.temperature ?? 0.6;
  const timeoutMs = 12000;

  // 1. Attempt OpenRouter Free Models
  if (process.env.OPENROUTER_API_KEY) {
    try {
      const res = await fetchOpenRouterChat(messages, {
        maxTokens,
        temperature,
        autoSwitchOnLimit: true,
        timeoutMs,
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

  const promptCombined = messages.map((m) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n');

  // 2. Attempt Google Gemini API as Fallback
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    const configuredGeminiModel = process.env.GEMINI_MODEL;
    const geminiModels = [
      ...(configuredGeminiModel ? [configuredGeminiModel] : []),
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ];

    for (const model of geminiModels) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

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

  // 3. Attempt Stockanlyzer Fallback
  try {
    const reply = await fetchStockanlyzerChat(promptCombined, 1, 2000);
    if (reply && (!options?.validateOutput || options.validateOutput(reply))) {
      return reply.trim();
    }
  } catch (stockErr) {
    console.warn('[CourseAiGenerator] Stockanlyzer fallback error:', stockErr);
  }

  // If all providers failed:
  throw new QuotaExhaustedError(
    'All AI model providers reached rate limit or daily free quota. Generation safely paused until next renewal.',
    'COMBINED'
  );
}

/**
 * Generate in-depth educational study material for a lesson
 * Formatted with clean HTML tags (concept trees, tables, exam tips, key takeaways).
 */
export interface GenerateLessonContentParams {
  chapterTitle: string;
  lessonTitle: string;
  subtopics?: string[];
  examTips?: string;
  courseTitle?: string;
  courseCategory?: string;
  courseDescription?: string;
  locale?: string;
}

export interface GenerateLessonQuizParams {
  chapterTitle: string;
  lessonTitle: string;
  quizTitle: string;
  numQuestions?: number;
  courseTitle?: string;
  courseCategory?: string;
  locale?: string;
}

/**
 * Generate in-depth educational study material for a lesson
 * Formatted with clean HTML tags (concept trees, tables, exam tips, key takeaways).
 */
export async function generateLessonContent(
  params: GenerateLessonContentParams
): Promise<GeneratedLessonNotes> {
  const {
    chapterTitle,
    lessonTitle,
    subtopics = [],
    examTips = '',
    courseTitle = '',
    courseCategory = '',
    courseDescription = '',
    locale = 'hi',
  } = params;

  const isHindi = (locale || 'hi').toLowerCase().startsWith('hi');
  const isUpPet =
    courseTitle.toLowerCase().includes('pet') ||
    courseTitle.toLowerCase().includes('upsssc') ||
    examTips.toLowerCase().includes('pet') ||
    courseCategory.toLowerCase().includes('pet');

  const roleDesc = isUpPet
    ? 'premier educational content creator and senior faculty expert for the UPSSSC PET examination'
    : `senior subject matter faculty and curriculum expert for "${courseTitle || courseCategory || 'Online Learning'}"`;

  const languageRequirement = isHindi
    ? 'Write comprehensive, authoritative, student-friendly, and high-yield study material in Hindi with English terms in parentheses (bilingual).'
    : 'Write comprehensive, authoritative, student-friendly, and structured study material in clear, polished English.';

  const systemPrompt = `You are a ${roleDesc}.
Your task is to: ${languageRequirement}
The output MUST be formatted in valid, clean HTML suitable for rendering in an LMS lesson reader.
Do NOT wrap the output in markdown \`\`\`html code blocks. Return ONLY the HTML markup.`;

  const focusTipsLabel = isUpPet
    ? '🎯 विगत वर्षों के महत्वपूर्ण प्रश्न एवं ट्रिक्स (PYQ High-Yield Notes)'
    : isHindi
      ? '🎯 मुख्य परीक्षा बिंदु एवं महत्वपूर्ण तथ्य (Key Exam Insights)'
      : '🎯 Core Concepts & Key Insights';

  const revisionLabel = isHindi
    ? 'निष्कर्ष एवं त्वरित दोहराव (Quick Revision Summary)'
    : 'Summary & Key Takeaways';

  const userPrompt = `Generate a comprehensive master study lesson for:
- Course: "${courseTitle || 'Curriculum Course'}"${courseCategory ? ` (${courseCategory})` : ''}
${courseDescription ? `- Course Overview: ${courseDescription.slice(0, 160)}...` : ''}
- Subject/Chapter: "${chapterTitle}"
- Topic/Lesson: "${lessonTitle}"
${subtopics.length > 0 ? `- Key Focus Subtopics: ${subtopics.join(', ')}` : ''}
${examTips ? `- Official Exam Tips / PYQ Focus: ${examTips}` : ''}

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
   - <ul> and <li> for high-yield facts, dates, definitions, and formulas
   - <blockquote class="bg-amber-50 dark:bg-amber-950/30 p-4 border-l-4 border-amber-500 rounded my-4"> for "${focusTipsLabel}"
   - A comparison table <table> if relevant (e.g. comparing theories, categories, formulas, structures)
   - <h4>${revisionLabel}</h4> at the end.
3. Language: ${isHindi ? 'Fluent, lucid Hindi with key technical/historical/scientific terms followed by English in parentheses, e.g. "सिंधु घाटी सभ्यता (Indus Valley Civilization)".' : 'Natural, engaging educational English.'}
4. Length: Thorough and educational (around 600 - 1000 words). Avoid filler text; every paragraph must contain real educational value.`;

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
  const summary = isHindi
    ? `${chapterTitle} के अंतर्गत "${lessonTitle}" का संपूर्ण अध्ययन नोट्स एवं महत्वपूर्ण परीक्षा उपयोगी तथ्य।`
    : `Comprehensive study notes, concept explanations, and key takeaways for "${lessonTitle}" in ${chapterTitle}.`;

  return {
    content: cleaned,
    summary,
  };
}

/**
 * Generate 5 multiple choice practice questions for a lesson
 * 4 options, randomized correct answer, points: 1.
 */
export async function generateLessonQuizQuestions(
  params: GenerateLessonQuizParams
): Promise<GeneratedQuestionItem[]> {
  const {
    chapterTitle,
    lessonTitle,
    quizTitle,
    numQuestions = 5,
    courseTitle = '',
    courseCategory = '',
    locale = 'hi',
  } = params;

  const isHindi = (locale || 'hi').toLowerCase().startsWith('hi');
  const isUpPet =
    courseTitle.toLowerCase().includes('pet') ||
    courseTitle.toLowerCase().includes('upsssc') ||
    courseCategory.toLowerCase().includes('pet');

  const contextStr = courseTitle ? `Course: "${courseTitle}", ` : '';
  const prompt = isHindi
    ? `You are an expert exam question paper setter${isUpPet ? ' for UPSSSC PET' : ''}.
Generate EXACTLY ${numQuestions} high-quality, realistic multiple-choice questions for:
- ${contextStr}Subject/Chapter: "${chapterTitle}"
- Topic: "${lessonTitle}"
- Quiz Title: "${quizTitle}"

CRITICAL REQUIREMENTS:
1. RELEVANT: Difficulty should match competitive examination standard with clear, unambiguous questions.
2. BILINGUAL PROMPT: The question text MUST include both Hindi and English translation, e.g.:
   "लोथल किस नदी के किनारे स्थित प्राचीन स्थल है? (Lothal is an ancient site situated on the banks of which river?)"
3. 4 PLAUSIBLE OPTIONS: Each question must have EXACTLY 4 distinct multiple-choice options in Hindi with English in brackets where applicable.
4. BALANCED CORRECT ANSWER: Distribute the correctAnswer index (0 for A, 1 for B, 2 for C, 3 for D) randomly and evenly across all questions.
5. FORMAT: Return ONLY a valid JSON array of objects without markdown backticks or commentary:
[
  {
    "question": "प्रश्न विवरण (Question text in Hindi & English)",
    "options": ["विकल्प A (Option A)", "विकल्प B (Option B)", "विकल्प C (Option C)", "विकल्प D (Option D)"],
    "correctAnswer": 0
  }
]`
    : `You are an expert curriculum test creator.
Generate EXACTLY ${numQuestions} high-quality multiple-choice questions for:
- ${contextStr}Chapter: "${chapterTitle}"
- Topic: "${lessonTitle}"
- Quiz Title: "${quizTitle}"

CRITICAL REQUIREMENTS:
1. RELEVANT: Direct conceptual clarity and practical understanding.
2. 4 PLAUSIBLE OPTIONS: Each question must have EXACTLY 4 distinct choices.
3. BALANCED CORRECT ANSWER: Distribute the correctAnswer index (0 for A, 1 for B, 2 for C, 3 for D) evenly.
4. FORMAT: Return ONLY a valid JSON array without markdown code blocks:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]`;

  const rawJson = await callAiWithFallback(
    [
      { role: 'system', content: 'You output strictly valid JSON arrays of quiz questions.' },
      { role: 'user', content: prompt },
    ],
    {
      maxTokens: 1200,
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

    let resolvedCorrect = 0;
    const rawCorrect =
      obj.correctAnswer !== undefined
        ? obj.correctAnswer
        : obj.correctOption !== undefined
          ? obj.correctOption
          : obj.correct_answer !== undefined
            ? obj.correct_answer
            : obj.answer;

    if (typeof rawCorrect === 'number' && Number.isFinite(rawCorrect) && rawCorrect >= 0 && rawCorrect < opts.length) {
      resolvedCorrect = Math.floor(rawCorrect);
    } else if (typeof rawCorrect === 'string') {
      const trimmed = rawCorrect.trim();
      const num = parseInt(trimmed, 10);
      if (!isNaN(num) && num >= 0 && num < opts.length) {
        resolvedCorrect = num;
      } else {
        const letterMatch = trimmed.toUpperCase().match(/\b([A-D])\b/);
        if (letterMatch && letterMatch[1]) {
          resolvedCorrect = letterMatch[1].charCodeAt(0) - 65;
        } else {
          const matchIdx = opts.findIndex((opt) => opt.toLowerCase() === trimmed.toLowerCase());
          if (matchIdx !== -1) resolvedCorrect = matchIdx;
        }
      }
    }

    // Randomize option order while preserving correct answer
    const items = opts.map((text, idx) => ({
      text,
      isCorrect: idx === resolvedCorrect,
    }));
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }

    const finalOptions = items.map((i) => i.text);
    const finalCorrect = items.findIndex((i) => i.isCorrect);

    return {
      question: String(obj.question || 'महत्वपूर्ण प्रश्न').trim(),
      options: finalOptions,
      correctAnswer: finalCorrect !== -1 ? finalCorrect : 0,
    };
  });
}

/**
 * Generate 3-5 structured lesson titles for a chapter when none exist.
 */
export async function generateChapterLessonOutlines(params: {
  courseTitle: string;
  courseCategory?: string;
  chapterTitle: string;
  chapterSummary?: string;
  locale?: string;
  count?: number;
}): Promise<Array<{ title: string; durationMinutes: number }>> {
  const {
    courseTitle,
    courseCategory = '',
    chapterTitle,
    chapterSummary = '',
    locale = 'hi',
    count = 4,
  } = params;

  const isHindi = (locale || 'hi').toLowerCase().startsWith('hi');

  const prompt = isHindi
    ? `You are a curriculum designer for "${courseTitle}" (${courseCategory}).
Generate EXACTLY ${count} high-yield, logical lessons for the chapter: "${chapterTitle}".
${chapterSummary ? `Chapter Summary: ${chapterSummary}` : ''}

CRITICAL: Return ONLY a valid JSON array of objects without markdown:
[
  { "title": "पाठ 1 का शीर्षक (Lesson Title in Hindi with English in brackets)", "durationMinutes": 20 }
]`
    : `You are a curriculum designer for "${courseTitle}" (${courseCategory}).
Generate EXACTLY ${count} structured, logical lessons for the chapter: "${chapterTitle}".
${chapterSummary ? `Chapter Summary: ${chapterSummary}` : ''}

CRITICAL: Return ONLY a valid JSON array of objects without markdown:
[
  { "title": "Lesson 1 Title", "durationMinutes": 20 }
]`;

  const rawJson = await callAiWithFallback(
    [
      { role: 'system', content: 'You output strictly valid JSON arrays of lesson outlines.' },
      { role: 'user', content: prompt },
    ],
    {
      maxTokens: 600,
      temperature: 0.5,
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

  let parsed: unknown[] = [];
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    return [
      { title: `${chapterTitle} - भाग 1 (Part 1)`, durationMinutes: 20 },
      { title: `${chapterTitle} - भाग 2 (Part 2)`, durationMinutes: 20 },
      { title: `${chapterTitle} - महत्वपूर्ण परीक्षा प्रश्न (Key Exam Review)`, durationMinutes: 25 },
    ];
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return [
      { title: `${chapterTitle} - भाग 1`, durationMinutes: 20 },
      { title: `${chapterTitle} - भाग 2`, durationMinutes: 20 },
    ];
  }

  return parsed.map((item, idx) => {
    const obj = (typeof item === 'object' && item !== null ? item : {}) as Record<string, unknown>;
    return {
      title: String(obj.title || `${chapterTitle} - पाठ ${idx + 1}`).trim(),
      durationMinutes: typeof obj.durationMinutes === 'number' ? obj.durationMinutes : 20,
    };
  });
}

/**
 * Suggest next logical chapter title and summary for a course.
 */
export async function suggestNextChapter(params: {
  courseTitle: string;
  courseCategory?: string;
  courseDescription?: string;
  existingChapterTitles: string[];
  locale?: string;
}): Promise<{ title: string; summary: string }> {
  const {
    courseTitle,
    courseCategory = '',
    existingChapterTitles = [],
    locale = 'hi',
  } = params;

  const isHindi = (locale || 'hi').toLowerCase().startsWith('hi');

  const prompt = isHindi
    ? `You are an educational syllabus architect for "${courseTitle}" (${courseCategory}).
Existing chapters already present in the course:
${existingChapterTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Suggest the SINGLE NEXT logical chapter that should follow in this syllabus.
Return ONLY a valid JSON object without markdown:
{ "title": "अध्याय का शीर्षक (Hindi with English)", "summary": "1-2 sentence description in Hindi" }`
    : `You are an educational syllabus architect for "${courseTitle}" (${courseCategory}).
Existing chapters already present in the course:
${existingChapterTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Suggest the SINGLE NEXT logical chapter that should follow in this syllabus.
Return ONLY a valid JSON object without markdown:
{ "title": "Chapter Title", "summary": "1-2 sentence summary" }`;

  try {
    const raw = await callAiWithFallback(
      [
        { role: 'system', content: 'You output strictly valid JSON objects.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 400, temperature: 0.6 }
    );

    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(cleaned.substring(start, end + 1));
      if (parsed.title) {
        return {
          title: String(parsed.title).trim(),
          summary: String(parsed.summary || `${courseTitle} के अंतर्गत महत्वपूर्ण अध्याय।`).trim(),
        };
      }
    }
  } catch {
    // fallback
  }

  const nextNum = existingChapterTitles.length + 1;
  return isHindi
    ? { title: `अध्याय ${nextNum}: महत्वपूर्ण विषय`, summary: `${courseTitle} के अंतर्गत महत्वपूर्ण अध्ययन विषय।` }
    : { title: `Chapter ${nextNum}: Core Topics`, summary: `Key subject matter and concepts for ${courseTitle}.` };
}

/**
 * Suggest next logical lesson title for an already created chapter.
 */
export async function suggestNextLesson(params: {
  courseTitle: string;
  chapterTitle: string;
  chapterSummary?: string;
  existingLessonTitles: string[];
  locale?: string;
}): Promise<{ title: string; durationMinutes: number }> {
  const {
    courseTitle,
    chapterTitle,
    chapterSummary = '',
    existingLessonTitles = [],
    locale = 'hi',
  } = params;

  const isHindi = (locale || 'hi').toLowerCase().startsWith('hi');

  const prompt = isHindi
    ? `You are an educational curriculum author for "${courseTitle}".
Chapter: "${chapterTitle}"
${chapterSummary ? `Summary: ${chapterSummary}` : ''}
Lessons already present in this chapter:
${existingLessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Suggest the SINGLE NEXT high-yield lesson for this chapter.
Return ONLY a valid JSON object without markdown:
{ "title": "पाठ का शीर्षक (Hindi with English in brackets)", "durationMinutes": 20 }`
    : `You are an educational curriculum author for "${courseTitle}".
Chapter: "${chapterTitle}"
${chapterSummary ? `Summary: ${chapterSummary}` : ''}
Lessons already present in this chapter:
${existingLessonTitles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Suggest the SINGLE NEXT logical lesson for this chapter.
Return ONLY a valid JSON object without markdown:
{ "title": "Lesson Title", "durationMinutes": 20 }`;

  try {
    const raw = await callAiWithFallback(
      [
        { role: 'system', content: 'You output strictly valid JSON objects.' },
        { role: 'user', content: prompt },
      ],
      { maxTokens: 400, temperature: 0.6 }
    );

    const cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/```json/gi, '').replace(/```/g, '').trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
      const parsed = JSON.parse(cleaned.substring(start, end + 1));
      if (parsed.title) {
        return {
          title: String(parsed.title).trim(),
          durationMinutes: typeof parsed.durationMinutes === 'number' ? parsed.durationMinutes : 20,
        };
      }
    }
  } catch {
    // fallback
  }

  const nextNum = existingLessonTitles.length + 1;
  return isHindi
    ? { title: `${chapterTitle} - पाठ ${nextNum}`, durationMinutes: 20 }
    : { title: `${chapterTitle} - Lesson ${nextNum}`, durationMinutes: 20 };
}

