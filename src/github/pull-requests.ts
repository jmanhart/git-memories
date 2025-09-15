/**
 * Pull Requests API
 *
 * Handles GitHub pull request-related API calls
 */

import { GitHubClient } from "./client";
import { GitHubPullRequest, GitHubRepository } from "../types";
import { GITHUB_CONFIG } from "../utils/constants";

/**
 * Pull Request API handler
 */
export class PullRequestAPI {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * Get pull requests for a specific repository on a specific date
   */
  async getPullRequestsForRepoOnDate(
    username: string,
    repoName: string,
    startDate: Date,
    endDate: Date
  ): Promise<GitHubPullRequest[]> {
    const url = `/repos/${username}/${repoName}/pulls?state=all&since=${startDate.toISOString()}&per_page=${
      GITHUB_CONFIG.DEFAULT_PER_PAGE
    }`;

    const prs = await this.client.get<any[]>(url);

    return prs
      .filter((pr: any) => {
        const prDate = new Date(pr.created_at);
        return prDate >= startDate && prDate < endDate;
      })
      .map((pr: any) => ({
        title: pr.title,
        url: pr.html_url,
        repository: {
          name: repoName,
          owner: {
            login: username,
          },
        },
        createdAt: pr.created_at,
        state: pr.state.toUpperCase() as "OPEN" | "CLOSED" | "MERGED",
      }));
  }

  /**
   * Get pull requests from multiple active repositories for a specific date
   */
  async getPullRequestsFromActiveRepos(
    username: string,
    year: number,
    month: number,
    day: number,
    activeRepos: GitHubRepository[]
  ): Promise<GitHubPullRequest[]> {
    const pullRequests: GitHubPullRequest[] = [];
    const targetDate = new Date(year, month - 1, day);
    const nextDay = new Date(year, month - 1, day + 1);

    // Check each active repo for pull requests on this specific date
    for (const repo of activeRepos) {
      try {
        const repoPRs = await this.getPullRequestsForRepoOnDate(
          username,
          repo.name,
          targetDate,
          nextDay
        );
        pullRequests.push(...repoPRs);

        // Small delay to avoid rate limiting
        await this.client.delay();
      } catch (error) {
        console.warn(`Failed to check pull requests for ${repo.name}:`, error);
      }
    }

    return pullRequests;
  }
}
