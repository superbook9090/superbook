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
  'openrouter/free',
  'baidu/ernie-5.5-flash-preview:free',
  'nvidia/nemotron-3.5-lightning:free',
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'inclusionai/ling-3.2-flash:free',
];

let cachedLiveFreeModels: { models: string[]; fetchedAt: number } | null = null;
const LIVE_MODELS_CACHE_TTL_MS = 30 * 60 * 1000;

async function fetchLiveOpenRouterFreeModels(): Promise<string[]> {
  if (
    cachedLiveFreeModels &&
    Date.now() - cachedLiveFreeModels.fetchedAt < LIVE_MODELS_CACHE_TTL_MS
  ) {
    return cachedLiveFreeModels.models;
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const res = await fetch('https://openrouter.ai/api/v1/models', { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = (await res.json()) as { data?: Array<{ id?: string }> };
    const models = (data.data || [])
      .map((m) => m.id || '')
      .filter((id) => id.endsWith(':free') && !id.includes('embed') && !id.includes('vl'));
    cachedLiveFreeModels = { models, fetchedAt: Date.now() };
    return models;
  } catch {
    return [];
  }
}

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
    : autoSwitch
      ? ACTIVE_FREE_MODELS
      : [ACTIVE_FREE_MODELS[0]];

  // Deduplicate while preserving priority order
  const uniqueModels = Array.from(new Set(candidateModels));
  const primaryModel = uniqueModels[0];

  let lastError: Error | null = null;

  const tryModels = async (modelsToTry: string[]): Promise<OpenRouterChatResult | null> => {
    for (const model of modelsToTry) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), options?.timeoutMs ?? 25000);

      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'https://www.quizdo.in';
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
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        let data: OpenRouterResponse = {};
        try {
          data = (await res.json()) as OpenRouterResponse;
        } catch {
          data = { error: { message: `Non-JSON response (HTTP ${res.status})` } };
        }

        if (!res.ok) {
          const errorMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
          console.warn(`[OpenRouter] Model "${model}" failed (${errorMsg}). Switching to next free model...`);
          lastError = new Error(errorMsg);
          continue;
        }

        const msg = data?.choices?.[0]?.message;
        const rawContent = msg?.content;
        const reasoning = (msg as { reasoning?: string } | undefined)?.reasoning;
        const content =
          typeof rawContent === 'string' && rawContent.trim().length > 0
            ? rawContent
            : typeof reasoning === 'string' && reasoning.trim().length > 0
              ? reasoning
              : undefined;

        if (
          typeof content === 'string' &&
          content.trim().length > 0 &&
          !content.toLowerCase().startsWith('user safety:')
        ) {
          const trimmed = content.trim();

          // Optional custom validator (e.g. verifying valid quiz JSON structure)
          if (options?.validateOutput && !options.validateOutput(trimmed)) {
            console.warn(`[OpenRouter] Model "${model}" output failed validation. Switching to next free model...`);
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
    return null;
  };

  const firstAttempt = await tryModels(uniqueModels);
  if (firstAttempt) return firstAttempt;

  // Dynamic catalog discovery fallback if all static models failed
  if (autoSwitch) {
    const liveModels = await fetchLiveOpenRouterFreeModels();
    const untried = liveModels.filter((m) => !uniqueModels.includes(m)).slice(0, 4);
    if (untried.length > 0) {
      const dynamicAttempt = await tryModels(untried);
      if (dynamicAttempt) return dynamicAttempt;
    }
  }

  throw lastError || new Error('All OpenRouter free models failed to respond.');
}
