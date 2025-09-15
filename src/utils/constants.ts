/**
 * Application Constants
 *
 * Centralized constants used throughout the application
 */

export const APP_CONFIG = {
  NAME: "git-memories",
  VERSION: "1.0.0",
  DESCRIPTION:
    "A CLI tool to revisit your GitHub contributions on this day throughout the years",
} as const;

export const GITHUB_CONFIG = {
  API_BASE_URL: "https://api.github.com",
  OAUTH_BASE_URL: "https://github.com/login/oauth",
  GRAPHQL_ENDPOINT: "https://api.github.com/graphql",
  DEFAULT_PER_PAGE: 100,
  MAX_REPOS_PER_YEAR: 10,
  API_DELAY_MS: 50,
} as const;

export const AUTH_CONFIG = {
  TOKEN_DIR: ".git-memories",
  TOKEN_FILE: "token.json",
  TOKEN_EXPIRY_DAYS: 30,
  OAUTH_TIMEOUT_MS: 300000, // 5 minutes
  CALLBACK_PORT: 3000,
} as const;

export const EMOJIS = {
  INTRO: "🌱",
  AUTH: "🔐",
  TEST: "🧪",
  SUCCESS: "✅",
  ERROR: "❌",
  INFO: "ℹ️",
  COMMIT: "💚",
  PR_MERGED: "✅",
  PR_CLOSED: "❌",
  PR_OPEN: "🔄",
  REPO: "📁",
  YEAR: "📅",
  SPINNER: "⏳",
} as const;
