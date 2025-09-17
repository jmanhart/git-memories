#!/usr/bin/env node

import { intro, outro, spinner } from "@clack/prompts";
import { GitHubAuth } from "./auth";
import { GitHubAPI } from "./github";
import { formatContributions } from "./formatters";
import { generateMockContributions, MockScenario } from "./mock";
import { getCurrentDate, parseDateString } from "./utils/date";
import { EMOJIS, UI_STRINGS } from "./utils/constants";
import {
  initSentry,
  captureException,
  captureMessage,
  addBreadcrumb,
  setTag,
  flush,
} from "./utils/sentry";
import { logger } from "./utils/logger";

// Initialize Sentry as early as possible
initSentry();

// Send development mode event if running in development
if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
  captureMessage("CLI tool executed in development mode", "info", {
    component: "cli",
    operation: "startup",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
    args: process.argv.slice(2),
    nodeVersion: process.version,
    platform: process.platform,
  });
}

// Check for help command
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🌱 git-memories - A CLI tool to revisit your GitHub contributions on this day throughout the years

Usage:
  git-memories                    # Normal mode - authenticate and show your contributions
  git-memories --date YYYY-MM-DD  # Show contributions for a specific date
  git-memories --test             # Test mode - show mock data with random contributions
  git-memories --auth-setup       # Auth setup scenario - show mock data for a new user
  git-memories --no-entries       # No entries scenario - show mock data with no contributions
  git-memories --logout           # Logout and clear stored authentication
  git-memories --help             # Show this help message

Examples:
  git-memories --date 2017-09-15  # Show contributions for September 15th across all years
  git-memories --test             # See what the tool looks like with sample data
  git-memories --auth-setup       # See what it looks like for a new GitHub user
  git-memories --no-entries       # See what it looks like when there are no contributions
`);
  process.exit(0);
}

// Check for logout command
if (process.argv.includes("--logout")) {
  const auth = new GitHubAuth();
  auth.logout();
  process.exit(0);
}

// Check for test mode and scenarios
const isTestMode = process.argv.includes("--test");
const isAuthSetupMode = process.argv.includes("--auth-setup");
const isNoEntriesMode = process.argv.includes("--no-entries");

// Check for custom date
const dateArgIndex = process.argv.findIndex((arg) => arg === "--date");
let customDate: { year: number; month: number; day: number } | null = null;

if (dateArgIndex !== -1) {
  const dateValue = process.argv[dateArgIndex + 1];
  if (!dateValue) {
    console.error("❌ Error: --date flag requires a date in YYYY-MM-DD format");
    console.error("Example: git-memories --date 2017-09-15");
    process.exit(1);
  }

  try {
    customDate = parseDateString(dateValue);
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : "Invalid date format"
    );
    console.error("Expected format: YYYY-MM-DD (e.g., 2017-09-15)");
    process.exit(1);
  }
}

// Determine mock scenario
let mockScenario: MockScenario = "default";
if (isAuthSetupMode) {
  mockScenario = "auth-setup";
} else if (isNoEntriesMode) {
  mockScenario = "no-entries";
}

async function main() {
  const startTime = Date.now();

  // Add breadcrumb for CLI start
  addBreadcrumb("CLI started", "cli", {
    args: process.argv.slice(2),
    nodeVersion: process.version,
    platform: process.platform,
  });

  // Log CLI start
  logger.cliStart(process.argv.slice(2));

  // Console logging that will be captured by Sentry
  console.log("🚀 git-memories CLI starting...", {
    args: process.argv.slice(2),
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString(),
  });

  // Send development mode event for each execution
  if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
    const mode = isTestMode
      ? "test"
      : isAuthSetupMode
      ? "auth-setup"
      : isNoEntriesMode
      ? "no-entries"
      : "normal";
    captureMessage(`CLI execution started - Mode: ${mode}`, "info", {
      component: "cli",
      operation: "main",
      mode,
      hasCustomDate: !!customDate,
      customDate: customDate
        ? `${customDate.year}-${customDate.month}-${customDate.day}`
        : null,
      environment: process.env.NODE_ENV || "development",
    });
  }

  // Show intro
  intro(`${EMOJIS.INTRO} git-memories`);

  try {
    if (isTestMode || isAuthSetupMode || isNoEntriesMode) {
      // Test mode - use mock data
      const modeDescription = isAuthSetupMode
        ? UI_STRINGS.MODES.AUTH_SETUP
        : isNoEntriesMode
        ? UI_STRINGS.MODES.NO_ENTRIES
        : UI_STRINGS.MODES.TEST;

      const modeMessage = isAuthSetupMode
        ? UI_STRINGS.MOCK.AUTH_SETUP_MODE
        : isNoEntriesMode
        ? UI_STRINGS.MOCK.NO_ENTRIES_MODE
        : UI_STRINGS.MOCK.TEST_MODE;

      console.log(`${EMOJIS.TEST} ${modeMessage}\n`);

      // Get date (custom or today's)
      const { month, day } = customDate || getCurrentDate();

      // Generate mock contributions with the specified scenario
      const contributions = await generateMockContributions(mockScenario);

      // Format and display results
      const formatted = formatContributions(contributions, month, day);
      console.log(formatted);

      const modeSuffix = isAuthSetupMode
        ? UI_STRINGS.MODE_SUFFIXES.AUTH_SETUP
        : isNoEntriesMode
        ? UI_STRINGS.MODE_SUFFIXES.NO_ENTRIES
        : UI_STRINGS.MODE_SUFFIXES.TEST;

      outro(`${UI_STRINGS.OUTRO.SUCCESS} ${modeSuffix}`);
      return;
    }

    // Normal mode - authenticate with GitHub
    addBreadcrumb("Starting authentication", "auth");
    const auth = new GitHubAuth();
    const { token, username } = await auth.authenticate();

    // Set user context for Sentry
    setTag("username", username);
    addBreadcrumb("Authentication successful", "auth", { username });

    // Show custom date message if provided
    if (customDate) {
      const { month, day } = customDate;
      const monthName = new Date(2024, month - 1, day).toLocaleDateString(
        "en-US",
        { month: "long" }
      );
      console.log(
        `\n🔍 Searching for contributions on ${monthName} ${day} across all years...\n`
      );
    }

    // Initialize GitHub API
    const github = new GitHubAPI(token);

    try {
      // Get date (custom or today's)
      const dateToUse = customDate || getCurrentDate();
      const { year: currentYear, month, day } = dateToUse;

      // Get user's account creation date to determine how far back to look
      const user = await github.getUser(username);
      const accountCreatedYear = new Date(user.createdAt).getFullYear();

      // Fetch contributions for this day across all years
      const contributions = await github.getContributionsOnDate(
        username,
        month,
        day,
        accountCreatedYear,
        currentYear
      );

      // Format and display results
      const formatted = formatContributions(contributions, month, day);
      console.log(formatted);
    } catch (error) {
      captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "github-api",
          operation: "getContributionsOnDate",
          username,
          date: customDate || getCurrentDate(),
        }
      );

      console.error(
        `${EMOJIS.ERROR} Error:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }

    const duration = Date.now() - startTime;
    outro(UI_STRINGS.OUTRO.SUCCESS);

    // Log CLI completion
    logger.cliComplete(duration);

    // Console logging that will be captured by Sentry
    console.log("✅ git-memories CLI completed successfully", {
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    });

    // Send development mode completion event
    if (process.env.NODE_ENV === "development" || process.env.DEBUG) {
      captureMessage("CLI execution completed successfully", "info", {
        component: "cli",
        operation: "completion",
        environment: process.env.NODE_ENV || "development",
      });
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    captureException(
      error instanceof Error ? error : new Error(String(error)),
      {
        component: "main",
        operation: "main",
      }
    );

    logger.cliError(error instanceof Error ? error.message : "Unknown error", {
      duration,
      error: error instanceof Error ? error.message : String(error),
    });

    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : "Unknown error"
    );

    // Flush Sentry before exiting
    await flush();
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  captureException(new Error(`Unhandled Rejection: ${reason}`), {
    component: "process",
    operation: "unhandledRejection",
    promise: String(promise),
  });
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch(async (error) => {
  captureException(error instanceof Error ? error : new Error(String(error)), {
    component: "main",
    operation: "main-catch",
  });
  console.error("Fatal error:", error);

  // Flush Sentry before exiting
  await flush();
  process.exit(1);
});
