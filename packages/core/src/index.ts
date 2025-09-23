/**
 * Git Memories Core Package
 *
 * Shared business logic for both CLI and web applications
 */

// Export GitHub API
export * from "./github";

// Export types
export * from "./types";

// Export utilities
export * from "./utils/constants";
export * from "./utils/date";
export * from "./utils/validation";
export * from "./utils/logger";
export * from "./utils/sentry";

// Note: Auth and formatters are platform-specific
// - Auth: CLI uses file storage, web uses browser storage
// - Formatters: CLI uses terminal formatting, web uses HTML/React components
