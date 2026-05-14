export interface ApiResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

function parseErrorMessage(data: unknown): { message: string; code?: string } {
  if (typeof data !== 'object' || data === null) {
    return { message: 'Request failed' };
  }
  const o = data as Record<string, unknown>;
  if (o.success === false && o.error && typeof o.error === 'object' && o.error !== null) {
    const err = o.error as Record<string, unknown>;
    const message = typeof err.message === 'string' ? err.message : 'Request failed';
    const code = typeof err.code === 'string' ? err.code : undefined;
    return { message, code };
  }
  if (typeof o.message === 'string') {
    return { message: o.message };
  }
  return { message: 'Request failed' };
}

type JsonInit = Omit<RequestInit, 'body'> & {
  body?: unknown;
  acceptStatuses?: number[];
};

/**
 * JSON fetch helper: sets Content-Type when body is sent, parses JSON, throws {@link ApiClientError} on non-OK.
 */
export async function apiJson<T>(url: string, init: JsonInit = {}): Promise<T> {
  const { body, headers, acceptStatuses = [], ...rest } = init;
  const hasBody = body !== undefined;

  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok && !acceptStatuses.includes(res.status)) {
    const { message, code } = parseErrorMessage(data);
    throw new ApiClientError(message || res.statusText || 'Request failed', res.status, data, code);
  }

  return data as T;
}

/**
 * Parses `{ success, data, meta }` envelopes from API routes; falls back to treating the body as `T` for legacy routes.
 */
export async function apiJsonData<T>(
  url: string,
  init: JsonInit = {}
): Promise<{ data: T; meta?: ApiResponseMeta }> {
  const { body, headers, acceptStatuses = [], ...rest } = init;
  const hasBody = body !== undefined;

  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      ...(headers as Record<string, string> | undefined),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  let raw: unknown = {};
  try {
    raw = await res.json();
  } catch {
    raw = {};
  }

  if (!res.ok && !acceptStatuses.includes(res.status)) {
    const { message, code } = parseErrorMessage(raw);
    throw new ApiClientError(message || res.statusText || 'Request failed', res.status, raw, code);
  }

  if (typeof raw === 'object' && raw !== null && 'success' in raw) {
    const envelope = raw as { success: boolean; data?: unknown; meta?: ApiResponseMeta; error?: { code: string; message: string } };
    if (envelope.success === false) {
      if (acceptStatuses.includes(res.status)) {
        return { data: raw as T };
      }
      throw new ApiClientError(
        envelope.error?.message ?? 'Request failed',
        res.status,
        raw,
        envelope.error?.code
      );
    }
    return { data: envelope.data as T, meta: envelope.meta };
  }

  return { data: raw as T };
}

/**
 * POST `multipart/form-data` (e.g. file upload). Do not set `Content-Type` — the browser sets the boundary.
 * Parses JSON response; throws {@link ApiClientError} on non-OK.
 */
export async function apiFormJson<T>(url: string, formData: FormData, init: Omit<RequestInit, 'body'> = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    method: init.method ?? 'POST',
    body: formData,
    cache: 'no-store',
  });

  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    const { message, code } = parseErrorMessage(data);
    throw new ApiClientError(message || res.statusText || 'Request failed', res.status, data, code);
  }

  return data as T;
}
