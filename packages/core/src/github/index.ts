/**
 * GitHub API Module
 *
 * Main GitHub API interface that provides access to all GitHub-related functionality
 */

import { GitHubClient } from "./client";
import { UserAPI } from "./user";
import { ContributionsAPI } from "./contributions";
import { GitHubUser, Contribution } from "../types";

/**
 * Main GitHub API class
 *
 * Provides a unified interface for all GitHub API operations
 */
export class GitHubAPI {
  private client: GitHubClient;
  private userAPI: UserAPI;
  private contributionsAPI: ContributionsAPI;

  constructor(token: string) {
    this.client = new GitHubClient(token);
    this.userAPI = new UserAPI(this.client);
    this.contributionsAPI = new ContributionsAPI(this.client);
  }

  /**
   * Get user information
   *
   * @param username - Username to fetch, or empty string for authenticated user
   */
  async getUser(username: string): Promise<GitHubUser> {
    return this.userAPI.getUser(username);
  }

  /**
   * Get contributions for a specific date across multiple years
   *
   * @param username - GitHub username
   * @param month - Month (1-12)
   * @param day - Day of month
   * @param startYear - Starting year to search from
   * @param endYear - Ending year to search to
   */
  async getContributionsOnDate(
    username: string,
    month: number,
    day: number,
    startYear: number,
    endYear: number
  ): Promise<Contribution[]> {
    return this.contributionsAPI.getContributionsOnDate(
      username,
      month,
      day,
      startYear,
      endYear
    );
  }
}
