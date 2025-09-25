import React from "react";
import { TerminalLine } from "./TerminalLine";

/**
 * Terminal Line Interface
 * Defines the structure of each line in the terminal output
 */
export interface TerminalLineData {
  /** Unique identifier for each line */
  id: number;

  /** The actual text content of the line */
  content: string;

  /** Type of line (user input, response, or error) */
  type: "input" | "output" | "error";

  /** Optional prompt symbol (like $ or >) */
  prompt?: string;

  /** Optional timestamp for the line */
  timestamp?: Date;

  /** Optional metadata for the line */
  metadata?: Record<string, any>;
}

/**
 * Terminal Lines Props Interface
 * Configuration options for the TerminalLines component
 */
export interface TerminalLinesProps {
  /** Array of terminal lines to render */
  lines: TerminalLineData[];

  /** Additional CSS classes to apply to the container */
  className?: string;

  /** Whether to show line numbers */
  showLineNumbers?: boolean;

  /** Whether to show timestamps */
  showTimestamps?: boolean;

  /** Maximum number of lines to display (for performance) */
  maxLines?: number;

  /** Whether to enable line animations */
  enableAnimations?: boolean;

  /** Custom renderer for specific line types */
  customRenderers?: {
    input?: (line: TerminalLineData) => React.ReactNode;
    output?: (line: TerminalLineData) => React.ReactNode;
    error?: (line: TerminalLineData) => React.ReactNode;
  };
}

/**
 * Terminal Lines Component
 *
 * This component renders all the terminal lines in sequence.
 * It handles the layout, line numbering, timestamps, and performance optimization.
 *
 * Features:
 * - Renders all terminal lines in order
 * - Optional line numbers and timestamps
 * - Performance optimization with maxLines
 * - Custom renderers for different line types
 * - Smooth animations for new lines
 * - Responsive layout
 *
 * @example
 * ```jsx
 * // Basic usage
 * <TerminalLines lines={terminalLines} />
 *
 * // With line numbers and timestamps
 * <TerminalLines
 *   lines={terminalLines}
 *   showLineNumbers={true}
 *   showTimestamps={true}
 * />
 *
 * // With performance optimization
 * <TerminalLines
 *   lines={terminalLines}
 *   maxLines={100}
 *   enableAnimations={true}
 * />
 *
 * // With custom renderers
 * <TerminalLines
 *   lines={terminalLines}
 *   customRenderers={{
 *     output: (line) => <CustomOutputRenderer line={line} />,
 *     error: (line) => <CustomErrorRenderer line={line} />
 *   }}
 * />
 * ```
 */
export const TerminalLines: React.FC<TerminalLinesProps> = ({
  lines,
  className = "",
  showLineNumbers = false,
  showTimestamps = false,
  maxLines,
  enableAnimations = false,
  customRenderers,
}) => {
  // ===== PERFORMANCE OPTIMIZATION =====

  /**
   * Get lines to render
   * Applies maxLines limit if specified for performance optimization
   */
  const getLinesToRender = (): TerminalLineData[] => {
    if (maxLines && lines.length > maxLines) {
      // Return only the last maxLines lines
      return lines.slice(-maxLines);
    }
    return lines;
  };

  /**
   * Lines to render
   * Computed based on maxLines setting
   */
  const linesToRender = getLinesToRender();

  // ===== STYLES =====

  /**
   * Base styles for the lines container
   */
  const baseStyles = "space-y-0";

  /**
   * Animation styles
   * Applied conditionally based on enableAnimations prop
   */
  const animationStyles = enableAnimations ? "animate-fade-in" : "";

  /**
   * Final computed className
   */
  const finalClassName = [baseStyles, animationStyles, className]
    .filter(Boolean)
    .join(" ");

  // ===== CUSTOM RENDERER LOGIC =====

  /**
   * Render a single line
   * Uses custom renderer if available, otherwise falls back to default
   */
  const renderLine = (line: TerminalLineData): React.ReactNode => {
    // Check for custom renderer first
    if (customRenderers && customRenderers[line.type]) {
      return customRenderers[line.type]!(line);
    }

    // Fall back to default TerminalLine component
    return (
      <TerminalLine
        key={line.id}
        line={line}
        showLineNumber={showLineNumbers}
        showTimestamp={showTimestamps}
        lineNumber={lines.indexOf(line) + 1}
      />
    );
  };

  // ===== RENDER =====

  return (
    <div className={finalClassName}>
      {linesToRender.map((line) => (
        <div key={line.id} className="mb-1">
          {renderLine(line)}
        </div>
      ))}

      {/* Performance warning if maxLines is limiting display */}
      {maxLines && lines.length > maxLines && (
        <div className="text-gray-500 text-xs italic py-2">
          ... showing last {maxLines} of {lines.length} lines
        </div>
      )}
    </div>
  );
};

/**
 * Default export for convenience
 */
export default TerminalLines;
