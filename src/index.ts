#!/usr/bin/env node

import { intro, outro, spinner } from "@clack/prompts";
import { GitHubAuth } from "./auth";
import { GitHubAPI } from "./github";
import { formatContributions } from "./formatters";
import { generateMockContributions } from "./mock";
import { getCurrentDate } from "./utils/date";
import { EMOJIS } from "./utils/constants";

// Check for logout command
if (process.argv.includes("--logout")) {
  const auth = new GitHubAuth();
  auth.logout();
  process.exit(0);
}

// Check for test mode
const isTestMode = process.argv.includes("--test");

async function main() {
  // Show intro
  intro(`${EMOJIS.INTRO} git-memories`);

  try {
    if (isTestMode) {
      // Test mode - use mock data
      console.log(`${EMOJIS.TEST} Running in test mode with mock data...\n`);

      const s = spinner();
      s.start("Generating mock contributions...");

      // Get today's date
      const { month, day } = getCurrentDate();

      // Generate mock contributions
      const contributions = generateMockContributions();

      s.stop("Mock contributions generated!");

      // Format and display results
      const formatted = formatContributions(contributions, month, day);
      console.log(formatted);

      outro("Thanks for the memories! 🎉 (Test Mode)");
      return;
    }

    // Normal mode - authenticate with GitHub
    const auth = new GitHubAuth();
    const { token, username } = await auth.authenticate();

    // Initialize GitHub API
    const github = new GitHubAPI(token);

    // Show loading spinner
    const s = spinner();
    s.start("Fetching your contributions...");

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

      s.stop("Contributions fetched!");

      // Format and display results
      const formatted = formatContributions(contributions, month, day);
      console.log(formatted);
    } catch (error) {
      s.stop("Failed to fetch contributions");
      console.error(
        `${EMOJIS.ERROR} Error:`,
        error instanceof Error ? error.message : "Unknown error"
      );
      process.exit(1);
    }

    outro("Thanks for the memories! 🎉");
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
