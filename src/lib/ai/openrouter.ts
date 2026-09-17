/**
 * OpenRouter AI Client
 * Provides chat completions with multi-model auto-switch & fallback support for AI quiz generation.
 */

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenRouterChatOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  autoSwitchOnLimit?: boolean;
  validateOutput?: (text: string) => boolean;
}

export interface OpenRouterChatResult {
  content: string;
  modelUsed: string;
  switched: boolean;
}

interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
    finish_reason?: string;
  }>;
  error?: {
    message?: string;
    code?: number | string;
  };
}

/**
 * Verified active free generative models on OpenRouter
 */
export const ACTIVE_FREE_MODELS: string[] = [
  'nex-agi/nex-n2.5-pro:free',
  'dots-studio/dots-3-note-preview:free',
  'nvidia/nemotron-3.5-lightning:free',
  'nvidia/nemotron-3-super-120b-a12b:free',
  'cohere/north-mini-code:free',
];

/**
 * Executes chat completion through OpenRouter with automatic model fallback.
 * If one model reaches rate limits or quota, automatically switches to other available free models.
 */
export async function fetchOpenRouterChat(
  messages: OpenRouterMessage[],
  options?: OpenRouterChatOptions
): Promise<OpenRouterChatResult> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is not configured in environment');
  }
  const rawModel = options?.model || process.env.OPENROUTER_MODEL;
  const configuredModel = rawModel && rawModel !== 'auto' ? rawModel : undefined;
  const autoSwitch = options?.autoSwitchOnLimit ?? true;

  // Build candidate models order
  const candidateModels: string[] = configuredModel
    ? autoSwitch
      ? [configuredModel, ...ACTIVE_FREE_MODELS]
      : [configuredModel]
    : ACTIVE_FREE_MODELS;

  // Deduplicate while preserving priority order
  const uniqueModels = Array.from(new Set(candidateModels));
  const primaryModel = uniqueModels[0];

  let lastError: Error | null = null;

  for (const model of uniqueModels) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 25000);

    try {
      const siteUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://quiz-do.com';
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': siteUrl,
          'X-Title': 'Quiz-Do Learning Platform',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.5,
          max_tokens: options?.maxTokens ?? 3000,
          reasoning: { effort: 'none' },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = (await res.json()) as OpenRouterResponse;

      if (!res.ok) {
        const errorMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        const isLimitOrOverload =
          res.status === 429 ||
          res.status === 402 ||
          res.status === 503 ||
          errorMsg.toLowerCase().includes('rate limit') ||
          errorMsg.toLowerCase().includes('quota') ||
          errorMsg.toLowerCase().includes('overloaded');

        if (isLimitOrOverload) {
          console.warn(`[OpenRouter] Model "${model}" limit or quota reached (${errorMsg}). Switching to other free model...`);
        } else {
          console.warn(`[OpenRouter] Model "${model}" failed (${errorMsg}). Switching to other free model...`);
        }
        lastError = new Error(errorMsg);
        continue;
      }

      const content = data?.choices?.[0]?.message?.content;
      if (
        typeof content === 'string' &&
        content.trim().length > 0 &&
        !content.toLowerCase().startsWith('user safety:')
      ) {
        const trimmed = content.trim();

        // Optional custom validator (e.g. verifying valid quiz JSON structure)
        if (options?.validateOutput && !options.validateOutput(trimmed)) {
          console.warn(`[OpenRouter] Model "${model}" output failed validation. Switching to other free model...`);
          lastError = new Error(`Model "${model}" output failed validation`);
          continue;
        }

        const switched = model !== primaryModel;
        if (switched) {
          console.log(`[OpenRouter] Successfully failed over to free model "${model}"`);
        }

        return {
          content: trimmed,
          modelUsed: model,
          switched,
        };
      }

      lastError = new Error(`Model "${model}" returned invalid or empty response`);
    } catch (err: unknown) {
      clearTimeout(timeout);
      const isAbort = err instanceof Error && err.name === 'AbortError';
      const msg = isAbort
        ? `Request timed out after ${options?.timeoutMs ?? 25000}ms`
        : (err instanceof Error ? err.message : String(err));
      console.warn(`[OpenRouter] Model "${model}" error: ${msg}. Switching to next free model...`);
      lastError = new Error(msg);
    }
  }

  throw lastError || new Error('All OpenRouter free models failed to respond.');
}
