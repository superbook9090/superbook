import { fetchStockanlyzerChat } from '@/lib/stockanlyzer/chat';
import { fetchOpenRouterChat } from '@/lib/ai/openrouter';
import { GeneratedQuestion, parseQuestionsFromAiOutput } from './quizPrompt';

export interface GenerationResult {
  questions: GeneratedQuestion[];
  modelUsed: string;
  switchedModel: boolean;
  lastErrorMessage?: string;
}

export async function generateQuestionsWithFallback(
  prompt: string,
  numQuestions: number,
  model?: string
): Promise<GenerationResult> {
  let questions: GeneratedQuestion[] = [];
  let lastErrorMessage = '';
  let modelUsed = '';
  let switchedModel = false;

  // 1. OpenRouter service
  try {
    const openRouterResult = await fetchOpenRouterChat(
      [
        {
          role: 'system',
          content: 'You are an expert educational content creator that outputs strictly valid JSON arrays.',
        },
        { role: 'user', content: prompt },
      ],
      {
        model: model && model !== 'auto' ? model : undefined,
        autoSwitchOnLimit: true,
        validateOutput: (text) => parseQuestionsFromAiOutput(text, numQuestions).length > 0,
      }
    );
    modelUsed = openRouterResult.modelUsed;
    switchedModel = openRouterResult.switched;
    questions = parseQuestionsFromAiOutput(openRouterResult.content, numQuestions);
  } catch (err) {
    lastErrorMessage = err instanceof Error ? err.message : 'OpenRouter fetch failed';
    console.warn('[AI_QUIZ_GEN] OpenRouter service failed, attempting fallback:', lastErrorMessage);
  }

  // 2. Stockanlyzer fallback
  if (questions.length === 0) {
    try {
      const reply = await fetchStockanlyzerChat(prompt, 1, 3000);
      questions = parseQuestionsFromAiOutput(reply, numQuestions);
      if (questions.length > 0) {
        modelUsed = 'stockanlyzer';
        switchedModel = true;
      }
    } catch (err) {
      lastErrorMessage = err instanceof Error ? err.message : 'AI_API_URL fetch failed';
      console.warn('[AI_QUIZ_GEN] Fallback AI_API_URL service failed, attempting Gemini:', lastErrorMessage);
    }
  }

  // 3. Gemini fallback
  if (questions.length === 0) {
    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (apiKey) {
      const configuredGeminiModel = process.env.GEMINI_MODEL;
      const modelsToTry = [
        ...(configuredGeminiModel ? [configuredGeminiModel] : []),
        'gemini-3.6-flash',
        'gemini-3.5-flash',
        'gemini-3.5-flash-lite',
      ];

      for (const m of modelsToTry) {
        if (questions.length > 0) break;

        try {
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 2500,
                  responseMimeType: 'application/json',
                },
              }),
            }
          );

          if (res.ok) {
            const resData = await res.json();
            const rawText: string = resData.candidates?.[0]?.content?.parts?.[0]?.text || '';
            questions = parseQuestionsFromAiOutput(rawText, numQuestions);
            if (questions.length > 0) {
              modelUsed = m;
              switchedModel = true;
            }
          } else {
            const errorData = await res.json().catch(() => ({}));
            lastErrorMessage = errorData?.error?.message || res.statusText;
            if (res.status === 429) {
              break;
            }
          }
        } catch (err) {
          lastErrorMessage = err instanceof Error ? err.message : 'Gemini fetch error';
        }
      }
    }
  }

  return { questions, modelUsed, switchedModel, lastErrorMessage };
}
