/**
 * Mock Data Generator
 *
 * Generates realistic mock data for testing the CLI without GitHub API calls
 */

import { Contribution, GitHubCommit, GitHubPullRequest } from "../types";
import { getCurrentDate } from "../utils/date";
import { COMMIT_MESSAGES, PR_TITLES, REPO_NAMES, PR_STATES } from "./data";

/**
 * Mock scenario types
 */
export type MockScenario = "default" | "auth-setup" | "no-entries";

/**
 * Generate mock contributions for testing
 *
 * Creates realistic mock data spanning multiple years with random contributions
 */
export function generateMockContributions(
  scenario: MockScenario = "default"
): Contribution[] {
  const { year: currentYear, month, day } = getCurrentDate();

  switch (scenario) {
    case "auth-setup":
      return generateAuthSetupMockData(currentYear, month, day);
    case "no-entries":
      return generateNoEntriesMockData();
    case "default":
    default:
      return generateDefaultMockData(currentYear, month, day);
  }
}

/**
 * Generate default mock data with random contributions
 */
function generateDefaultMockData(
  currentYear: number,
  month: number,
  day: number
): Contribution[] {
  const contributions: Contribution[] = [];

  // Generate mock data for the last 3 years
  for (let year = currentYear - 2; year <= currentYear; year++) {
    // Randomly decide if this year has contributions (70% chance)
    if (Math.random() > 0.3) {
      const commits: GitHubCommit[] = [];
      const pullRequests: GitHubPullRequest[] = [];

      // Generate 1-3 commits
      const numCommits = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < numCommits; i++) {
        commits.push(generateMockCommit(year, month, day, i + 1));
      }

      // Generate 0-2 pull requests
      const numPRs = Math.floor(Math.random() * 3);
      for (let i = 0; i < numPRs; i++) {
        pullRequests.push(generateMockPullRequest(year, month, day, i + 1));
      }

      contributions.push({
        year,
        commits,
        pullRequests,
      });
    }
  }

  return contributions;
}

/**
 * Generate mock data for auth setup scenario
 * Shows a user who just created their account and has their first contributions
 */
function generateAuthSetupMockData(
  currentYear: number,
  month: number,
  day: number
): Contribution[] {
  const contributions: Contribution[] = [];

  // Only show contributions for the current year (new user)
  const commits: GitHubCommit[] = [];
  const pullRequests: GitHubPullRequest[] = [];

  // Generate first-time user contributions
  commits.push({
    message: "Initial commit",
    url: `https://github.com/newuser/hello-world/commit/abc123`,
    repository: {
      name: "hello-world",
      owner: {
        login: "newuser",
      },
    },
    pushedDate: new Date(currentYear, month - 1, day).toISOString(),
  });

  commits.push({
    message: "Add README.md",
    url: `https://github.com/newuser/hello-world/commit/def456`,
    repository: {
      name: "hello-world",
      owner: {
        login: "newuser",
      },
    },
    pushedDate: new Date(currentYear, month - 1, day).toISOString(),
  });

  pullRequests.push({
    title: "Add initial project structure",
    url: `https://github.com/newuser/hello-world/pull/1`,
    repository: {
      name: "hello-world",
      owner: {
        login: "newuser",
      },
    },
    createdAt: new Date(currentYear, month - 1, day).toISOString(),
    state: "MERGED",
  });

  contributions.push({
    year: currentYear,
    commits,
    pullRequests,
  });

  return contributions;
}

/**
 * Generate mock data for no entries scenario
 * Returns empty array to simulate a day with no contributions
 */
function generateNoEntriesMockData(): Contribution[] {
  return [];
}

/**
 * Generate a mock commit
 */
function generateMockCommit(
  year: number,
  month: number,
  day: number,
  repoIndex: number
): GitHubCommit {
  const message = getRandomItem(COMMIT_MESSAGES);
  const repoName = `test-repo-${repoIndex}`;

  return {
    message,
    url: `https://github.com/testuser/${repoName}/commit/abc123`,
    repository: {
      name: repoName,
      owner: {
        login: "testuser",
      },
    },
    pushedDate: new Date(year, month - 1, day).toISOString(),
  };
}

/**
 * Generate a mock pull request
 */
function generateMockPullRequest(
  year: number,
  month: number,
  day: number,
  repoIndex: number
): GitHubPullRequest {
  const title = getRandomItem(PR_TITLES);
  const state = getRandomItem(PR_STATES) as "OPEN" | "CLOSED" | "MERGED";
  const repoName = `test-repo-${repoIndex}`;

  return {
    title,
    url: `https://github.com/testuser/${repoName}/pull/${repoIndex}`,
    repository: {
      name: repoName,
      owner: {
        login: "testuser",
      },
    },
    createdAt: new Date(year, month - 1, day).toISOString(),
    state,
  };
}

/**
 * Get a random item from an array
 */
function getRandomItem<T>(array: readonly T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get mock user data
 */
export function getMockUser() {
  return {
    login: "testuser",
    name: "Test User",
    createdAt: "2020-01-01T00:00:00Z",
  };
}
