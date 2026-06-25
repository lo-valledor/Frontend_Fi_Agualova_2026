// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  SECURITY = 'SECURITY'
}

// Security event types
export enum SecurityEventType {
  // Authentication events
  AUTH_LOGIN_SUCCESS = 'AUTH_LOGIN_SUCCESS',
  AUTH_LOGIN_FAILURE = 'AUTH_LOGIN_FAILURE',
  AUTH_LOGOUT = 'AUTH_LOGOUT',
  AUTH_TOKEN_REFRESH = 'AUTH_TOKEN_REFRESH',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  AUTH_SESSION_TIMEOUT = 'AUTH_SESSION_TIMEOUT',

  // Authorization events
  AUTHZ_ACCESS_DENIED = 'AUTHZ_ACCESS_DENIED',
  AUTHZ_ROLE_CHANGE = 'AUTHZ_ROLE_CHANGE',

  // Input validation events
  VALIDATION_FAILURE = 'VALIDATION_FAILURE',
  SUSPICIOUS_INPUT = 'SUSPICIOUS_INPUT',

  // API events
  API_ERROR = 'API_ERROR',
  API_RATE_LIMITED = 'API_RATE_LIMITED',
  API_UNAUTHORIZED = 'API_UNAUTHORIZED',

  // Security violations
  CSP_VIOLATION = 'CSP_VIOLATION',
  XSS_ATTEMPT = 'XSS_ATTEMPT',

  // User actions (audit)
  USER_ACTION = 'USER_ACTION',
  DATA_EXPORT = 'DATA_EXPORT',
  SETTINGS_CHANGE = 'SETTINGS_CHANGE'
}

// Log entry interface
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  eventType?: SecurityEventType;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

// Sensitive data patterns to sanitize
const SENSITIVE_PATTERNS = [
  /password/i,
  /contrasena/i,
  /token/i,
  /secret/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit.?card/i,
  /cvv/i,
  /ssn/i,
  /rut/i
];

function isSensitiveKey(key: string): boolean {
  return SENSITIVE_PATTERNS.some(pattern => pattern.test(key));
}

function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (isSensitiveKey(key)) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function getSessionId(): string | undefined {
  try {
    // Don't expose actual session ID, just a hash indicator
    const hasSession = !!sessionStorage.getItem('sessionActive');
    return hasSession ? 'active' : undefined;
  } catch {
    return undefined;
  }
}

function formatLogEntry(entry: LogEntry): string {
  const parts = [
    `[${entry.timestamp}]`,
    `[${entry.level}]`,
    entry.eventType ? `[${entry.eventType}]` : '',
    entry.message
  ].filter(Boolean);

  return parts.join(' ');
}

function shouldLog(level: LogLevel): boolean {
  const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;

  // In production, only log WARN, ERROR, and SECURITY
  if (isProduction) {
    return [LogLevel.WARN, LogLevel.ERROR, LogLevel.SECURITY].includes(level);
  }

  // In development, log everything
  if (isDevelopment) {
    return true;
  }

  return true;
}

async function sendToExternalService(entry: LogEntry): Promise<void> {
  // Only send security events and errors in production
  if (!import.meta.env.PROD) return;

  if (entry.level === LogLevel.SECURITY || entry.level === LogLevel.ERROR) {
    // FIXME: pendiente conectar con servicio externo (Sentry/Loggly)
    // Example: await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
    // Example: Sentry.captureMessage(entry.message, { extra: entry.context });
  }
}

class SecurityLogger {
  private userId?: string;

  setUserId(userId: string | undefined): void {
    this.userId = userId;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    eventType?: SecurityEventType,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      eventType,
      message,
      context: context ? sanitizeObject(context) : undefined,
      userId: this.userId,
      sessionId: getSessionId(),
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.pathname : undefined
    };
  }

  private log(
    level: LogLevel,
    message: string,
    eventType?: SecurityEventType,
    context?: Record<string, unknown>
  ): void {
    if (!shouldLog(level)) return;

    const entry = this.createEntry(level, message, eventType, context);
    const formattedMessage = formatLogEntry(entry);

    // Console output based on level
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.context || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.context || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.context || '');
        break;
      case LogLevel.ERROR:
      case LogLevel.SECURITY:
        console.error(formattedMessage, entry.context || '');
        break;
    }

    // Send to external service asynchronously
    sendToExternalService(entry).catch(() => {
      // Silent fail - don't break the app for logging failures
    });
  }

  // Public logging methods
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, undefined, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log(LogLevel.ERROR, message, undefined, context);
  }

  security(
    eventType: SecurityEventType,
    message: string,
    context?: Record<string, unknown>
  ): void {
    this.log(LogLevel.SECURITY, message, eventType, context);
  }

  // Convenience methods for common security events
  authLoginSuccess(userId: string, context?: Record<string, unknown>): void {
    this.setUserId(userId);
    this.security(
      SecurityEventType.AUTH_LOGIN_SUCCESS,
      'User logged in successfully',
      {
        ...context,
        userId
      }
    );
  }

  authLoginFailure(reason: string, context?: Record<string, unknown>): void {
    this.security(
      SecurityEventType.AUTH_LOGIN_FAILURE,
      `Login failed: ${reason}`,
      context
    );
  }

  authLogout(context?: Record<string, unknown>): void {
    this.security(SecurityEventType.AUTH_LOGOUT, 'User logged out', context);
    this.setUserId(undefined);
  }

  accessDenied(resource: string, context?: Record<string, unknown>): void {
    this.security(
      SecurityEventType.AUTHZ_ACCESS_DENIED,
      `Access denied to: ${resource}`,
      context
    );
  }

  validationFailure(field: string, context?: Record<string, unknown>): void {
    this.security(
      SecurityEventType.VALIDATION_FAILURE,
      `Validation failed for: ${field}`,
      context
    );
  }

  apiError(
    endpoint: string,
    statusCode: number,
    context?: Record<string, unknown>
  ): void {
    this.security(
      SecurityEventType.API_ERROR,
      `API error on ${endpoint}: ${statusCode}`,
      {
        ...context,
        endpoint,
        statusCode
      }
    );
  }

  suspiciousActivity(
    description: string,
    context?: Record<string, unknown>
  ): void {
    this.security(
      SecurityEventType.SUSPICIOUS_INPUT,
      `Suspicious activity: ${description}`,
      context
    );
  }

  userAction(action: string, context?: Record<string, unknown>): void {
    this.security(
      SecurityEventType.USER_ACTION,
      `User action: ${action}`,
      context
    );
  }
}

// Export singleton instance
export const securityLogger = new SecurityLogger();

// Export types for external use
export type { LogEntry };
