/**
 * GitHub CLI Authentication
 *
 * Handles authentication using the GitHub CLI if available
 */

import { exec } from "child_process";
import { promisify } from "util";
import { AuthResult } from "../types";
import { logger } from "../utils/logger";

const execAsync = promisify(exec);

/**
 * GitHub CLI authentication handler
 */
export class GitHubCLIAuth {
  /**
   * Check if GitHub CLI is available and authenticated
   */
  async isAvailable(): Promise<boolean> {
    try {
      logger.info(
        "GitHubCLI",
        "Checking if GitHub CLI is available and authenticated"
      );
      await execAsync("gh auth status");
      logger.info("GitHubCLI", "GitHub CLI is available and authenticated");
      return true;
    } catch (error) {
      logger.warn(
        "GitHubCLI",
        "GitHub CLI not available or not authenticated",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      return false;
    }
  }

  /**
   * Get authentication token from GitHub CLI
   */
  async authenticate(): Promise<AuthResult> {
    logger.info("GitHubCLI", "Starting GitHub CLI authentication");

    try {
      // Get token from GitHub CLI
      logger.debug("GitHubCLI", "Getting token from GitHub CLI");
      const { stdout } = await execAsync("gh auth token");
      const token = stdout.trim();
      logger.debug("GitHubCLI", "Token retrieved", {
        hasToken: !!token,
        tokenLength: token.length,
      });

      // Get user info to verify token
      logger.debug("GitHubCLI", "Getting user info to verify token");
      const { stdout: userInfo } = await execAsync("gh api user");
      const user = JSON.parse(userInfo);
      logger.info("GitHubCLI", "User info retrieved", {
        username: user.login,
        id: user.id,
        hasLogin: !!user.login,
      });

      const result = {
        token,
        username: user.login,
      };

      logger.info("GitHubCLI", "GitHub CLI authentication successful", {
        username: result.username,
        hasToken: !!result.token,
      });

      return result;
    } catch (error) {
      logger.error("GitHubCLI", "GitHub CLI authentication failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw new Error(`GitHub CLI authentication failed: ${error}`);
    }
  }
}
