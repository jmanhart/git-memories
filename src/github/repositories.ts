/**
 * Repositories API
 *
 * Handles GitHub repository-related API calls
 */

import { GitHubClient } from "./client";
import { GitHubRepository } from "../types";
import { GITHUB_CONFIG } from "../utils/constants";

/**
 * Repository API handler
 */
export class RepositoryAPI {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * Get user's repositories with metadata
   *
   * This is a lightweight call that gets basic repo info including dates
   */
  async getUserRepositories(username: string): Promise<GitHubRepository[]> {
    const repos = await this.client.get<any[]>(
      `/users/${username}/repos?per_page=${GITHUB_CONFIG.DEFAULT_PER_PAGE}&sort=updated`
    );

    // Add computed date ranges for each repo
    return repos.map((repo) => ({
      name: repo.name,
      owner: {
        login: repo.owner.login,
      },
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      pushed_at: repo.pushed_at,
      createdYear: new Date(repo.created_at).getFullYear(),
      updatedYear: new Date(repo.updated_at).getFullYear(),
      pushedYear: new Date(repo.pushed_at).getFullYear(),
    }));
  }

  /**
   * Find repositories that were active on a specific date across years
   *
   * This helps us identify which repos to check for contributions
   */
  findActiveReposOnDate(
    repos: GitHubRepository[],
    month: number,
    day: number,
    startYear: number,
    endYear: number
  ): Record<number, GitHubRepository[]> {
    const activeReposByYear: Record<number, GitHubRepository[]> = {};

    // For each year, find repos that were active around this date
    for (let year = startYear; year <= endYear; year++) {
      const activeRepos = repos.filter((repo) => {
        // Check if repo was created before or during this year
        const wasCreatedBefore = repo.createdYear <= year;

        // Check if repo was updated during or after this year
        const wasUpdatedAfter = repo.updatedYear >= year;

        // Check if repo was pushed to during or after this year
        const wasPushedAfter = repo.pushedYear >= year;

        // Repo was potentially active if it existed and had recent activity
        return wasCreatedBefore && (wasUpdatedAfter || wasPushedAfter);
      });

      if (activeRepos.length > 0) {
        // Limit to most active repos per year to avoid too many API calls
        activeReposByYear[year] = activeRepos.slice(
          0,
          GITHUB_CONFIG.MAX_REPOS_PER_YEAR
        );
      }
    }

    return activeReposByYear;
  }
}
