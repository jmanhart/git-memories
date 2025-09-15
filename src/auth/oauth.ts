/**
 * OAuth Authentication
 *
 * Handles GitHub OAuth flow for seamless browser-based authentication
 */

import express from "express";
import open from "open";
import { config } from "dotenv";
import { AuthResult, OAuthConfig } from "../types";
import { AUTH_CONFIG } from "../utils/constants";

// Load environment variables
config();

/**
 * OAuth authentication handler
 */
export class OAuthAuth {
  private config: OAuthConfig;

  constructor() {
    this.config = {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      redirectUri: `http://localhost:${AUTH_CONFIG.CALLBACK_PORT}/callback`, // Will be updated dynamically
    };
  }

  /**
   * Check if OAuth is properly configured
   */
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }

  /**
   * Start OAuth flow
   */
  async authenticate(): Promise<AuthResult> {
    // Generate state parameter for security
    const state = Math.random().toString(36).substring(7);

    // Start local server to handle callback (this will set the dynamic port)
    const { app, server, port } = await this.startCallbackServer(state);

    // Update redirect URI with the actual port
    this.config.redirectUri = `http://localhost:${port}/callback`;

    // Create OAuth URL with the correct port
    const authUrl = this.createAuthUrl(state);

    // Set up callback handler
    this.setupCallbackHandler(app, server, state);

    // Open browser
    await open(authUrl);

    // Wait for callback
    const result = await this.waitForCallback(app, server);

    return result;
  }

  /**
   * Create GitHub OAuth authorization URL
   */
  private createAuthUrl(state: string): string {
    if (!this.config.clientId) {
      throw new Error("GitHub OAuth client ID is not configured");
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: "repo",
      state: state,
    });

    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  /**
   * Start local server for OAuth callback
   */
  private async startCallbackServer(
    state: string
  ): Promise<{ app: express.Application; server: any; port: number }> {
    const app = express();

    return new Promise((resolve, reject) => {
      const server = app.listen(0, () => {
        // 0 = let OS choose available port
        const address = server.address();
        if (address && typeof address === "object") {
          const port = address.port;
          console.log(`🌐 OAuth callback server running on port ${port}`);
          resolve({ app, server, port });
        } else {
          reject(new Error("Failed to get server port"));
        }
      });

      server.on("error", (error) => {
        reject(new Error(`Failed to start callback server: ${error.message}`));
      });
    });
  }

  /**
   * Set up OAuth callback handler
   */
  private setupCallbackHandler(
    app: express.Application,
    server: any,
    state: string
  ): void {
    app.get("/callback", async (req, res) => {
      const { code, state: returnedState } = req.query;

      if (returnedState !== state) {
        res.status(400).send("Invalid state parameter");
        (app as any).authReject?.(new Error("Invalid state parameter"));
        return;
      }

      try {
        // Exchange code for token
        const result = await this.exchangeCodeForToken(code as string);

        res.send(`
          <html>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>✅ Authentication Successful!</h1>
              <p>You can close this window and return to the terminal.</p>
              <script>
                setTimeout(() => window.close(), 3000);
              </script>
            </body>
          </html>
        `);

        // Clear timeout and resolve the promise
        clearTimeout((app as any).authTimeout);
        (app as any).authResolve?.(result);

        // Close the server
        server.close();
      } catch (error) {
        res
          .status(500)
          .send("Authentication failed: " + (error as Error).message);
        (app as any).authReject?.(error);
        server.close();
      }
    });
  }

  /**
   * Wait for OAuth callback
   */
  private async waitForCallback(
    app: express.Application,
    server: any
  ): Promise<AuthResult> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        server.close();
        reject(new Error("Authentication timeout"));
      }, AUTH_CONFIG.OAUTH_TIMEOUT_MS);

      // Store the resolve/reject functions so the callback can use them
      (app as any).authResolve = resolve;
      (app as any).authReject = reject;
      (app as any).authTimeout = timeout;
    });
  }

  /**
   * Exchange OAuth code for access token
   */
  private async exchangeCodeForToken(code: string): Promise<AuthResult> {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("GitHub OAuth credentials are not configured");
    }

    const requestBody = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: code,
      redirect_uri: this.config.redirectUri,
    };

    const response = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const data = (await response.json()) as any;

    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    // Get user info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const user = (await userResponse.json()) as any;

    return {
      token: data.access_token,
      username: user.login,
    };
  }
}
