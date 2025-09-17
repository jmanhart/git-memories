import * as Sentry from "@sentry/node";

export interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  debug?: boolean;
}

export function initSentry(config: SentryConfig = {}): void {
  const {
    dsn = process.env.SENTRY_DSN,
    environment = process.env.NODE_ENV || "production",
    release = process.env.npm_package_version,
    debug = process.env.SENTRY_DEBUG === "true",
  } = config;

  // Only initialize Sentry if DSN is provided
  if (!dsn) {
    console.log("Sentry DSN not provided, skipping Sentry initialization");
    return;
  }

  Sentry.init({
    dsn,
    environment,
    release,
    debug,

    // Enable Sentry logging
    enableLogs: true,

    // Performance monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Integrations for comprehensive logging
    integrations: [
      // Capture console logs and send to Sentry
      Sentry.consoleLoggingIntegration({
        levels: ["log", "warn", "error"],
      }),
    ],

    // Error filtering
    beforeSend(event) {
      // Filter out common CLI errors that aren't actionable
      if (event.exception) {
        const error = event.exception.values?.[0];
        if (
          error?.type === "Error" &&
          error?.value?.includes("Command failed")
        ) {
          return null; // Don't send command failures
        }
      }
      return event;
    },

    // Add user context for CLI tools
    initialScope: {
      tags: {
        component: "git-memories-cli",
      },
    },
  });

  console.log(`Sentry initialized for environment: ${environment}`);
}

export function captureException(
  error: Error,
  context?: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

export function captureMessage(
  message: string,
  level: Sentry.SeverityLevel = "info",
  context?: Record<string, any>
): void {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: "info",
  });
}

export function setUserContext(user: {
  id?: string;
  username?: string;
  email?: string;
}): void {
  Sentry.setUser(user);
}

export function setTag(key: string, value: string): void {
  Sentry.setTag(key, value);
}

export function setContext(key: string, context: Record<string, any>): void {
  Sentry.setContext(key, context);
}

export function flush(): Promise<boolean> {
  return Sentry.flush(2000); // Wait up to 2 seconds for events to be sent
}

// Sentry native logging methods
export function logTrace(message: string, data?: Record<string, any>): void {
  Sentry.logger.trace(message, data);
}

export function logDebug(message: string, data?: Record<string, any>): void {
  Sentry.logger.debug(message, data);
}

export function logInfo(message: string, data?: Record<string, any>): void {
  Sentry.logger.info(message, data);
}

export function logWarn(message: string, data?: Record<string, any>): void {
  Sentry.logger.warn(message, data);
}

export function logError(message: string, data?: Record<string, any>): void {
  Sentry.logger.error(message, data);
}

export function logFatal(message: string, data?: Record<string, any>): void {
  Sentry.logger.fatal(message, data);
}

// Dynamic message formatting with Sentry
export function logFormatted(
  level: "trace" | "debug" | "info" | "warn" | "error" | "fatal",
  template: string,
  ...args: any[]
): void {
  // Simple string interpolation for now
  let formattedMessage = template;
  args.forEach((arg, index) => {
    formattedMessage = formattedMessage.replace(`\${${index}}`, String(arg));
  });
  Sentry.logger[level](formattedMessage);
}
