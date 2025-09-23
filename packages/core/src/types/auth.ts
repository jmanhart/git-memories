/**
 * Authentication Types
 *
 * Type definitions for authentication flows and token management
 */

export interface StoredToken {
  accessToken: string;
  username: string;
  expiresAt?: number;
}

export interface AuthResult {
  token: string;
  username: string;
}

export interface OAuthConfig {
  clientId: string | undefined;
  clientSecret: string | undefined;
  redirectUri: string;
}

export interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}
