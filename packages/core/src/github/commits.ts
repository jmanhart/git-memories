/**
 * Commits API
 *
 * Handles GitHub commit-related API calls
 */

import { GitHubClient } from "./client";
import { GitHubCommit, GitHubRepository } from "../types";
import { GITHUB_CONFIG } from "../utils/constants";

/**
 * Commit API handler
 */
export class CommitAPI {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * Get commits for a specific repository on a specific date
   */
  async getCommitsForRepoOnDate(
    username: string,
    repoName: string,
    startDate: Date,
    endDate: Date
  ): Promise<GitHubCommit[]> {
    const url = `/repos/${username}/${repoName}/commits?since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=${
      GITHUB_CONFIG.DEFAULT_PER_PAGE
    }`;

    const commits = await this.client.get<any[]>(url);

    return commits.map((commit: any) => ({
      message: commit.commit.message,
      url: commit.html_url,
      repository: {
        name: repoName,
        owner: {
          login: username,
        },
      },
      pushedDate: commit.commit.author.date,
    }));
  }

  /**
   * Get commits from multiple active repositories for a specific date
   */
  async getCommitsFromActiveRepos(
    username: string,
    year: number,
    month: number,
    day: number,
    activeRepos: GitHubRepository[]
  ): Promise<GitHubCommit[]> {
    const commits: GitHubCommit[] = [];
    const targetDate = new Date(year, month - 1, day);
    const nextDay = new Date(year, month - 1, day + 1);

    // Check each active repo for commits on this specific date
    for (const repo of activeRepos) {
      try {
        const repoCommits = await this.getCommitsForRepoOnDate(
          username,
          repo.name,
          targetDate,
          nextDay
        );
        commits.push(...repoCommits);

        // Small delay to avoid rate limiting
        await this.client.delay();
      } catch (error) {
        console.warn(`Failed to check commits for ${repo.name}:`, error);
      }
    }

    return commits;
  }
}
