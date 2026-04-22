import { useState, useCallback, useRef, useMemo } from 'react';

interface ApiRequestOptions<T> {
  fn: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApiRequest<T>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const requestLockRef = useRef(false);

  const execute = useCallback(async ({ fn, onSuccess, onError }: ApiRequestOptions<T>) => {
    // Prevent duplicate requests if one is already in progress
    if (requestLockRef.current) {
      console.warn('API request already in progress, ignoring duplicate call');
      return;
    }

    requestLockRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const result = await fn();
      setData(result);
      onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
      requestLockRef.current = false;
    }
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
    requestLockRef.current = false;
  }, []);

  const result = useMemo(() => ({
    execute,
    isLoading,
    error,
    data,
    reset,
    get isLocked() { return requestLockRef.current; },
  }), [execute, isLoading, error, data, reset]);

  return result;
}
