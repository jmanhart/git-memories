import React, { useState, useRef, useEffect } from "react";
import {
  TerminalWindow,
  TerminalContent,
  TerminalLines,
  TerminalInput,
  type TerminalLineData,
  type TerminalTheme,
  type TerminalSize,
} from "./terminal/index";

/**
 * Terminal Configuration Interface
 * Defines the configuration options for the Terminal component
 */
export interface TerminalConfig {
  /** Visual theme for the terminal */
  theme?: TerminalTheme;

  /** Size variant for the terminal */
  size?: TerminalSize;

  /** Whether to show line numbers */
  showLineNumbers?: boolean;

  /** Whether to show timestamps */
  showTimestamps?: boolean;

  /** Custom height for the terminal content */
  customHeight?: string;

  /** Whether to enable animations */
  enableAnimations?: boolean;
}

/**
 * Interactive Terminal Component
 *
 * This component creates a fully functional terminal interface using modular components:
 * - TerminalWindow: Provides outer container with theming
 * - TerminalContent: Handles scrollable content area
 * - TerminalLines: Renders all terminal lines
 * - TerminalInput: Manages current input field
 *
 * Features:
 * - Displays a welcome message when first loaded
 * - Accepts user input via keyboard
 * - Sends commands to the backend API
 * - Displays real GitHub data responses
 * - Handles errors gracefully
 * - Auto-scrolls and focuses for smooth UX
 * - Modular, customizable styling
 * - Theme and size variants
 *
 * @example
 * ```jsx
 * // Basic usage
 * <Terminal />
 *
 * // With custom configuration
 * <Terminal
 *   theme="retro"
 *   size="xl"
 *   showLineNumbers={true}
 *   enableAnimations={true}
 * />
 * ```
 */
export const Terminal: React.FC<TerminalConfig> = ({
  theme = "dark",
  size = "lg",
  showLineNumbers = false,
  showTimestamps = false,
  customHeight,
  enableAnimations = false,
}) => {
  // ===== STATE MANAGEMENT =====

  /**
   * Terminal Lines State
   * Stores all the lines that appear in the terminal
   * Each line has an ID, content, and type (input/output/error)
   */
  const [lines, setLines] = useState<TerminalLineData[]>([]);

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
   * Terminal Content Reference
   * Used to control scrolling behavior
   */
  const terminalContentRef = useRef<HTMLDivElement>(null);

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
    if (terminalContentRef.current) {
      terminalContentRef.current.scrollTop =
        terminalContentRef.current.scrollHeight; // Scroll to bottom
    }
  }, [lines]); // Run when lines change

  // ===== EVENT HANDLERS =====

  /**
   * Handle Enter Key Press
   * Executes the current command when Enter is pressed
   */
  const handleEnter = async () => {
    if (!isProcessing && currentInput.trim()) {
      await executeCommand(currentInput.trim());
    }
  };

  /**
   * Handle Terminal Content Click
   * Focuses the input field when terminal is clicked
   */
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
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
    const commandLine: TerminalLineData = {
      id: lines.length + 1, // Generate unique ID
      content: command, // The actual command text
      type: "input", // Mark as user input
      prompt: "$ ", // Show terminal prompt
    };

    const newLines = [...lines, commandLine]; // Keep existing lines and add new command

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

      const responseLine: TerminalLineData = {
        id: newLines.length + 1,
        content: result.output,
        type: result.type || "output",
      };

      setLines((prev) => [...prev, responseLine]);
    } catch {
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

      const fallbackLine: TerminalLineData = {
        id: newLines.length + 1,
        content: output,
        type: outputType,
      };

      setLines((prev) => [...prev, fallbackLine]);
    }

    setIsProcessing(false);
  };

  // ===== RENDER =====

  return (
    <TerminalWindow theme={theme} size={size}>
      <TerminalContent
        ref={terminalContentRef}
        customHeight={customHeight}
        onClick={handleTerminalClick}
      >
        <TerminalLines
          lines={lines}
          showLineNumbers={showLineNumbers}
          showTimestamps={showTimestamps}
          enableAnimations={enableAnimations}
        />

        <TerminalInput
          ref={inputRef}
          value={currentInput}
          onChange={setCurrentInput}
          onEnter={handleEnter}
          disabled={isProcessing}
          isProcessing={isProcessing}
          placeholder={isProcessing ? "Processing..." : ""}
          showCursor={!isProcessing}
        />
      </TerminalContent>
    </TerminalWindow>
  );
};
