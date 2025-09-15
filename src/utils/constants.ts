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

/**
 * Centralized UI Strings
 *
 * All user-facing text strings used throughout the application.
 * This makes it easy to maintain consistent messaging and update text in one place.
 */
export const UI_STRINGS = {
  // Spinner messages
  FETCHING: {
    START: "Fetching your contributions...",
    YEAR_PROGRESS: (year: number) => `Fetching your contributions... (${year})`,
    SUCCESS: "Contributions fetched!",
    FAILED: "Failed to fetch contributions",
  },

  // Authentication messages
  AUTH: {
    INTRO: "🔐 GitHub Authentication",
    LINK_ACCOUNT: "Link your GitHub account to get started?",
    CANCELLED: "Authentication cancelled. Goodbye! 👋",
    SETTING_UP: "Setting up authentication...",
    OPENING_BROWSER: "Opening GitHub in your browser...",
    SUCCESS: "Authentication successful! ✅",
    FAILED: "Authentication failed",
    OAUTH_NOT_CONFIGURED: "OAuth not configured",
    OAUTH_FALLBACK:
      "⚠️  OAuth App not configured. Falling back to manual token setup.\n",
    FALLBACK_MANUAL: "💡 Falling back to manual token setup...\n",
    GITHUB_CLI_START: "Using GitHub CLI authentication...",
    GITHUB_CLI_SUCCESS: "GitHub CLI authentication successful! ✅",
    GITHUB_CLI_FAILED: "GitHub CLI authentication failed",
    FALLBACK_TOKEN: "Falling back to manual token setup...\n",
  },

  // Mock data messages
  MOCK: {
    TEST_MODE: "Running in test mode with mock data...",
    AUTH_SETUP_MODE: "Running in auth setup scenario with mock data...",
    NO_ENTRIES_MODE: "Running in no entries scenario with mock data...",
    GENERATING: "Generating mock contributions...",
    GENERATED: "Mock contributions generated!",
  },

  // Mode descriptions
  MODES: {
    TEST: "test mode",
    AUTH_SETUP: "auth setup scenario",
    NO_ENTRIES: "no entries scenario",
  },

  // Mode suffixes for outro
  MODE_SUFFIXES: {
    TEST: "(Test Mode)",
    AUTH_SETUP: "(Auth Setup Scenario)",
    NO_ENTRIES: "(No Entries Scenario)",
  },

  // Error messages
  ERRORS: {
    GENERIC: "Unknown error",
    FETCH_FAILED: "Failed to fetch contributions",
  },

  // Outro messages
  OUTRO: {
    SUCCESS: "Thanks for the memories! 🎉",
  },

  // Example: Easy to add new strings
  // NEW_FEATURE: {
  //   WELCOME: "Welcome to the new feature!",
  //   LOADING: "Loading new feature...",
  //   SUCCESS: "New feature loaded successfully!",
  // },
} as const;
