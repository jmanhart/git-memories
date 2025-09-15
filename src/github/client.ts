/**
 * GitHub API Client
 *
 * HTTP client for making requests to the GitHub API
 */

import { GITHUB_CONFIG } from "../utils/constants";

/**
 * HTTP client for GitHub API requests
 */
export class GitHubClient {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  /**
   * Make a GET request to the GitHub API
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${GITHUB_CONFIG.API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return response.json() as T;
  }

  /**
   * Make a GraphQL request to the GitHub API
   */
  async graphql<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    const response = await fetch(GITHUB_CONFIG.GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub GraphQL error: ${response.status} ${response.statusText}`
      );
    }

    const result = (await response.json()) as any;

    if (result.errors) {
      throw new Error(
        `GraphQL errors: ${result.errors.map((e: any) => e.message).join(", ")}`
      );
    }

    return result.data;
  }

  /**
   * Add a small delay to avoid rate limiting
   */
  async delay(ms: number = GITHUB_CONFIG.API_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
