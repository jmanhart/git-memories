/**
 * Token Storage
 *
 * Handles secure storage and retrieval of authentication tokens
 */

import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import { StoredToken } from "../types";

/**
 * Manages token storage in the user's home directory
 */
export class TokenStorage {
  private tokenPath: string;

  constructor() {
    // Store token in user's home directory
    this.tokenPath = path.join(os.homedir(), ".git-memories", "token.json");
  }

  /**
   * Retrieve stored token from disk
   */
  async getStoredToken(): Promise<StoredToken | null> {
    try {
      if (fs.existsSync(this.tokenPath)) {
        const data = fs.readFileSync(this.tokenPath, "utf8");
        return JSON.parse(data);
      }
    } catch (error) {
      // Ignore errors, return null
      console.warn("Failed to read stored token:", error);
    }
    return null;
  }

  /**
   * Store token to disk
   */
  async storeToken(token: StoredToken): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.tokenPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(this.tokenPath, JSON.stringify(token, null, 2));
    } catch (error) {
      console.warn("Failed to store token:", error);
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: StoredToken): boolean {
    if (!token.expiresAt) return false;
    return Date.now() > token.expiresAt;
  }

  /**
   * Remove stored token (logout)
   */
  async logout(): Promise<void> {
    try {
      if (fs.existsSync(this.tokenPath)) {
        fs.unlinkSync(this.tokenPath);
        console.log("✅ Logged out successfully");
      } else {
        console.log("ℹ️  No stored authentication found");
      }
    } catch (error) {
      console.warn("Failed to remove stored token:", error);
    }
  }
}
