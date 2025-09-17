/**
 * Logger Utility
 *
 * Provides structured logging for debugging authentication and other issues
 */

import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";
import {
  logTrace,
  logDebug,
  logInfo,
  logWarn,
  logError,
  logFatal,
} from "./sentry";

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  component: string;
  message: string;
  data?: any;
  operation?: string;
  duration?: number;
}

export class Logger {
  private logDir: string;
  private logFile: string;

  constructor(component: string = "git-memories") {
    // Create logs directory in test folder if it exists, otherwise in home
    const testLogDir = path.join(process.cwd(), "test", "logs");
    const homeLogDir = path.join(homedir(), ".config", "git-memories", "logs");

    this.logDir = fs.existsSync(path.join(process.cwd(), "test"))
      ? testLogDir
      : homeLogDir;
    this.logFile = path.join(
      this.logDir,
      `${component}-${this.getDateString()}.log`
    );

    this.ensureLogDir();
  }

  private ensureLogDir(): void {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  private formatLogEntry(entry: LogEntry): string {
    const dataStr = entry.data
      ? `\n  Data: ${JSON.stringify(entry.data, null, 2)}`
      : "";
    const operationStr = entry.operation ? ` [${entry.operation}]` : "";
    const durationStr = entry.duration ? ` (${entry.duration}ms)` : "";
    return `[${entry.timestamp}] ${entry.level} [${entry.component}]${operationStr} ${entry.message}${durationStr}${dataStr}\n`;
  }

  private writeLog(entry: LogEntry): void {
    const logLine = this.formatLogEntry(entry);

    // Write to file
    fs.appendFileSync(this.logFile, logLine);

    // Also log to console for development
    if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
      console.log(logLine.trim());
    }

    // Send to Sentry for remote logging
    this.sendToSentry(entry);
  }

  private sendToSentry(entry: LogEntry): void {
    const sentryData = {
      component: entry.component,
      operation: entry.operation,
      duration: entry.duration,
      ...entry.data,
    };

    try {
      switch (entry.level) {
        case "DEBUG":
          logDebug(`${entry.component}: ${entry.message}`, sentryData);
          break;
        case "INFO":
          logInfo(`${entry.component}: ${entry.message}`, sentryData);
          break;
        case "WARN":
          logWarn(`${entry.component}: ${entry.message}`, sentryData);
          break;
        case "ERROR":
          logError(`${entry.component}: ${entry.message}`, sentryData);
          break;
      }
    } catch (error) {
      // Don't let Sentry logging errors break the application
      console.error("Failed to send log to Sentry:", error);
    }
  }

  info(
    component: string,
    message: string,
    data?: any,
    operation?: string,
    duration?: number
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "INFO",
      component,
      message,
      data,
      operation,
      duration,
    });
  }

  warn(
    component: string,
    message: string,
    data?: any,
    operation?: string,
    duration?: number
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "WARN",
      component,
      message,
      data,
      operation,
      duration,
    });
  }

  error(
    component: string,
    message: string,
    data?: any,
    operation?: string,
    duration?: number
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      component,
      message,
      data,
      operation,
      duration,
    });
  }

  debug(
    component: string,
    message: string,
    data?: any,
    operation?: string,
    duration?: number
  ): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "DEBUG",
      component,
      message,
      data,
      operation,
      duration,
    });
  }

  // Authentication-specific logging methods
  authStart(method: string, data?: any): void {
    this.info("AUTH", `Starting ${method} authentication`, data, "auth_start");
  }

  authSuccess(method: string, username: string, duration?: number): void {
    this.info(
      "AUTH",
      `${method} authentication successful`,
      { username },
      "auth_success",
      duration
    );
  }

  authFailure(method: string, error: string, data?: any): void {
    this.error(
      "AUTH",
      `${method} authentication failed: ${error}`,
      data,
      "auth_failure"
    );
  }

  authStep(step: string, data?: any): void {
    this.debug("AUTH", `Authentication step: ${step}`, data, "auth_step");
  }

  // API-specific logging methods
  apiRequest(endpoint: string, method: string = "GET"): void {
    this.debug(
      "API",
      `Making ${method} request to ${endpoint}`,
      { endpoint, method },
      "api_request"
    );
  }

  apiResponse(endpoint: string, status: number, duration?: number): void {
    this.info(
      "API",
      `API response received`,
      { endpoint, status },
      "api_response",
      duration
    );
  }

  apiError(endpoint: string, error: string, status?: number): void {
    this.error("API", `API error: ${error}`, { endpoint, status }, "api_error");
  }

  // CLI-specific logging methods
  cliStart(args: string[]): void {
    this.info("CLI", "CLI tool started", { args }, "cli_start");
  }

  cliComplete(duration?: number): void {
    this.info(
      "CLI",
      "CLI tool completed successfully",
      {},
      "cli_complete",
      duration
    );
  }

  cliError(error: string, data?: any): void {
    this.error("CLI", `CLI error: ${error}`, data, "cli_error");
  }

  getLogPath(): string {
    return this.logFile;
  }
}

// Create a default logger instance
export const logger = new Logger();
