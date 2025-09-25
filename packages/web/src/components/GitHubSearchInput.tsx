import React, { useState } from "react";

/**
 * GitHub Search Input Component Props
 */
export interface GitHubSearchInputProps {
  /** Callback when a search is executed */
  onSearch?: (username: string) => void;
  /** Whether the search is processing */
  isProcessing?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Custom button text */
  buttonText?: string;
}

/**
 * GitHub Search Input Component
 *
 * A clean, standard input component for GitHub username/URL input.
 * Uses standard Tailwind styling for a modern web feel.
 */
export const GitHubSearchInput: React.FC<GitHubSearchInputProps> = ({
  onSearch,
  isProcessing = false,
  placeholder = "Enter GitHub username or URL",
  buttonText = "Search",
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Input value state
   */
  const [input, setInput] = useState("");

  // ===== EVENT HANDLERS =====

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const username = extractUsernameFromUrl(input.trim());
    const finalUsername = username || input.trim();

    // Execute search
    if (onSearch) {
      onSearch(finalUsername);
    }

    // Clear input
    setInput("");
  };

  /**
   * Handle Enter key press
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  // ===== URL PROCESSING =====

  /**
   * Extract username from GitHub URL
   */
  const extractUsernameFromUrl = (url: string): string | null => {
    // Handle various GitHub URL formats:
    // https://github.com/username
    // https://github.com/username/
    // https://github.com/username?tab=repositories
    // github.com/username
    const patterns = [
      /github\.com\/([^\/\?\#]+)/,
      /^([^\/\?\#]+)$/, // Direct username
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  };

  // ===== RENDER =====

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isProcessing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isProcessing || !input.trim()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {buttonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
