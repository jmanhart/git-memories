/**
 * Validation Utilities
 *
 * Helper functions for input validation and sanitization
 */

/**
 * Validate GitHub token format
 */
export function validateGitHubToken(token: string): string | undefined {
  if (!token || token.trim().length === 0) {
    return "Token is required";
  }

  if (!token.startsWith("ghp_") && !token.startsWith("github_pat_")) {
    return 'Token should start with "ghp_" or "github_pat_"';
  }

  return undefined; // Valid
}

/**
 * Validate username format
 */
export function validateUsername(username: string): string | undefined {
  if (!username || username.trim().length === 0) {
    return "Username is required";
  }

  // GitHub usernames can only contain alphanumeric characters and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(username)) {
    return "Username can only contain letters, numbers, and hyphens";
  }

  return undefined; // Valid
}

/**
 * Sanitize input string
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, "");
}

/**
 * Validate OAuth state parameter
 */
export function validateOAuthState(
  state: string,
  expectedState: string
): boolean {
  return state === expectedState;
}
