/**
 * GitHub CLI Authentication
 *
 * Handles authentication using the GitHub CLI if available
 */

import { exec } from "child_process";
import { promisify } from "util";
import { AuthResult } from "../types";
import { logger } from "../utils/logger";
import {
  captureException,
  captureMessage,
  addBreadcrumb,
  setTag,
  setUserContext,
  setContext,
  logInfo,
  logError,
  logWarn,
  logDebug,
  logFormatted,
  traceAuth,
} from "../utils/sentry";

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
      addBreadcrumb("Checking GitHub CLI availability", "github-cli");
      await execAsync("gh auth status");
      logger.info("GitHubCLI", "GitHub CLI is available and authenticated");
      addBreadcrumb("GitHub CLI is available and authenticated", "github-cli");
      setTag("github_cli_available", "true");
      return true;
    } catch (error) {
      logger.warn(
        "GitHubCLI",
        "GitHub CLI not available or not authenticated",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      addBreadcrumb(
        "GitHub CLI not available or not authenticated",
        "github-cli",
        {
          error: error instanceof Error ? error.message : "Unknown error",
        }
      );
      setTag("github_cli_available", "false");
      return false;
    }
  }

  /**
   * Get authentication token from GitHub CLI
   */
  async authenticate(): Promise<AuthResult> {
    return traceAuth("github_cli", async (span) => {
      const startTime = Date.now();
      const sessionId = Math.random().toString(36).substring(7);

      // Set up GitHub CLI-specific context
      setContext("github_cli_session", {
        sessionId,
        startTime: new Date().toISOString(),
        platform: process.platform,
        nodeVersion: process.version,
      });

      // Add span attributes
      span?.setAttributes({
        sessionId,
        platform: process.platform,
        nodeVersion: process.version,
      });

      logger.info("GitHubCLI", "Starting GitHub CLI authentication");
      addBreadcrumb("Starting GitHub CLI authentication", "github-cli");
      logger.authStart("github_cli", {
        timestamp: new Date().toISOString(),
        sessionId,
      });

      // Rich Sentry logging for GitHub CLI start
      logInfo("GitHub CLI authentication flow initiated", {
        sessionId,
        platform: process.platform,
        nodeVersion: process.version,
        timestamp: new Date().toISOString(),
      });

      try {
        // Get token from GitHub CLI
        logger.debug("GitHubCLI", "Getting token from GitHub CLI");
        logger.authStep("getting_token", { sessionId });

        // Rich logging for token retrieval
        logDebug("Retrieving token from GitHub CLI", {
          sessionId,
          timestamp: new Date().toISOString(),
        });

        const { stdout } = await execAsync("gh auth token");
        const token = stdout.trim();
        logger.debug("GitHubCLI", "Token retrieved", {
          hasToken: !!token,
          tokenLength: token.length,
        });
        logger.authStep("token_retrieved", {
          hasToken: !!token,
          tokenLength: token.length,
          sessionId,
        });

        // Rich logging for successful token retrieval
        logInfo("GitHub CLI token retrieved successfully", {
          sessionId,
          hasToken: !!token,
          tokenLength: token.length,
          timestamp: new Date().toISOString(),
        });

        // Get user info to verify token
        logger.debug("GitHubCLI", "Getting user info to verify token");
        logger.authStep("verifying_token", { sessionId });

        // Rich logging for user verification
        logDebug("Verifying token with GitHub API", {
          sessionId,
          timestamp: new Date().toISOString(),
        });

        const { stdout: userInfo } = await execAsync("gh api user");
        const user = JSON.parse(userInfo);
        logger.info("GitHubCLI", "User info retrieved", {
          username: user.login,
          id: user.id,
          hasLogin: !!user.login,
        });
        logger.authStep("user_verified", {
          username: user.login,
          id: user.id,
          hasLogin: !!user.login,
          sessionId,
        });

        // Rich logging for successful user verification
        logInfo("GitHub CLI user verification successful", {
          sessionId,
          username: user.login,
          userId: user.id,
          hasLogin: !!user.login,
          timestamp: new Date().toISOString(),
        });

        const result = {
          token,
          username: user.login,
        };

        const duration = Date.now() - startTime;

        // Set user context for successful GitHub CLI authentication
        setUserContext({
          id: result.username,
          username: result.username,
        });

        logger.info("GitHubCLI", "GitHub CLI authentication successful", {
          username: result.username,
          hasToken: !!result.token,
        });

        addBreadcrumb("GitHub CLI authentication successful", "github-cli", {
          username: result.username,
        });
        setTag("github_cli_success", "true");
        setTag("auth_method", "github_cli");
        setTag("auth_success", "true");

        logger.authSuccess("github_cli", result.username, duration);
        logger.authStep("github_cli_completed", {
          username: result.username,
          duration,
          hasToken: !!result.token,
          sessionId,
        });

        // Rich Sentry logging for successful GitHub CLI authentication
        logInfo("GitHub CLI authentication completed successfully", {
          sessionId,
          username: result.username,
          duration,
          hasToken: !!result.token,
          platform: process.platform,
          timestamp: new Date().toISOString(),
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;

        // Rich error logging
        logError("GitHub CLI authentication failed", {
          sessionId,
          error: error instanceof Error ? error.message : "Unknown error",
          duration,
          platform: process.platform,
          timestamp: new Date().toISOString(),
          stack: error instanceof Error ? error.stack : undefined,
        });

        logger.error("GitHubCLI", "GitHub CLI authentication failed", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        });

        captureException(
          error instanceof Error ? error : new Error(String(error)),
          {
            component: "github-cli",
            operation: "authenticate",
            sessionId,
            duration,
          }
        );
        setTag("github_cli_success", "false");
        setTag("auth_success", "false");
        setTag("auth_method", "github_cli");

        logger.authFailure(
          "github_cli",
          error instanceof Error ? error.message : "Unknown error",
          {
            duration,
            error: error instanceof Error ? error.message : String(error),
            sessionId,
          }
        );

        throw new Error(`GitHub CLI authentication failed: ${error}`);
      }
    });
  }
}
