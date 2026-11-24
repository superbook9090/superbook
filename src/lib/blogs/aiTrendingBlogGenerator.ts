/**
 * AI Service for Generating 2000+ Word SEO & AdSense Compliant Blog Posts
 * 
 * Supports OpenRouter (free tier with multi-model fallback) and Gemini API as fallback.
 * Generates structured, in-depth educational articles with semantic HTML tags (H2, H3, lists, tables, callouts).
 */

import { fetchOpenRouterChat, type OpenRouterMessage } from '@/lib/ai/openrouter';

export interface GeneratedAiBlog {
  title: string;
  topic: string;
  language: 'en' | 'hi';
  slug: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  content: string;
  wordCount: number;
}

export const FALLBACK_TRENDING_SEO_TOPICS = [
  {
    topic: 'Artificial Intelligence',
    titleEn: 'Artificial General Intelligence (AGI) & The 2026 Shift: How Deep Learning & Autonomous Agents Are Transforming Global Education and Careers',
    titleHi: 'आर्टिफिशियल जनरल इंटेलिजेंस (AGI) और शिक्षा क्रांति: 2026 में करियर, सीखने की क्षमता और रोजगार पर प्रभाव',
  },
  {
    topic: 'Exam Preparation',
    titleEn: 'The Ultimate UPSC & SSC 2026 Preparation Blueprint: Cognitive Recall, Dynamic Current Affairs Mastery, and High-Yield Revision Techniques',
    titleHi: 'UPSC और SSC 2026 परीक्षा में सफलता की रणनीति: एक्टिव रिकॉल, समसामयिकी विश्लेषण और टॉपर्स के रिवीजन सीक्रेट्स',
  },
  {
    topic: 'Cybersecurity',
    titleEn: 'Post-Quantum Cryptography & Zero Trust Architecture: The Complete Cybersecurity Guide for the Next Decade of Technology',
    titleHi: 'पोस्ट-क्वांटम क्रिप्टोग्राफी और ज़ीरो ट्रस्ट सिक्योरिटी: आधुनिक तकनीक और साइबर सुरक्षा की व्यापक मार्गदर्शिका',
  },
  {
    topic: 'Education',
    titleEn: 'Neuroscience of Learning: How Spaced Repetition, Cognitive Load Theory, and Interleaving Rewire the Brain for Permanent Academic Mastery',
    titleHi: 'सीखने का न्यूरोसाइंस: स्पेस्ड रिपीटिशन और कॉग्निटिव लोड थ्योरी से अपनी याददाश्त और परीक्षा स्कोर को कैसे दोगुना करें',
  },
  {
    topic: 'General Knowledge',
    titleEn: 'Global Geopolitics and the Energy Transition in 2026: Renewable Supergrids, Rare Earth Elements, and Economic Power Shifts',
    titleHi: 'वैश्विक भू-राजनीति और स्वच्छ ऊर्जा क्रांति 2026: दुर्लभ खनिज, हरित अर्थव्यवस्था और नई अंतरराष्ट्रीय व्यवस्था',
  },
  {
    topic: 'Science',
    titleEn: 'CRISPR Gene Editing and Personalized Medicine: The Breakthrough Technologies Shaping Healthcare, Biotechnology, and Longevity',
    titleHi: 'CRISPR जीन एडिटिंग और सटीक चिकित्सा: जैव प्रौद्योगिकी और स्वास्थ्य विज्ञान की अगली महा-क्रांति',
  },
  {
    topic: 'Data Science & Coding',
    titleEn: 'Agentic AI Architecture & Vector Databases: Complete Engineering Guide to Building Modern Autonomous Applications in 2026',
    titleHi: 'एजेंटिक एआई और वेक्टर डेटाबेस: 2026 में आधुनिक स्वायत्त सॉफ्टवेयर विकास की संपूर्ण मार्गदर्शिका',
  },
  {
    topic: 'Mental Health & Mindfulness',
    titleEn: 'Cognitive Resilience for Competitive Exam Aspirants: Overcoming Burnout, Digital Dopamine Fatigue, and Sustaining Peak Focus',
    titleHi: 'प्रतियोगी परीक्षा के छात्रों के लिए मानसिक मजबूती: बर्नआउट से मुक्ति, ध्यान एकाग्रता और तनाव प्रबंधन के वैज्ञानिक तरीके',
  },
];

// Retain alias for backwards compatibility
export const TRENDING_SEO_TOPICS = FALLBACK_TRENDING_SEO_TOPICS;

async function callGeminiFallback(prompt: string): Promise<string> {
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!geminiKey) {
    throw new Error('Neither OpenRouter nor Gemini API keys are configured');
  }

  const configuredGeminiModel = process.env.GEMINI_MODEL;
  const geminiModels = [
    ...(configuredGeminiModel ? [configuredGeminiModel] : []),
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
  ];

  let lastErr: Error | null = null;
  for (const model of geminiModels) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 8192,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || `Gemini returned ${res.status}`);
      }

      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err) {
      lastErr = err as Error;
      console.warn(`[Gemini Fallback] Model ${model} failed:`, err);
    }
  }

  throw lastErr || new Error('All Gemini fallback models failed.');
}

async function discoverDynamicTrendingTopic(language: 'en' | 'hi'): Promise<{ topic: string; title: string }> {
  // If the user didn't specify topic/title, pick one immediately with variation or quickly probe AI with tight 6s timeout
  try {
    const researchPrompt = `You are an SEO & educational trends analyst for Quiz-Do.
Identify ONE high-volume trending educational or technology topic for 2026.
Return strictly valid JSON: {"topic":"Topic Name","title":"Catchy SEO Title in ${language === 'hi' ? 'Hindi' : 'English'}"}`;

    let raw = '';
    try {
      const result = await fetchOpenRouterChat([
        { role: 'system', content: 'Respond strictly with raw JSON.' },
        { role: 'user', content: researchPrompt },
      ], {
        maxTokens: 200,
        temperature: 0.8,
        timeoutMs: 6000,
      });
      raw = result.content;
    } catch {
      // Fast fallback without wasting more time
    }

    if (raw) {
      const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.topic && parsed.title) {
        return {
          topic: String(parsed.topic).trim(),
          title: String(parsed.title).trim(),
        };
      }
    }
  } catch (err) {
    console.warn('[AiTrendingBlogGenerator] Dynamic topic discovery fallback triggered:', err);
  }

  const fallback = FALLBACK_TRENDING_SEO_TOPICS[Math.floor(Math.random() * FALLBACK_TRENDING_SEO_TOPICS.length)];
  return {
    topic: fallback.topic,
    title: language === 'hi' ? fallback.titleHi : fallback.titleEn,
  };
}

/**
 * Generate a comprehensive 2000+ word SEO blog using AI
 */
export async function generateTrendingAiBlog(options?: {
  topic?: string;
  focusTitle?: string;
  language?: 'en' | 'hi';
  targetWords?: number;
}): Promise<GeneratedAiBlog> {
  const language = options?.language || 'en';
  const targetWords = options?.targetWords || 2200;

  // Dynamically discover trending topic via AI unless explicitly provided
  let topic = options?.topic?.trim();
  let chosenTitle = options?.focusTitle?.trim();

  if (!topic || !chosenTitle) {
    const discovered = await discoverDynamicTrendingTopic(language);
    topic = topic || discovered.topic;
    chosenTitle = chosenTitle || discovered.title;
  }

  const systemPrompt = `You are a world-class senior educational researcher, technical writer, and SEO strategist writing for Quiz-Do (an authoritative digital learning and examination platform).

Your writing must strictly adhere to Google Search Quality Rater Guidelines (E-E-A-T: Experience, Expertise, Authoritativeness, and Trustworthiness) and Google AdSense publisher content policies:
1. Zero fluff, repetitive phrases, or generic filler. Deliver rich analytical depth, real-world examples, verified frameworks, step-by-step methodologies, and practical study takeaways.
2. MINIMUM LENGTH REQUIREMENT: The main body content MUST exceed 2,000 words (aim for 2,200 to 2,800 substantive words). Substantive, comprehensive coverage is mandatory to qualify for premium publisher ads.
3. STRUCTURE: Use clean HTML markup (<h2>, <h3>, <p>, <ul>, <ol>, <li>, <blockquote>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <strong>). Do NOT wrap in markdown code blocks like \`\`\`html.
4. ADSENSE OPTIMIZATION:
   - Provide informative subheadings every 250-300 words (H2 and H3).
   - Include comparison tables summarizing key metrics, differences, or concepts.
   - Include key takeaways and practical actionable checklists.
   - Include an FAQ section with at least 4 detailed questions and answers using <h3> and <p>.
5. FORMAT: You must return STRICTLY valid JSON with no extraneous commentary:
{
  "title": "Compelling, keyword-rich title (max 90 chars)",
  "slug": "url-friendly-lowercase-slug-without-special-characters (always in English Latin alphabet, even for Hindi articles)",
  "topic": "${topic}",
  "language": "${language}",
  "excerpt": "Clear 2-sentence summary of the article (140-160 chars)",
  "metaTitle": "SEO title for search engines with target keyword (50-65 chars)",
  "metaDescription": "Click-worthy meta description with clear value proposition (145-160 chars)",
  "content": "Full semantic HTML body content exceeding 2000 words..."
}`;

  const userPrompt = `Generate a comprehensive, authoritative, master-level academic guide on:
Topic: ${topic}
Working Title: ${chosenTitle}
Language: ${language === 'hi' ? 'Hindi (हिंदी - शुद्ध एवं मानक शब्दावली)' : 'English'}
Target Word Count: At least ${targetWords} words of deeply informative, well-structured educational content.

The content should cover:
1. Comprehensive Historical/Modern Context & Foundational Principles
2. Detailed Technical / Conceptual Breakdown with Real-World Practical Examples
3. Comparative Matrix (Table) contrasting methodologies, systems, or standard approaches
4. Step-by-Step Implementation / Study Strategies for Students & Competitive Aspirants
5. Cognitive Traps, Misconceptions, and How to Avoid Common Pitfalls
6. Future Horizons & Expected Industry/Curricular Evolutions
7. Interactive Self-Assessment Review & High-Yield FAQs (at least 4 questions)
8. Conclusion & Actionable Next Steps

Return ONLY the raw JSON object.`;

  const messages: OpenRouterMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  let rawOutput = '';

  // 1. Prioritize Gemini if available (consistently generates 2000+ words in 10-18s with no rate-limiting timeouts)
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_AI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (geminiKey) {
    try {
      const combinedPrompt = `${systemPrompt}\n\nUSER REQUEST:\n${userPrompt}`;
      rawOutput = await callGeminiFallback(combinedPrompt);
    } catch (err) {
      console.warn('[TrendingBlogAi] Gemini attempt failed, falling back to OpenRouter...', err);
    }
  }

  // 2. Fallback to OpenRouter if Gemini was not configured or threw an error
  if (!rawOutput && process.env.OPENROUTER_API_KEY) {
    try {
      const result = await fetchOpenRouterChat(messages, {
        temperature: 0.7,
        maxTokens: 8000,
        timeoutMs: 40000,
        autoSwitchOnLimit: true,
      });
      rawOutput = result.content;
    } catch (err) {
      console.warn('[TrendingBlogAi] OpenRouter call failed:', err);
    }
  }

  // 3. Verify output from providers
  if (!rawOutput) {
    if (!geminiKey && !process.env.OPENROUTER_API_KEY) {
      throw new Error('Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured in environment.');
    }
    throw new Error('Failed to generate blog content from AI providers (Gemini & OpenRouter). Please check API quotas and connection.');
  }

  // 4. Clean up JSON response
  let cleaned = rawOutput.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/\s*```$/i, '');
  }

  // Extract JSON object if embedded in text
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let parsed: Partial<GeneratedAiBlog>;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('[TrendingBlogAi] Failed to parse AI JSON:', cleaned.slice(0, 500));
    throw new Error('AI generated invalid JSON format for the blog post. Please try again.');
  }

  const content = (parsed.content || '').trim();
  const plainText = content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;

  // Build clean slug (with Latin fallback for Hindi or non-ASCII titles)
  const title = (parsed.title || chosenTitle).trim();
  const rawSlug = (parsed.slug || title)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160);

  const topicSlug = (parsed.topic || topic || 'trending-guide')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);

  const slugBase = rawSlug || topicSlug || 'trending-guide';
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  return {
    title,
    topic: parsed.topic || topic,
    language,
    slug,
    excerpt: parsed.excerpt?.slice(0, 300) || plainText.slice(0, 160) + '...',
    metaTitle: parsed.metaTitle?.slice(0, 70) || title.slice(0, 70),
    metaDescription: parsed.metaDescription?.slice(0, 180) || plainText.slice(0, 160),
    content,
    wordCount,
  };
}
