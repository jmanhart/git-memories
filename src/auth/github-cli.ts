/**
 * GitHub CLI Authentication
 *
 * Handles authentication using the GitHub CLI if available
 */

import { exec } from "child_process";
import { promisify } from "util";
import { AuthResult } from "../types";

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
      await execAsync("gh auth status");
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get authentication token from GitHub CLI
   */
  async authenticate(): Promise<AuthResult> {
    try {
      // Get token from GitHub CLI
      const { stdout } = await execAsync("gh auth token");
      const token = stdout.trim();

      // Get user info to verify token
      const { stdout: userInfo } = await execAsync("gh api user");
      const user = JSON.parse(userInfo);

      return {
        token,
        username: user.login,
      };
    } catch (error) {
      throw new Error(`GitHub CLI authentication failed: ${error}`);
    }
  }
}
