import React, { useState, useRef, useEffect } from "react";

/**
 * Mini Terminal Component Props
 */
export interface MiniTerminalProps {
  /** Callback when a command is executed */
  onCommand?: (command: string, args: string[]) => void;
  /** Whether the terminal is processing */
  isProcessing?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Whether to show help text */
  showHelp?: boolean;
}

/**
 * Mini Terminal Component
 *
 * A clean, focused terminal interface for command input.
 * Handles URL parsing and command execution without results display.
 */
export const MiniTerminal: React.FC<MiniTerminalProps> = ({
  onCommand,
  isProcessing = false,
  placeholder = "Enter GitHub URL or username",
  showHelp = true,
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Input value state
   */
  const [input, setInput] = useState("");

  /**
   * Command history state
   */
  const [history, setHistory] = useState<string[]>([]);

  // ===== REFS =====

  /**
   * Input reference for focus management
   */
  const inputRef = useRef<HTMLInputElement>(null);

  // ===== EFFECTS =====

  /**
   * Auto-focus input on mount
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // ===== EVENT HANDLERS =====

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const command = input.trim();

    // Add to history
    setHistory((prev) => [...prev, command]);

    // Extract username from URL if needed
    const username = extractUsernameFromUrl(command);
    const finalCommand = username || command;

    // Execute command
    if (onCommand) {
      onCommand("memories", [finalCommand]);
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
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Terminal Window */}
      <div className="bg-gray-900 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        {/* Terminal Content */}
        <div className="p-4 font-mono text-sm">
          {/* Command History */}
          {history.length > 0 && (
            <div className="mb-4 space-y-1">
              {history.slice(-3).map((cmd, index) => (
                <div key={index} className="text-gray-400">
                  <span className="text-green-400">$</span> {cmd}
                </div>
              ))}
            </div>
          )}

          {/* Input Section */}
          <div className="mb-4">
            <form
              onSubmit={handleSubmit}
              className="flex items-center space-x-2"
            >
              <span className="text-green-400">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isProcessing}
                className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 border-none outline-none focus:ring-0"
              />
            </form>
          </div>

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="mb-2">
              <div className="w-full bg-gray-700 rounded-full h-1">
                <div className="bg-blue-500 h-1 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
