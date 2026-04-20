// Logging utility with request ID generation for tracing
export interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  userAgent?: string;
}

// Generate unique request ID (edge runtime compatible)
export function generateRequestId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Log levels
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Format log message
function formatLog(level: LogLevel, message: string, context?: LogContext, data?: any): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}]${contextStr} ${message}${dataStr}`;
}

// Log functions
export function logInfo(message: string, context?: LogContext, data?: any) {
  console.log(formatLog(LogLevel.INFO, message, context, data));
}

export function logWarn(message: string, context?: LogContext, data?: any) {
  console.warn(formatLog(LogLevel.WARN, message, context, data));
}

export function logError(message: string, context?: LogContext, data?: any) {
  console.error(formatLog(LogLevel.ERROR, message, context, data));
}

// Log failed request
export function logFailedRequest(
  statusCode: number,
  method: string,
  path: string,
  context?: LogContext,
  error?: any
) {
  logError(
    `Failed request: ${method} ${path} - ${statusCode}`,
    context,
    error ? { error: error.message, stack: error.stack } : undefined
  );
}

// Log rate limit hit
export function logRateLimitHit(
  identifier: string,
  path: string,
  limitType: string,
  context?: LogContext
) {
  logWarn(
    `Rate limit hit for ${identifier} on ${path} (${limitType})`,
    context,
    { limitType, identifier }
  );
}

// Log API error
export function logApiError(
  error: Error,
  method: string,
  path: string,
  context?: LogContext
) {
  logError(
    `API error: ${method} ${path} - ${error.message}`,
    context,
    {
      error: error.message,
      stack: error.stack,
      name: error.name,
    }
  );
}
