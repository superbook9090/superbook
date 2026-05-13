export interface LogContext {
  requestId?: string;
  userId?: string;
  ip?: string;
  method?: string;
  path?: string;
  userAgent?: string;
}

// Log levels
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Format log message
function formatLog(level: LogLevel, message: string, context?: LogContext, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` [${JSON.stringify(context)}]` : '';
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level}]${contextStr} ${message}${dataStr}`;
}

// Log functions
export function logInfo(message: string, context?: LogContext, data?: unknown) {
  console.log(formatLog(LogLevel.INFO, message, context, data));
}

export function logWarn(message: string, context?: LogContext, data?: unknown) {
  console.warn(formatLog(LogLevel.WARN, message, context, data));
}

export function logError(message: string, context?: LogContext, data?: unknown) {
  console.error(formatLog(LogLevel.ERROR, message, context, data));
}

// Log failed request
export function logFailedRequest(
  statusCode: number,
  method: string,
  path: string,
  context?: LogContext,
  error?: Error
) {
  logError(
    `Failed request: ${method} ${path} - ${statusCode}`,
    context,
    error ? { error: error.message, stack: error.stack } : undefined
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
