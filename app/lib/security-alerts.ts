import { SecurityEventType, securityLogger } from './security-logger';

// Alert severity levels
export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Alert configuration
interface AlertConfig {
  severity: AlertSeverity;
  notify: boolean;
  block: boolean;
  reportToBackend: boolean;
}

// Default alert configurations by event type
const ALERT_CONFIGS: Record<SecurityEventType, AlertConfig> = {
  // Authentication - High priority
  [SecurityEventType.AUTH_LOGIN_SUCCESS]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.AUTH_LOGIN_FAILURE]: {
    severity: AlertSeverity.MEDIUM,
    notify: false,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.AUTH_LOGOUT]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.AUTH_TOKEN_REFRESH]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: false
  },
  [SecurityEventType.AUTH_TOKEN_EXPIRED]: {
    severity: AlertSeverity.MEDIUM,
    notify: true,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.AUTH_SESSION_TIMEOUT]: {
    severity: AlertSeverity.MEDIUM,
    notify: true,
    block: false,
    reportToBackend: true
  },

  // Authorization - High priority
  [SecurityEventType.AUTHZ_ACCESS_DENIED]: {
    severity: AlertSeverity.HIGH,
    notify: true,
    block: true,
    reportToBackend: true
  },
  [SecurityEventType.AUTHZ_ROLE_CHANGE]: {
    severity: AlertSeverity.MEDIUM,
    notify: true,
    block: false,
    reportToBackend: true
  },

  // Validation - Medium priority
  [SecurityEventType.VALIDATION_FAILURE]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: false
  },
  [SecurityEventType.SUSPICIOUS_INPUT]: {
    severity: AlertSeverity.HIGH,
    notify: true,
    block: true,
    reportToBackend: true
  },

  // API - Variable priority
  [SecurityEventType.API_ERROR]: {
    severity: AlertSeverity.MEDIUM,
    notify: false,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.API_RATE_LIMITED]: {
    severity: AlertSeverity.HIGH,
    notify: true,
    block: true,
    reportToBackend: true
  },
  [SecurityEventType.API_UNAUTHORIZED]: {
    severity: AlertSeverity.HIGH,
    notify: true,
    block: true,
    reportToBackend: true
  },

  // Security violations - Critical priority
  [SecurityEventType.CSP_VIOLATION]: {
    severity: AlertSeverity.CRITICAL,
    notify: true,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.XSS_ATTEMPT]: {
    severity: AlertSeverity.CRITICAL,
    notify: true,
    block: true,
    reportToBackend: true
  },

  // User actions - Low priority (audit)
  [SecurityEventType.USER_ACTION]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: false
  },
  [SecurityEventType.DATA_EXPORT]: {
    severity: AlertSeverity.MEDIUM,
    notify: false,
    block: false,
    reportToBackend: true
  },
  [SecurityEventType.SETTINGS_CHANGE]: {
    severity: AlertSeverity.LOW,
    notify: false,
    block: false,
    reportToBackend: false
  }
};

// Rate limiting state
interface RateLimitState {
  count: number;
  firstAttempt: number;
  blocked: boolean;
}

const rateLimitStates = new Map<string, RateLimitState>();

// Rate limit configuration
const RATE_LIMIT_CONFIG = {
  maxAttempts: 5,
  windowMs: 60000, // 1 minute
  blockDurationMs: 300000 // 5 minutes
};

function checkRateLimit(action: string): boolean {
  const now = Date.now();
  const state = rateLimitStates.get(action);

  if (!state) {
    rateLimitStates.set(action, {
      count: 1,
      firstAttempt: now,
      blocked: false
    });
    return true;
  }

  // Check if block has expired
  if (state.blocked) {
    const blockExpiry = state.firstAttempt + RATE_LIMIT_CONFIG.blockDurationMs;
    if (now > blockExpiry) {
      // Reset state
      rateLimitStates.set(action, {
        count: 1,
        firstAttempt: now,
        blocked: false
      });
      return true;
    }
    return false;
  }

  // Check if window has expired
  const windowExpiry = state.firstAttempt + RATE_LIMIT_CONFIG.windowMs;
  if (now > windowExpiry) {
    // Reset window
    rateLimitStates.set(action, {
      count: 1,
      firstAttempt: now,
      blocked: false
    });
    return true;
  }

  // Increment count within window
  state.count++;

  // Check if exceeded
  if (state.count > RATE_LIMIT_CONFIG.maxAttempts) {
    state.blocked = true;
    securityLogger.security(
      SecurityEventType.API_RATE_LIMITED,
      `Rate limit exceeded for action: ${action}`,
      { action, attempts: state.count }
    );
    return false;
  }

  return true;
}

class SecurityAlertManager {
  private alertHandlers: Map<
    AlertSeverity,
    ((message: string, context?: Record<string, unknown>) => void)[]
  > = new Map();

  constructor() {
    // Initialize CSP violation listener
    this.initCSPListener();
  }

  private initCSPListener(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('securitypolicyviolation', event => {
      this.triggerAlert(
        SecurityEventType.CSP_VIOLATION,
        'CSP Violation detected',
        {
          blockedURI: event.blockedURI,
          violatedDirective: event.violatedDirective,
          originalPolicy: event.originalPolicy,
          sourceFile: event.sourceFile,
          lineNumber: event.lineNumber
        }
      );
    });
  }

  onAlert(
    severity: AlertSeverity,
    handler: (message: string, context?: Record<string, unknown>) => void
  ): void {
    const handlers = this.alertHandlers.get(severity) || [];
    handlers.push(handler);
    this.alertHandlers.set(severity, handlers);
  }

  triggerAlert(
    eventType: SecurityEventType,
    message: string,
    context?: Record<string, unknown>
  ): { blocked: boolean } {
    const config = ALERT_CONFIGS[eventType];

    // Log the security event
    securityLogger.security(eventType, message, {
      ...context,
      severity: config.severity
    });

    // Notify registered handlers
    if (config.notify) {
      const handlers = this.alertHandlers.get(config.severity) || [];
      handlers.forEach(handler => handler(message, context));
    }

    // Report to backend if configured
    if (config.reportToBackend) {
      this.reportToBackend(eventType, message, config.severity, context);
    }

    return { blocked: config.block };
  }

  private async reportToBackend(
    eventType: SecurityEventType,
    message: string,
    severity: AlertSeverity,
    context?: Record<string, unknown>
  ): Promise<void> {
    if (!import.meta.env.PROD) return;

    try {
      // FIXME: pendiente integrar con backend de alertas
      // await fetch('/api/security/alerts', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     eventType,
      //     message,
      //     severity,
      //     context,
      //     timestamp: new Date().toISOString(),
      //   }),
      // });
    } catch {
      // Silent fail - don't break the app for alert failures
      console.error('[SecurityAlert] Failed to report to backend');
    }
  }

  checkRateLimit(action: string): boolean {
    return checkRateLimit(action);
  }

  loginAttempt(
    success: boolean,
    context?: Record<string, unknown>
  ): { blocked: boolean } {
    // Check rate limit for login attempts
    if (!success && !this.checkRateLimit('login')) {
      return this.triggerAlert(
        SecurityEventType.API_RATE_LIMITED,
        'Too many login attempts',
        context
      );
    }

    const eventType = success
      ? SecurityEventType.AUTH_LOGIN_SUCCESS
      : SecurityEventType.AUTH_LOGIN_FAILURE;

    return this.triggerAlert(
      eventType,
      success ? 'Login successful' : 'Login failed',
      context
    );
  }

  accessDenied(
    resource: string,
    context?: Record<string, unknown>
  ): { blocked: boolean } {
    return this.triggerAlert(
      SecurityEventType.AUTHZ_ACCESS_DENIED,
      `Access denied to resource: ${resource}`,
      { ...context, resource }
    );
  }

  suspiciousInput(
    field: string,
    value: string,
    context?: Record<string, unknown>
  ): { blocked: boolean } {
    return this.triggerAlert(
      SecurityEventType.SUSPICIOUS_INPUT,
      `Suspicious input detected in field: ${field}`,
      { ...context, field, valueLength: value.length }
    );
  }

  apiUnauthorized(
    endpoint: string,
    context?: Record<string, unknown>
  ): { blocked: boolean } {
    return this.triggerAlert(
      SecurityEventType.API_UNAUTHORIZED,
      `Unauthorized API access: ${endpoint}`,
      { ...context, endpoint }
    );
  }

  sessionTimeout(context?: Record<string, unknown>): { blocked: boolean } {
    return this.triggerAlert(
      SecurityEventType.AUTH_SESSION_TIMEOUT,
      'Session timeout',
      context
    );
  }
}

// Export singleton instance
export const securityAlerts = new SecurityAlertManager();

// Export types
export type { AlertConfig };
