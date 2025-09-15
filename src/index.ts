#!/usr/bin/env node

import { intro, outro, spinner } from "@clack/prompts";
import { GitHubAuth } from "./auth";
import { GitHubAPI } from "./github";
import { formatContributions } from "./formatters";
import { generateMockContributions, MockScenario } from "./mock";
import { getCurrentDate } from "./utils/date";
import { EMOJIS, UI_STRINGS } from "./utils/constants";

// Check for help command
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🌱 git-memories - A CLI tool to revisit your GitHub contributions on this day throughout the years

Usage:
  git-memories                    # Normal mode - authenticate and show your contributions
  git-memories --test             # Test mode - show mock data with random contributions
  git-memories --auth-setup       # Auth setup scenario - show mock data for a new user
  git-memories --no-entries       # No entries scenario - show mock data with no contributions
  git-memories --logout           # Logout and clear stored authentication
  git-memories --help             # Show this help message

Examples:
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

// Determine mock scenario
let mockScenario: MockScenario = "default";
if (isAuthSetupMode) {
  mockScenario = "auth-setup";
} else if (isNoEntriesMode) {
  mockScenario = "no-entries";
}

async function main() {
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

      // Get today's date
      const { month, day } = getCurrentDate();

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
    const auth = new GitHubAuth();
    const { token, username } = await auth.authenticate();

    // Initialize GitHub API
    const github = new GitHubAPI(token);

    try {
      // Get today's date
      const { year: currentYear, month, day } = getCurrentDate();

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
      console.error(
        `${EMOJIS.ERROR} Error:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }

    outro(UI_STRINGS.OUTRO.SUCCESS);
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
