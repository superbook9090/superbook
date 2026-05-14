export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
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
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : res.statusText || 'Request failed';
    throw new ApiClientError(msg, res.status, data);
  }

  return data as T;
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
    const msg =
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
        ? (data as { message: string }).message
        : res.statusText || 'Request failed';
    throw new ApiClientError(msg, res.status, data);
  }

  return data as T;
}
