import React, { useState } from "react";
import { MiniTerminal } from "./MiniTerminal";
import { Results } from "./Results";

/**
 * GitHub Lookup Container Component
 * 
 * Manages state and coordinates between MiniTerminal and Results components.
 * This allows for clean separation of concerns.
 */
export const GitHubLookup: React.FC = () => {
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
   * Handle command execution from MiniTerminal
   */
  const handleCommand = async (command: string, args: string[]) => {
    if (command !== "memories" || !args[0]) return;

    setIsProcessing(true);
    setError("");
    setResults("");
    setUsername(args[0]);

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
            args: args,
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
      {/* Mini Terminal */}
      <MiniTerminal
        onCommand={handleCommand}
        isProcessing={isProcessing}
        placeholder="Enter GitHub URL or username"
        showHelp={true}
      />

      {/* Results */}
      <Results
        results={results}
        isProcessing={isProcessing}
        error={error}
        username={username}
        title="GitHub Memories"
        showHeader={true}
      />
    </div>
  );
};
