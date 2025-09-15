/**
 * Authentication Module
 *
 * Main authentication interface that orchestrates different auth methods
 */

import { intro, outro, spinner, confirm, isCancel } from "@clack/prompts";
import { AuthResult, StoredToken } from "../types/index.js";
import { TokenStorage } from "./storage.js";
import { OAuthAuth } from "./oauth.js";
import { GitHubCLIAuth } from "./github-cli.js";
import { ManualTokenAuth } from "./manual-token.js";
import { AUTH_CONFIG } from "../utils/constants.js";

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
    // Check if we already have a valid token
    const existingToken = await this.storage.getStoredToken();
    if (existingToken && !this.storage.isTokenExpired(existingToken)) {
      return {
        token: existingToken.accessToken,
        username: existingToken.username,
      };
    }

    // Start authentication flow
    intro("🔐 GitHub Authentication");

    const shouldAuth = await confirm({
      message: "Link your GitHub account to get started?",
      initialValue: true,
    });

    if (isCancel(shouldAuth) || !shouldAuth) {
      outro("Authentication cancelled. Goodbye! 👋");
      process.exit(0);
    }

    return await this.startAuthFlow();
  }

  /**
   * Start the authentication flow
   */
  private async startAuthFlow(): Promise<AuthResult> {
    const s = spinner();
    s.start("Setting up authentication...");

    try {
      // Try OAuth first (if configured)
      if (this.oauth.isConfigured()) {
        s.stop("Opening GitHub in your browser...");
        const result = await this.oauth.authenticate();

        // Store token
        await this.storage.storeToken({
          accessToken: result.token,
          username: result.username,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        s.stop("Authentication successful! ✅");
        return result;
      }

      // Fall back to other methods
      s.stop("OAuth not configured");
      console.log(
        "\n⚠️  OAuth App not configured. Falling back to manual token setup.\n"
      );
      return await this.startManualAuthFlow();
    } catch (error) {
      s.stop("Authentication failed");
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.log("\n💡 Falling back to manual token setup...\n");
      return await this.startManualAuthFlow();
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

    // Fallback to manual token creation
    return await this.createManualToken();
  }

  /**
   * Use GitHub CLI for authentication
   */
  private async useGitHubCLI(): Promise<AuthResult> {
    const s = spinner();
    s.start("Using GitHub CLI authentication...");

    try {
      const result = await this.githubCLI.authenticate();

      s.stop("GitHub CLI authentication successful! ✅");

      // Store token
      await this.storage.storeToken({
        accessToken: result.token,
        username: result.username,
        expiresAt:
          Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
      });

      return result;
    } catch (error) {
      s.stop("GitHub CLI authentication failed");
      console.log("Falling back to manual token setup...\n");
      return await this.createManualToken();
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
