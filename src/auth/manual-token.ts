/**
 * Manual Token Authentication
 *
 * Handles authentication using manually created GitHub Personal Access Tokens
 */

import { text, isCancel, outro } from "@clack/prompts";
import { AuthResult } from "../types";
import { validateGitHubToken } from "../utils/validation";

/**
 * Manual token authentication handler
 */
export class ManualTokenAuth {
  /**
   * Guide user through manual token creation and collection
   */
  async authenticate(): Promise<AuthResult> {
    console.log("🔗 Quick Setup - Create a GitHub token:");
    console.log("   1. Click here: https://github.com/settings/tokens/new");
    console.log("   2. Name: 'git-memories CLI'");
    console.log("   3. Expiration: 30 days (or your preference)");
    console.log(
      "   4. Scopes: Check 'repo' (for private repos) or 'public_repo' (public only)"
    );
    console.log("   5. Click 'Generate token'");
    console.log("   6. Copy the token and paste it below\n");

    const token = await text({
      message: "Paste your GitHub token:",
      placeholder: "ghp_xxxxxxxxxxxxxxxxxxxx",
      validate: validateGitHubToken,
    });

    if (isCancel(token)) {
      outro("Authentication cancelled. Goodbye! 👋");
      process.exit(0);
    }

    return {
      token: token as string,
      username: "", // Will be determined by API call
    };
  }
}
