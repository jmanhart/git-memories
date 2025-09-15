/**
 * Mock Data Generator
 *
 * Generates realistic mock data for testing the CLI without GitHub API calls
 */

import { Contribution, GitHubCommit, GitHubPullRequest } from "../types";
import { getCurrentDate } from "../utils/date";
import { COMMIT_MESSAGES, PR_TITLES, REPO_NAMES, PR_STATES } from "./data";

/**
 * Generate mock contributions for testing
 *
 * Creates realistic mock data spanning multiple years with random contributions
 */
export function generateMockContributions(): Contribution[] {
  const { year: currentYear, month, day } = getCurrentDate();
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
