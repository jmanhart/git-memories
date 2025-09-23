/**
 * User API
 *
 * Handles GitHub user-related API calls
 */

import { GitHubClient } from "./client";
import { GitHubUser } from "../types";

/**
 * User API handler
 */
export class UserAPI {
  private client: GitHubClient;

  constructor(client: GitHubClient) {
    this.client = client;
  }

  /**
   * Get user information
   *
   * @param username - Username to fetch, or empty string for authenticated user
   */
  async getUser(username: string): Promise<GitHubUser> {
    if (username === "") {
      // Get the authenticated user
      const user = await this.client.get<any>("/user");
      return {
        login: user.login,
        name: user.name,
        createdAt: user.created_at,
      };
    } else {
      // Get a specific user
      const query = `
        query GetUser($username: String!) {
          user(login: $username) {
            login
            name
            createdAt
          }
        }
      `;

      const response = await this.client.graphql<any>(query, { username });
      return response.user;
    }
  }

  /**
   * Get user's account creation year
   */
  async getAccountCreationYear(username: string): Promise<number> {
    const user = await this.getUser(username);
    return new Date(user.createdAt).getFullYear();
  }
}
