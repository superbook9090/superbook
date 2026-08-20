const DEFAULT_CHAT_URL = 'https://smart-icons-design.loca.lt/generate';

function getChatApiUrl(): string {
  return process.env.AI_API_URL?.trim() || DEFAULT_CHAT_URL;
}

function extractReplyText(payload: unknown): string | null {
  if (typeof payload === 'string' && payload.trim()) {
    return payload.trim();
  }

  if (Array.isArray(payload) && payload.length > 0) {
    return extractReplyText(payload[0]);
  }

  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const record = payload as Record<string, unknown>;
  const directKeys = [
    'reply',
    'response',
    'message',
    'answer',
    'content',
    'text',
    'output',
    'generated_text',
    'generation',
    'result',
  ];

  for (const key of directKeys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  if (typeof record.data === 'object' && record.data !== null) {
    const nested = extractReplyText(record.data);
    if (nested) return nested;
  }

  if (Array.isArray(record.choices) && record.choices.length > 0) {
    const first = record.choices[0];
    if (typeof first === 'object' && first !== null) {
      const choice = first as Record<string, unknown>;
      if (typeof choice.message === 'object' && choice.message !== null) {
        const message = choice.message as Record<string, unknown>;
        if (typeof message.content === 'string' && message.content.trim()) {
          return message.content.trim();
        }
      }
      if (typeof choice.text === 'string' && choice.text.trim()) {
        return choice.text.trim();
      }
    }
  }

  return null;
}

export async function fetchStockanlyzerChat(
  message: string,
  retries = 1,
  maxTokens = 2048
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Message is required');
  }

  const url = getChatApiUrl();
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({
          prompt: trimmed,
          max_tokens: maxTokens,
        }),
        cache: 'no-store',
      });

      let payload: unknown = {};
      try {
        payload = await res.json();
      } catch {
        payload = {};
      }

      if (!res.ok) {
        const errorDetail =
          extractReplyText(payload) ||
          (typeof payload === 'object' &&
            payload !== null &&
            typeof (payload as Record<string, unknown>).error === 'string'
            ? String((payload as Record<string, unknown>).error)
            : null) ||
          `Remote AI service (${url}) returned HTTP ${res.status}`;
        throw new Error(errorDetail);
      }

      const reply = extractReplyText(payload);
      if (!reply) {
        throw new Error('AI service returned an empty response');
      }

      return reply;
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw lastError ?? new Error('Failed to connect to AI solution analysis service');
}

export function buildSolutionAnalysisPrompt(input: {
  question: string;
  options: string[];
  correctAnswer: number;
  selectedOption: number;
}): string {
  const { question, options, correctAnswer, selectedOption } = input;
  const optionLines = options
    .map((option, index) => `${String.fromCharCode(65 + index)}. ${option}`)
    .join('\n');

  const correctLabel =
    correctAnswer >= 0 && correctAnswer < options.length
      ? `${String.fromCharCode(65 + correctAnswer)}. ${options[correctAnswer]}`
      : 'Unknown';

  let studentAnswerLine = 'Student answer: Not attempted';
  if (selectedOption >= 0 && selectedOption < options.length) {
    studentAnswerLine = `Student answer: ${String.fromCharCode(65 + selectedOption)}. ${options[selectedOption]}`;
  }

  return [
    'Provide a short, clear explanation (2-4 sentences) for this quiz question.',
    'Focus on why the correct answer is right and briefly address common mistakes if the student picked a wrong option.',
    '',
    `Question: ${question}`,
    'Options:',
    optionLines,
    '',
    `Correct answer: ${correctLabel}`,
    studentAnswerLine,
  ].join('\n');
}
