/**
 * Logger Utility
 *
 * Provides structured logging for debugging authentication and other issues
 */

import * as fs from "fs";
import * as path from "path";
import { homedir } from "os";

export interface LogEntry {
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  component: string;
  message: string;
  data?: any;
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
    return `[${entry.timestamp}] ${entry.level} [${entry.component}] ${entry.message}${dataStr}\n`;
  }

  private writeLog(entry: LogEntry): void {
    const logLine = this.formatLogEntry(entry);

    // Write to file
    fs.appendFileSync(this.logFile, logLine);

    // Also log to console for development
    if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
      console.log(logLine.trim());
    }
  }

  info(component: string, message: string, data?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "INFO",
      component,
      message,
      data,
    });
  }

  warn(component: string, message: string, data?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "WARN",
      component,
      message,
      data,
    });
  }

  error(component: string, message: string, data?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "ERROR",
      component,
      message,
      data,
    });
  }

  debug(component: string, message: string, data?: any): void {
    this.writeLog({
      timestamp: new Date().toISOString(),
      level: "DEBUG",
      component,
      message,
      data,
    });
  }

  getLogPath(): string {
    return this.logFile;
  }
}

// Create a default logger instance
export const logger = new Logger();
