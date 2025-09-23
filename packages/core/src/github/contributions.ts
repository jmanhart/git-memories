/**
 * Contributions Processing
 *
 * Handles the orchestration of fetching and processing GitHub contributions
 */

import { GitHubClient } from "./client";
import { UserAPI } from "./user";
import { RepositoryAPI } from "./repositories";
import { CommitAPI } from "./commits";
import { PullRequestAPI } from "./pull-requests";
import { Contribution } from "../types";
// Note: spinner and UI_STRINGS are CLI-specific, removed for core package

/**
 * Contributions API handler
 *
 * Orchestrates the multi-API strategy for efficiently fetching historical contributions
 */
export class ContributionsAPI {
  private client: GitHubClient;
  private userAPI: UserAPI;
  private repositoryAPI: RepositoryAPI;
  private commitAPI: CommitAPI;
  private pullRequestAPI: PullRequestAPI;

  constructor(client: GitHubClient) {
    this.client = client;
    this.userAPI = new UserAPI(client);
    this.repositoryAPI = new RepositoryAPI(client);
    this.commitAPI = new CommitAPI(client);
    this.pullRequestAPI = new PullRequestAPI(client);
  }

  /**
   * Get contributions for a specific date across multiple years
   *
   * Uses a multi-API strategy:
   * 1. Get user's repositories with metadata (lightweight)
   * 2. Filter repos by year to find active ones
   * 3. Make targeted API calls for commits/PRs on specific dates
   */
  async getContributionsOnDate(
    username: string,
    month: number,
    day: number,
    startYear: number,
    endYear: number
  ): Promise<Contribution[]> {
    const contributions: Contribution[] = [];

    try {
      // Strategy 1: Get user's repositories with creation/update dates (lightweight)
      const repos = await this.repositoryAPI.getUserRepositories(username);

      // Strategy 2: Check which repos were active on this date across years
      const activeReposByYear = this.repositoryAPI.findActiveReposOnDate(
        repos,
        month,
        day,
        startYear,
        endYear
      );

      // Strategy 3: For each year with active repos, get commit details efficiently
      const years = Object.keys(activeReposByYear).sort(
        (a, b) => parseInt(b) - parseInt(a)
      ); // Sort newest first

      for (let i = 0; i < years.length; i++) {
        const year = years[i];
        // @ts-ignore - year is a string key from Object.keys()
        const activeRepos = activeReposByYear[year];

        if (activeRepos.length > 0) {
          // Update spinner to show current year being processed
          // Processing year ${year}

          try {
            const yearContributions =
              await this.getContributionsFromActiveRepos(
                username,
                parseInt(year),
                month,
                day,
                activeRepos
              );

            if (
              yearContributions.commits.length > 0 ||
              yearContributions.pullRequests.length > 0
            ) {
              contributions.push(yearContributions);
            }
          } catch (error) {
            console.warn(`Failed to get contributions for ${year}:`, error);
          }
        }
      }

      return contributions;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get contributions from active repositories for a specific year and date
   */
  private async getContributionsFromActiveRepos(
    username: string,
    year: number,
    month: number,
    day: number,
    activeRepos: any[]
  ): Promise<Contribution> {
    // Get commits and pull requests in parallel for efficiency
    const [commits, pullRequests] = await Promise.all([
      this.commitAPI.getCommitsFromActiveRepos(
        username,
        year,
        month,
        day,
        activeRepos
      ),
      this.pullRequestAPI.getPullRequestsFromActiveRepos(
        username,
        year,
        month,
        day,
        activeRepos
      ),
    ]);

    return {
      year,
      commits,
      pullRequests,
    };
  }
}
