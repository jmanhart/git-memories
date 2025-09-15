#!/usr/bin/env node

import { intro, outro, spinner, text, isCancel } from "@clack/prompts";
import { config } from "dotenv";
import { GitHubAPI } from "./github-api";
import { formatContributions } from "./formatter";

// Load environment variables
config();

async function main() {
  // Show intro
  intro("🌱 git-memories");

  // Check for GitHub token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.log(
      "❌ No GitHub token found. Please set GITHUB_TOKEN in your .env file"
    );
    console.log("   Get a token from: https://github.com/settings/tokens");
    process.exit(1);
  }

  // Get username
  const username = await text({
    message: "What's your GitHub username?",
    placeholder: "octocat",
    validate: (value) => {
      if (!value || value.trim().length === 0) {
        return "Username is required";
      }
      return;
    },
  });

  if (isCancel(username)) {
    outro("Goodbye! 👋");
    process.exit(0);
  }

  // Initialize GitHub API
  const github = new GitHubAPI(token);

  // Show loading spinner
  const s = spinner();
  s.start("Fetching your contributions...");

  try {
    // Get today's date
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth() + 1; // 0-indexed
    const day = today.getDate();

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
      "❌ Error:",
      error instanceof Error ? error.message : "Unknown error"
    );
    process.exit(1);
  }

  outro("Thanks for the memories! 🎉");
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
