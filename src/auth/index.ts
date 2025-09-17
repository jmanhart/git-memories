/**
 * Authentication Module
 *
 * Main authentication interface that orchestrates different auth methods
 */

import { intro, outro, spinner, confirm, isCancel } from "@clack/prompts";
import { AuthResult, StoredToken } from "../types";
import { TokenStorage } from "./storage";
import { OAuthAuth } from "./oauth";
import { GitHubCLIAuth } from "./github-cli";
import { ManualTokenAuth } from "./manual-token";
import { AUTH_CONFIG } from "../utils/constants";
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
} from "../utils/sentry";
import { logger } from "../utils/logger";

/**
 * Main authentication manager
 *
 * Handles multiple authentication strategies in order of preference:
 * 1. OAuth (if configured)
 * 2. GitHub CLI (if available)
 * 3. Manual token creation (fallback)
 */
export class GitHubAuth {
  private storage: TokenStorage;
  private oauth: OAuthAuth;
  private githubCLI: GitHubCLIAuth;
  private manualToken: ManualTokenAuth;

  constructor() {
    this.storage = new TokenStorage();
    this.oauth = new OAuthAuth();
    this.githubCLI = new GitHubCLIAuth();
    this.manualToken = new ManualTokenAuth();
  }

  /**
   * Main authentication method
   *
   * Tries different authentication strategies in order of preference
   */
  async authenticate(): Promise<AuthResult> {
    const startTime = Date.now();
    const sessionId = Math.random().toString(36).substring(7);

    // Set up rich context for this authentication session
    setContext("auth_session", {
      sessionId,
      startTime: new Date().toISOString(),
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: startTime,
    });

    addBreadcrumb("Starting authentication flow", "auth");
    logger.authStart("authentication_flow", {
      sessionId,
      timestamp: new Date().toISOString(),
    });

    // Rich Sentry logging for authentication start
    logInfo("Authentication flow initiated", {
      sessionId,
      platform: process.platform,
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    });

    // Check if we already have a valid token
    logDebug("Checking for existing stored token", { sessionId });
    const existingToken = await this.storage.getStoredToken();
    if (existingToken && !this.storage.isTokenExpired(existingToken)) {
      const duration = Date.now() - startTime;
      const isExpired = this.storage.isTokenExpired(existingToken);

      // Set user context for Sentry
      setUserContext({
        id: existingToken.username,
        username: existingToken.username,
      });

      addBreadcrumb("Using existing valid token", "auth", {
        username: existingToken.username,
      });
      setTag("auth_method", "stored_token");
      setTag("auth_success", "true");
      setTag("token_source", "stored");

      logger.authSuccess("stored_token", existingToken.username, duration);
      logger.authStep("token_validation", {
        username: existingToken.username,
        expiresAt: existingToken.expiresAt,
        isExpired: isExpired,
        sessionId,
      });

      // Rich Sentry logging for successful stored token authentication
      logInfo("Stored token authentication successful", {
        sessionId,
        username: existingToken.username,
        duration,
        tokenExpiry: new Date(existingToken.expiresAt).toISOString(),
        timeUntilExpiry: existingToken.expiresAt - Date.now(),
        platform: process.platform,
      });

      // Sentry native logging
      logFormatted(
        "info",
        "Authentication successful using stored token for user: ${username} (${duration}ms)",
        existingToken.username,
        duration
      );

      return {
        token: existingToken.accessToken,
        username: existingToken.username,
      };
    }

    // Log token status for debugging
    logDebug("Token validation results", {
      sessionId,
      hasToken: !!existingToken,
      isExpired: existingToken
        ? this.storage.isTokenExpired(existingToken)
        : false,
      tokenExpiry: existingToken
        ? new Date(existingToken.expiresAt).toISOString()
        : null,
    });

    logger.authStep("no_valid_token", {
      hasToken: !!existingToken,
      isExpired: existingToken
        ? this.storage.isTokenExpired(existingToken)
        : false,
      sessionId,
    });

    // Start authentication flow
    intro("🔐 GitHub Authentication");

    const shouldAuth = await confirm({
      message: "Link your GitHub account to get started?",
      initialValue: true,
    });

    if (isCancel(shouldAuth) || !shouldAuth) {
      const duration = Date.now() - startTime;

      // Rich logging for user cancellation
      logWarn("User cancelled authentication", {
        sessionId,
        userChoice: shouldAuth,
        duration,
        platform: process.platform,
        timestamp: new Date().toISOString(),
      });

      captureMessage("User cancelled authentication", "info", {
        component: "auth",
        sessionId,
        duration,
      });

      setTag("auth_cancelled", "true");
      setTag("auth_success", "false");

      logger.authFailure("user_cancelled", "User declined authentication", {
        userChoice: shouldAuth,
        timestamp: new Date().toISOString(),
        sessionId,
        duration,
      });
      outro("Authentication cancelled. Goodbye! 👋");
      process.exit(0);
    }

    // Rich logging for user confirmation
    logInfo("User confirmed authentication", {
      sessionId,
      userChoice: shouldAuth,
      platform: process.platform,
    });

    logger.authStep("user_confirmed", { userChoice: shouldAuth, sessionId });

    return await this.startAuthFlow();
  }

  /**
   * Start the authentication flow
   */
  private async startAuthFlow(): Promise<AuthResult> {
    const startTime = Date.now();
    const s = spinner();
    s.start("Setting up authentication...");
    logger.authStep("auth_flow_started", {
      timestamp: new Date().toISOString(),
    });

    try {
      // Try OAuth first (if configured)
      if (this.oauth.isConfigured()) {
        addBreadcrumb("Attempting OAuth authentication", "auth");
        setTag("auth_method", "oauth");
        logger.authStart("oauth", { isConfigured: true });
        s.stop("Opening GitHub in your browser...");

        const oauthStartTime = Date.now();
        const result = await this.oauth.authenticate();
        const oauthDuration = Date.now() - oauthStartTime;

        // Store token
        await this.storage.storeToken({
          accessToken: result.token,
          username: result.username,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        addBreadcrumb("OAuth authentication successful", "auth", {
          username: result.username,
        });
        logger.authSuccess("oauth", result.username, oauthDuration);
        logger.authStep("token_stored", {
          username: result.username,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000,
        });

        // Sentry native logging
        logFormatted(
          "info",
          "OAuth authentication successful for user: ${username} (${duration}ms)",
          result.username,
          oauthDuration
        );

        s.stop("Authentication successful! ✅");
        return result;
      }

      // Fall back to GitHub CLI
      addBreadcrumb("OAuth not configured, falling back to GitHub CLI", "auth");
      logger.authStep("oauth_fallback", { reason: "not_configured" });
      s.stop("OAuth not configured");
      console.log(
        "\n⚠️  OAuth App not configured. Using GitHub CLI authentication.\n"
      );
      return await this.startManualAuthFlow();
    } catch (error) {
      s.stop("Authentication failed");
      const duration = Date.now() - startTime;
      captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "auth",
          operation: "startAuthFlow",
        }
      );
      logger.authFailure(
        "auth_flow",
        error instanceof Error ? error.message : "Unknown error",
        {
          duration,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.log(
        "\n💡 Please install GitHub CLI and run 'gh auth login' to authenticate.\n"
      );
      throw error;
    }
  }

  /**
   * Start manual authentication flow
   */
  private async startManualAuthFlow(): Promise<AuthResult> {
    // Check if GitHub CLI is available
    const hasGitHubCLI = await this.githubCLI.isAvailable();

    if (hasGitHubCLI) {
      return await this.useGitHubCLI();
    }

    // No manual token creation - guide user to GitHub CLI
    throw new Error(
      "GitHub CLI not found. Please install GitHub CLI and run 'gh auth login' to authenticate.\n\n" +
        "Install GitHub CLI: https://cli.github.com/\n" +
        "Then run: gh auth login"
    );
  }

  /**
   * Use GitHub CLI for authentication
   */
  private async useGitHubCLI(): Promise<AuthResult> {
    const startTime = Date.now();
    addBreadcrumb("Using GitHub CLI authentication", "auth");
    setTag("auth_method", "github_cli");
    logger.authStart("github_cli", { timestamp: new Date().toISOString() });

    const s = spinner();
    s.start("Using GitHub CLI authentication...");

    try {
      const result = await this.githubCLI.authenticate();
      const duration = Date.now() - startTime;

      s.stop("GitHub CLI authentication successful! ✅");

      // Store token
      await this.storage.storeToken({
        accessToken: result.token,
        username: result.username,
        expiresAt:
          Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      });

      addBreadcrumb("GitHub CLI authentication successful", "auth", {
        username: result.username,
      });
      logger.authSuccess("github_cli", result.username, duration);
      logger.authStep("token_stored", {
        username: result.username,
        expiresAt:
          Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      });

      // Sentry native logging
      logFormatted(
        "info",
        "GitHub CLI authentication successful for user: ${username} (${duration}ms)",
        result.username,
        duration
      );

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      s.stop("GitHub CLI authentication failed");
      captureException(
        error instanceof Error ? error : new Error(String(error)),
        {
          component: "auth",
          operation: "useGitHubCLI",
        }
      );
      logger.authFailure(
        "github_cli",
        error instanceof Error ? error.message : "Unknown error",
        {
          duration,
          error: error instanceof Error ? error.message : String(error),
        }
      );
      throw new Error(
        "GitHub CLI authentication failed. Please ensure you're logged in with 'gh auth login'.\n\n" +
          "If you continue to have issues, please check your GitHub CLI installation."
      );
    }
  }

  /**
   * Create manual token
   */
  private async createManualToken(): Promise<AuthResult> {
    const result = await this.manualToken.authenticate();

    // Store token
    await this.storage.storeToken({
      accessToken: result.token,
      username: result.username,
      expiresAt:
        Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    });

    return result;
  }

  /**
   * Logout (remove stored token)
   */
  async logout(): Promise<void> {
    await this.storage.logout();
  }
}
