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
import { logger } from "../utils/logger";

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

    logger.info("OAuth", "OAuth constructor initialized", {
      hasClientId: !!this.config.clientId,
      hasClientSecret: !!this.config.clientSecret,
      redirectUri: this.config.redirectUri,
    });
  }

  /**
   * Check if OAuth is properly configured
   */
  isConfigured(): boolean {
    const isConfigured = !!(this.config.clientId && this.config.clientSecret);
    logger.info("OAuth", "OAuth configuration check", {
      isConfigured,
      hasClientId: !!this.config.clientId,
      hasClientSecret: !!this.config.clientSecret,
    });
    return isConfigured;
  }

  /**
   * Start OAuth flow
   */
  async authenticate(): Promise<AuthResult> {
    logger.info("OAuth", "Starting OAuth authentication flow");

    try {
      // Generate state parameter for security
      const state = Math.random().toString(36).substring(7);
      logger.debug("OAuth", "Generated state parameter", { state });

      // Start local server to handle callback (this will set the dynamic port)
      const { app, server, port } = await this.startCallbackServer(state);
      logger.info("OAuth", "Callback server started", { port });

      // Update redirect URI with the actual port
      this.config.redirectUri = `http://localhost:${port}/callback`;
      logger.debug("OAuth", "Updated redirect URI", {
        redirectUri: this.config.redirectUri,
      });

      // Create OAuth URL with the correct port
      const authUrl = this.createAuthUrl(state);
      logger.info("OAuth", "Created OAuth URL", { authUrl });

      // Set up callback handler
      this.setupCallbackHandler(app, server, state);

      // Open browser
      logger.info("OAuth", "Opening browser for OAuth flow");
      await open(authUrl);

      // Wait for callback
      logger.info("OAuth", "Waiting for OAuth callback");
      const result = await this.waitForCallback(app, server);

      logger.info("OAuth", "OAuth authentication successful", {
        username: result.username,
        hasToken: !!result.token,
      });

      return result;
    } catch (error) {
      logger.error("OAuth", "OAuth authentication failed", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
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
    logger.info("OAuth", "Setting up callback handler", { state });

    app.get("/callback", async (req, res) => {
      const { code, state: returnedState } = req.query;

      logger.info("OAuth", "OAuth callback received", {
        hasCode: !!code,
        hasState: !!returnedState,
        expectedState: state,
        receivedState: returnedState,
        stateMatch: returnedState === state,
        queryParams: req.query,
      });

      if (returnedState !== state) {
        const error = "Invalid state parameter";
        logger.error("OAuth", error, {
          expectedState: state,
          receivedState: returnedState,
        });
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
    logger.info("OAuth", "Exchanging OAuth code for token", {
      hasCode: !!code,
      codeLength: code?.length,
      redirectUri: this.config.redirectUri,
    });

    if (!this.config.clientId || !this.config.clientSecret) {
      const error = "GitHub OAuth credentials are not configured";
      logger.error("OAuth", error, {
        hasClientId: !!this.config.clientId,
        hasClientSecret: !!this.config.clientSecret,
      });
      throw new Error(error);
    }

    const requestBody = {
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      code: code,
      redirect_uri: this.config.redirectUri,
    };

    logger.debug("OAuth", "Making token exchange request", {
      url: "https://github.com/login/oauth/access_token",
      hasClientId: !!requestBody.client_id,
      hasClientSecret: !!requestBody.client_secret,
      hasCode: !!requestBody.code,
      redirectUri: requestBody.redirect_uri,
    });

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

    logger.info("OAuth", "Token exchange response received", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    const data = (await response.json()) as any;
    logger.debug("OAuth", "Token exchange response data", {
      hasError: !!data.error,
      error: data.error,
      errorDescription: data.error_description,
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      scope: data.scope,
    });

    if (data.error) {
      const error = data.error_description || data.error;
      logger.error("OAuth", "Token exchange failed", {
        error: data.error,
        errorDescription: data.error_description,
        fullResponse: data,
      });
      throw new Error(error);
    }

    // Get user info
    logger.info("OAuth", "Fetching user information", {
      hasAccessToken: !!data.access_token,
    });

    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${data.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    logger.info("OAuth", "User info response received", {
      status: userResponse.status,
      statusText: userResponse.statusText,
      ok: userResponse.ok,
    });

    const user = (await userResponse.json()) as any;
    logger.debug("OAuth", "User info data", {
      login: user.login,
      id: user.id,
      hasLogin: !!user.login,
    });

    return {
      token: data.access_token,
      username: user.login,
    };
  }
}
