import React from "react";

/**
 * Output Line Props Interface
 * Configuration options for the OutputLine component
 */
export interface OutputLineProps {
  /** The output content to display */
  content: string;

  /** Additional CSS classes to apply */
  className?: string;

  /** Custom styling for the line */
  customStyle?: React.CSSProperties;

  /** Whether to preserve whitespace and line breaks */
  preserveWhitespace?: boolean;

  /** Custom text color */
  textColor?: string;

  /** Whether to enable syntax highlighting */
  enableSyntaxHighlighting?: boolean;

  /** Custom background color for the line */
  backgroundColor?: string;

  /** Optional metadata for the output */
  metadata?: Record<string, unknown>;

  /** Whether to make the content selectable */
  selectable?: boolean;
}

/**
 * Output Line Component
 *
 * This component renders a line that represents terminal output (responses).
 * It displays the output text with proper formatting and styling.
 *
 * Features:
 * - Displays output text with proper formatting
 * - Preserves whitespace and line breaks
 * - Optional syntax highlighting
 * - Customizable colors and styling
 * - Text selection support
 * - Responsive layout
 *
 * @example
 * ```jsx
 * // Basic usage
 * <OutputLine content="Hello, World!" />
 *
 * // With preserved whitespace
 * <OutputLine
 *   content="Multi-line\noutput\nwith breaks"
 *   preserveWhitespace={true}
 * />
 *
 * // With custom styling
 * <OutputLine
 *   content="GitHub user: octocat"
 *   textColor="text-blue-400"
 *   backgroundColor="bg-blue-900 bg-opacity-20"
 *   className="border-l-2 border-blue-500 pl-2"
 * />
 *
 * // With syntax highlighting
 * <OutputLine
 *   content="JSON output: {\"key\": \"value\"}"
 *   enableSyntaxHighlighting={true}
 * />
 * ```
 */
export const OutputLine: React.FC<OutputLineProps> = ({
  content,
  className = "",
  customStyle,
  preserveWhitespace = true,
  textColor = "text-gray-300",
  enableSyntaxHighlighting = false,
  backgroundColor = "",
  metadata,
  selectable = true,
}) => {
  // ===== STYLES =====

  /**
   * Base styles for the output line
   */
  const baseStyles = "font-mono text-sm";

  /**
   * Whitespace preservation styles
   * Applied conditionally based on preserveWhitespace prop
   */
  const whitespaceStyles = preserveWhitespace ? "whitespace-pre-line" : "";

  /**
   * Text alignment styles
   * Ensures proper left alignment
   */
  const alignmentStyles = "text-left ml-0 pl-0";

  /**
   * Selection styles
   * Applied conditionally based on selectable prop
   */
  const selectionStyles = selectable ? "select-text" : "select-none";

  /**
   * Syntax highlighting styles
   * Applied conditionally based on enableSyntaxHighlighting prop
   */
  const syntaxStyles = enableSyntaxHighlighting ? "syntax-highlight" : "";

  /**
   * Final computed className
   */
  const finalClassName = [
    baseStyles,
    textColor,
    backgroundColor,
    whitespaceStyles,
    alignmentStyles,
    selectionStyles,
    syntaxStyles,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // ===== CONTENT PROCESSING =====

  /**
   * Process the content for display
   * Applies any necessary transformations including link detection
   */
  const processedContent = (() => {
    let processed = content;

    // Apply syntax highlighting if enabled
    if (enableSyntaxHighlighting) {
      // Basic JSON highlighting
      if (content.trim().startsWith("{") || content.trim().startsWith("[")) {
        try {
          // Simple JSON formatting (could be enhanced with a proper highlighter)
          processed = content
            .replace(/"([^"]+)":/g, '"$1":') // Highlight keys
            .replace(/:\s*"([^"]+)"/g, ': "$1"'); // Highlight string values
        } catch {
          // If JSON parsing fails, use original content
          processed = content;
        }
      }
    }

    return processed;
  })();

  /**
   * Render content with clickable links
   * Converts URLs to clickable links while preserving formatting
   */
  const renderContentWithLinks = (text: string) => {
    // Split by lines to preserve formatting
    const lines = text.split("\n");

    return lines.map((line, lineIndex) => {
      // Check if line contains a GitHub URL
      const urlRegex = /(https:\/\/github\.com\/[^\s]+)/g;
      const matches = line.match(urlRegex);

      if (matches) {
        // Split line by URLs to create clickable links
        const parts = line.split(urlRegex);

        return (
          <div key={lineIndex} className="whitespace-pre">
            {parts.map((part, partIndex) => {
              if (urlRegex.test(part)) {
                // This is a URL - make it clickable
                return (
                  <a
                    key={partIndex}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors"
                    onClick={(e) => e.stopPropagation()} // Prevent terminal click
                  >
                    {part}
                  </a>
                );
              } else {
                // Regular text
                return <span key={partIndex}>{part}</span>;
              }
            })}
          </div>
        );
      } else {
        // No URLs in this line, render as regular text
        return (
          <div key={lineIndex} className="whitespace-pre">
            {line}
          </div>
        );
      }
    });
  };

  // ===== RENDER =====

  return (
    <div className={finalClassName} style={customStyle}>
      {renderContentWithLinks(processedContent)}

      {/* Optional metadata display (for debugging) */}
      {metadata && process.env.NODE_ENV === "development" && (
        <span className="text-gray-600 text-xs ml-2 opacity-50">
          {/* Debug info in development */}
        </span>
      )}
    </div>
  );
};

/**
 * Default export for convenience
 */
export default OutputLine;
