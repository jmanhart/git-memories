/**
 * Mock Data Generator
 *
 * Generates realistic mock data for testing the CLI without GitHub API calls
 */

import { Contribution, GitHubCommit, GitHubPullRequest } from "../types";
import { getCurrentDate } from "../utils/date";
import { COMMIT_MESSAGES, PR_TITLES, REPO_NAMES, PR_STATES } from "./data";
import { spinner } from "@clack/prompts";

/**
 * Mock scenario types
 */
export type MockScenario = "default" | "auth-setup" | "no-entries";

/**
 * Generate mock contributions for testing
 *
 * Creates realistic mock data spanning multiple years with random contributions
 * Includes delays to simulate real fetching process
 */
export async function generateMockContributions(
  scenario: MockScenario = "default"
): Promise<Contribution[]> {
  const { year: currentYear, month, day } = getCurrentDate();

  switch (scenario) {
    case "auth-setup":
      return await generateAuthSetupMockData(currentYear, month, day);
    case "no-entries":
      return await generateNoEntriesMockData();
    case "default":
    default:
      return await generateDefaultMockData(currentYear, month, day);
  }
}

/**
 * Generate default mock data with random contributions
 * Includes realistic delays to simulate fetching process
 */
async function generateDefaultMockData(
  currentYear: number,
  month: number,
  day: number
): Promise<Contribution[]> {
  const contributions: Contribution[] = [];
  const s = spinner();

  s.start("Fetching your contributions...");

  // Generate mock data from 2016 to current year (more realistic range)
  const startYear = 2016;
  const years = [];
  for (let year = currentYear; year >= startYear; year--) {
    years.push(year);
  }

  for (let i = 0; i < years.length; i++) {
    const year = years[i];

    // Update spinner to show current year being processed
    s.message(`Fetching your contributions... (${year})`);

    // Simulate realistic delay (faster for recent years, slower for older years)
    const delay =
      year >= currentYear - 2 ? 800 : year >= currentYear - 5 ? 1200 : 1500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Randomly decide if this year has contributions (70% chance for recent years, 30% for older)
    const hasContributions =
      year >= currentYear - 3 ? Math.random() > 0.3 : Math.random() > 0.7;

    if (hasContributions) {
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

  s.stop("Contributions fetched!");
  return contributions;
}

/**
 * Generate mock data for auth setup scenario
 * Shows a user who just created their account and has their first contributions
 */
async function generateAuthSetupMockData(
  currentYear: number,
  month: number,
  day: number
): Promise<Contribution[]> {
  const contributions: Contribution[] = [];
  const s = spinner();

  s.start("Fetching your contributions...");

  // Simulate checking a few years back (even for new users)
  const years = [currentYear, currentYear - 1, currentYear - 2];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];

    // Update spinner to show current year being processed
    s.message(`Fetching your contributions... (${year})`);

    // Simulate delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Only show contributions for the current year (new user)
    if (year === currentYear) {
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
    }
  }

  s.stop("Contributions fetched!");
  return contributions;
}

/**
 * Generate mock data for no entries scenario
 * Returns empty array to simulate a day with no contributions
 */
async function generateNoEntriesMockData(): Promise<Contribution[]> {
  const s = spinner();
  s.start("Fetching your contributions...");

  // Simulate checking a few years
  const years = [2025, 2024, 2023, 2022, 2021];

  for (let i = 0; i < years.length; i++) {
    const year = years[i];
    s.message(`Fetching your contributions... (${year})`);
    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  s.stop("Contributions fetched!");
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
