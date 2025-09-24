import React, { useState, useRef, useEffect } from "react";

/**
 * Terminal Line Interface
 * Defines the structure of each line in the terminal output
 */
interface TerminalLine {
  id: number; // Unique identifier for each line
  content: string; // The actual text content
  type: "input" | "output" | "error"; // Type of line (user input, response, or error)
  prompt?: string; // Optional prompt symbol (like $ or >)
}

/**
 * Interactive Terminal Component
 *
 * This component creates a fully functional terminal interface that:
 * - Displays a welcome message when first loaded
 * - Accepts user input via keyboard
 * - Sends commands to the backend API
 * - Displays real GitHub data responses
 * - Handles errors gracefully
 * - Auto-scrolls and focuses for smooth UX
 */
export const Terminal: React.FC = () => {
  // ===== STATE MANAGEMENT =====

  /**
   * Terminal Lines State
   * Stores all the lines that appear in the terminal
   * Each line has an ID, content, and type (input/output/error)
   */
  const [lines, setLines] = useState<TerminalLine[]>([
    {
      id: 1,
      content: "Welcome to Fart Palace", // Welcome message
      type: "output",
    },
    {
      id: 2,
      content: "🚀 Real GitHub API Integration Active", // Status indicator
      type: "output",
    },
    {
      id: 3,
      content: "Try: user octocat, memories octocat, help", // Example commands
      type: "output",
    },
  ]);

  /**
   * Current Input State
   * Tracks what the user is currently typing
   */
  const [currentInput, setCurrentInput] = useState("");

  /**
   * Processing State
   * Shows when a command is being executed (prevents multiple submissions)
   */
  const [isProcessing, setIsProcessing] = useState(false);

  // ===== REFS FOR DOM MANIPULATION =====

  /**
   * Input Reference
   * Used to focus the input field and control cursor position
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Terminal Reference
   * Used to control scrolling behavior
   */
  const terminalRef = useRef<HTMLDivElement>(null);

  // ===== EFFECTS =====

  /**
   * Auto-focus and Auto-scroll Effect
   * Runs whenever the lines array changes (new commands/responses)
   * - Focuses the input field so user can keep typing
   * - Scrolls to bottom to show latest content
   */
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus(); // Focus the input field
    }
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight; // Scroll to bottom
    }
  }, [lines]); // Run when lines change

  // ===== EVENT HANDLERS =====

  /**
   * Keyboard Event Handler
   * Handles Enter key press to execute commands
   * Prevents submission if already processing a command
   */
  const handleKeyPress = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isProcessing) {
      // Only execute if Enter pressed and not processing
      e.preventDefault(); // Prevent form submission
      await executeCommand(currentInput.trim()); // Execute the command
    }
  };

  // ===== COMMAND EXECUTION =====

  /**
   * Execute Command Function
   * This is the main function that handles all terminal commands
   *
   * Flow:
   * 1. Add user's command to terminal display
   * 2. Clear input field and show processing state
   * 3. Parse command and arguments
   * 4. Send to backend API for real GitHub data
   * 5. Display response or fallback to local commands
   */
  const executeCommand = async (command: string) => {
    if (!command) return; // Ignore empty commands

    // ===== STEP 1: ADD COMMAND TO TERMINAL DISPLAY =====
    // Add the user's command to the terminal history
    const newLines = [
      ...lines, // Keep existing lines
      {
        id: lines.length + 1, // Generate unique ID
        content: command, // The actual command text
        type: "input" as const, // Mark as user input
        prompt: "$ ", // Show terminal prompt
      },
    ];

    setLines(newLines); // Update terminal display
    setCurrentInput(""); // Clear input field
    setIsProcessing(true); // Show processing state

    try {
      // Parse command and args
      const [cmd, ...args] = command.trim().split(" ");

      // Call the backend API
      const response = await fetch(
        "http://localhost:3001/api/terminal/command",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            command: cmd.toLowerCase(),
            args: args,
          }),
        }
      );

      const result = await response.json();

      setLines((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: result.output,
          type: result.type || "output",
        },
      ]);
    } catch (error) {
      // Fallback to local commands if backend is not available
      console.log("Backend not available, using fallback commands");

      let output = "";
      let outputType: "output" | "error" = "output";

      switch (command.toLowerCase()) {
        case "help":
          output = `Available commands:
  help          - Show this help message
  install       - Show installation instructions
  version       - Show version information
  clear         - Clear the terminal
  github        - Open GitHub repository`;
          break;

        case "install":
          output = `Installation instructions:
  1. npm install git-memories
  2. git-memories --help
  3. git-memories auth
  4. git-memories memories`;
          break;

        case "version":
          output = `git-memories v1.0.6
Built with TypeScript and Node.js`;
          break;

        case "clear":
          setLines([]);
          setIsProcessing(false);
          return;

        case "github":
          output = "Opening GitHub repository...";
          window.open("https://github.com/yourusername/git-memories", "_blank");
          break;

        case "npm install git-memories":
          output = `Installing git-memories...
✓ Package installed successfully!
✓ Run 'git-memories --help' to get started`;
          break;

        default:
          output = `Command not found: "${command}"
          
Available commands:
  help          - Show help message
  install       - Show installation instructions  
  version       - Show version information
  clear         - Clear the terminal
  github        - Open GitHub repository

Type 'help' for more information.`;
          outputType = "error";
      }

      setLines((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          content: output,
          type: outputType,
        },
      ]);
    }

    setIsProcessing(false);
  };

  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            </div>
            <div className="text-gray-400 text-xs font-mono ml-4">
              Git Memories Terminal
            </div>
          </div>
          <div className="text-gray-400 text-xs font-mono">
            Interactive Mode
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={terminalRef}
          className="p-4 font-mono text-sm h-96 overflow-y-auto bg-gray-900 cursor-text"
          onClick={handleTerminalClick}
        >
          {lines.map((line) => (
            <div key={line.id} className="mb-1">
              {line.type === "input" && (
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">{line.prompt}</span>
                  <span className="text-gray-300">{line.content}</span>
                </div>
              )}
              {line.type === "output" && (
                <div className="text-gray-300 whitespace-pre-line text-left ml-0 pl-0">
                  {line.content}
                </div>
              )}
              {line.type === "error" && (
                <div className="text-red-400 whitespace-pre-line text-left ml-0 pl-0">
                  {line.content}
                </div>
              )}
            </div>
          ))}

          {/* Current Input Line */}
          <div className="flex items-center mt-2">
            <span className="text-green-400 mr-2">$ </span>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-transparent text-gray-300 outline-none font-mono"
              placeholder={isProcessing ? "Processing..." : ""}
              disabled={isProcessing}
              autoComplete="off"
              spellCheck="false"
            />
            {isProcessing && (
              <span className="text-yellow-400 ml-2 animate-pulse">▊</span>
            )}
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-gray-800 px-4 py-2 border-t border-gray-700">
          <div className="text-gray-400 text-xs font-mono">
            Type 'help' for available commands • Press Enter to execute
          </div>
        </div>
      </div>
    </div>
  );
};
