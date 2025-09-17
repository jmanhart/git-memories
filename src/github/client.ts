/**
 * GitHub API Client
 *
 * HTTP client for making requests to the GitHub API
 */

import { GITHUB_CONFIG } from "../utils/constants";
import { captureException, addBreadcrumb, setTag } from "../utils/sentry";

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

    addBreadcrumb("Making GitHub API GET request", "github-api", {
      endpoint,
      url,
    });

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!response.ok) {
        const error = new Error(
          `GitHub API error: ${response.status} ${response.statusText}`
        );
        captureException(error, {
          component: "github-api",
          operation: "get",
          endpoint,
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }

      addBreadcrumb("GitHub API GET request successful", "github-api", {
        endpoint,
        status: response.status,
      });

      return response.json() as T;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("GitHub API error")
      ) {
        throw error; // Re-throw API errors as-is
      }

      captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "github-api",
          operation: "get",
          endpoint,
        }
      );
      throw error;
    }
  }

  /**
   * Make a GraphQL request to the GitHub API
   */
  async graphql<T>(
    query: string,
    variables: Record<string, any> = {}
  ): Promise<T> {
    addBreadcrumb("Making GitHub GraphQL request", "github-api", {
      query: query.substring(0, 100) + "...", // Truncate query for breadcrumb
      variables,
    });

    try {
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
        const error = new Error(
          `GitHub GraphQL error: ${response.status} ${response.statusText}`
        );
        captureException(error, {
          component: "github-api",
          operation: "graphql",
          status: response.status,
          statusText: response.statusText,
        });
        throw error;
      }

      const result = (await response.json()) as any;

      if (result.errors) {
        const error = new Error(
          `GraphQL errors: ${result.errors
            .map((e: any) => e.message)
            .join(", ")}`
        );
        captureException(error, {
          component: "github-api",
          operation: "graphql",
          errors: result.errors,
        });
        throw error;
      }

      addBreadcrumb("GitHub GraphQL request successful", "github-api");
      return result.data;
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("GitHub GraphQL error") ||
          error.message.includes("GraphQL errors"))
      ) {
        throw error; // Re-throw GraphQL errors as-is
      }

      captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "github-api",
          operation: "graphql",
        }
      );
      throw error;
    }
  }

  /**
   * Add a small delay to avoid rate limiting
   */
  async delay(ms: number = GITHUB_CONFIG.API_DELAY_MS): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
