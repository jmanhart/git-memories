import React, { useState } from "react";
import { GitHubSearchInput } from "./GitHubSearchInput";
import { Results } from "./Results";

/**
 * GitHub Search Container Component
 *
 * Manages state and coordinates between GitHubSearchInput and Results components.
 * Uses standard web input instead of terminal interface.
 */
export const GitHubSearch: React.FC = () => {
  // ===== STATE MANAGEMENT =====

  /**
   * Processing state
   */
  const [isProcessing, setIsProcessing] = useState(false);

  /**
   * Results state
   */
  const [results, setResults] = useState<string>("");

  /**
   * Error state
   */
  const [error, setError] = useState<string>("");

  /**
   * Username state for display
   */
  const [username, setUsername] = useState<string>("");

  // ===== EVENT HANDLERS =====

  /**
   * Handle search execution from GitHubSearchInput
   */
  const handleSearch = async (searchUsername: string) => {
    setIsProcessing(true);
    setError("");
    setResults("");
    setUsername(searchUsername);

    try {
      // Call the backend API
      const response = await fetch(
        "http://localhost:3001/api/terminal/command",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: "memories",
            args: [searchUsername],
          }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setResults(result.output);
      } else {
        setError(result.output || "Failed to fetch contributions");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  // ===== RENDER =====

  return (
    <div className="space-y-8">
      {/* GitHub Search Input */}
      <GitHubSearchInput
        onSearch={handleSearch}
        isProcessing={isProcessing}
        placeholder="Enter GitHub username or URL"
        buttonText="Search Contributions"
      />

      {/* Results */}
      <Results
        results={results}
        isProcessing={isProcessing}
        error={error}
        username={username}
      />
    </div>
  );
};
