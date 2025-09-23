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

    // Performance monitoring - increased sample rate for better insights
    tracesSampleRate: environment === "development" ? 1.0 : 0.2, // 100% in dev, 20% in prod
    profilesSampleRate: environment === "development" ? 1.0 : 0.1, // Profile sampling

    // Integrations for comprehensive logging and performance
    integrations: [
      // Capture console logs and send to Sentry
      Sentry.consoleLoggingIntegration({
        levels: ["log", "warn", "error"],
      }),
      // HTTP integration for tracking external API calls
      Sentry.httpIntegration({
        breadcrumbs: true,
      }),
      // Node.js specific integrations
      Sentry.nodeContextIntegration(),
      Sentry.localVariablesIntegration(),
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

  console.log(
    `Sentry initialized for environment: ${environment} with performance tracing`
  );
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

// Performance tracing functions using Sentry v10 API
export function startTransaction(
  name: string,
  op: string = "cli.operation",
  description?: string
): any {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        component: "git-memories-cli",
        ...(description && { description }),
      },
    },
    () => {}
  );
}

export function startSpan(
  parentSpan: any,
  name: string,
  op: string = "cli.span",
  description?: string
): any {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        span_name: name,
        ...(description && { description }),
      },
    },
    () => {}
  );
}

export function withTransaction<T>(
  name: string,
  op: string = "cli.operation",
  callback: (span: any) => T
): T {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        component: "git-memories-cli",
      },
    },
    (span) => {
      try {
        const result = callback(span);
        span?.setStatus({ code: 1, message: "ok" }); // 1 = OK
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: "internal_error" }); // 2 = Internal Error
        captureException(error as Error, { transaction: name });
        throw error;
      }
    }
  );
}

export function withSpan<T>(
  parentSpan: any,
  name: string,
  op: string = "cli.span",
  callback: (span: any) => T
): T {
  return Sentry.startSpan(
    {
      name,
      op,
      attributes: {
        span_name: name,
      },
    },
    (span) => {
      try {
        const result = callback(span);
        span?.setStatus({ code: 1, message: "ok" }); // 1 = OK
        return result;
      } catch (error) {
        span?.setStatus({ code: 2, message: "internal_error" }); // 2 = Internal Error
        captureException(error as Error, {
          span: name,
          transaction: parentSpan?.name,
        });
        throw error;
      }
    }
  );
}

// Convenience functions for common operations
export function traceAuth<T>(
  authMethod: string,
  callback: (span: any) => T
): T {
  return withTransaction(`auth.${authMethod}`, "auth", (span) => {
    span?.setAttributes({ auth_method: authMethod });
    return callback(span);
  });
}

export function traceApiCall<T>(
  apiName: string,
  endpoint: string,
  callback: (span: any) => T
): T {
  return withTransaction(`api.${apiName}`, "http.client", (span) => {
    span?.setAttributes({
      api_name: apiName,
      endpoint: endpoint,
      "http.url": endpoint,
    });
    return callback(span);
  });
}

export function traceFileOperation<T>(
  operation: string,
  filePath: string,
  callback: (span: any) => T
): T {
  return withTransaction(`file.${operation}`, "file", (span) => {
    span?.setAttributes({
      file_operation: operation,
      "file.path": filePath,
    });
    return callback(span);
  });
}
