import React from "react";
import { InputLine } from "./InputLine";
import { OutputLine } from "./OutputLine";
import { ErrorLine } from "./ErrorLine";

/**
 * Terminal Line Data Interface
 * Defines the structure of a single terminal line
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
 * Terminal Line Props Interface
 * Configuration options for the TerminalLine component
 */
export interface TerminalLineProps {
  /** The terminal line data to render */
  line: TerminalLineData;

  /** Whether to show line numbers */
  showLineNumber?: boolean;

  /** Whether to show timestamps */
  showTimestamp?: boolean;

  /** The line number to display */
  lineNumber?: number;

  /** Additional CSS classes to apply */
  className?: string;

  /** Whether to enable line animations */
  enableAnimation?: boolean;

  /** Custom styling for the line */
  customStyle?: React.CSSProperties;
}

/**
 * Terminal Line Component
 *
 * This component renders a single terminal line based on its type.
 * It acts as a dispatcher that routes to the appropriate specialized component.
 *
 * Features:
 * - Routes to appropriate line type component (InputLine, OutputLine, ErrorLine)
 * - Optional line numbers and timestamps
 * - Smooth animations for new lines
 * - Custom styling support
 * - Consistent rendering across all line types
 *
 * @example
 * ```jsx
 * // Basic usage
 * <TerminalLine line={lineData} />
 *
 * // With line number and timestamp
 * <TerminalLine
 *   line={lineData}
 *   showLineNumber={true}
 *   showTimestamp={true}
 *   lineNumber={42}
 * />
 *
 * // With custom styling
 * <TerminalLine
 *   line={lineData}
 *   className="border-l-2 border-blue-500 pl-2"
 *   customStyle={{ backgroundColor: 'rgba(0,0,255,0.1)' }}
 * />
 * ```
 */
export const TerminalLine: React.FC<TerminalLineProps> = ({
  line,
  showLineNumber = false,
  showTimestamp = false,
  lineNumber,
  className = "",
  enableAnimation = false,
  customStyle,
}) => {
  // ===== STYLES =====

  /**
   * Base styles for the line container
   */
  const baseStyles = "";

  /**
   * Animation styles
   * Applied conditionally based on enableAnimation prop
   */
  const animationStyles = enableAnimation ? "animate-fade-in" : "";

  /**
   * Final computed className
   */
  const finalClassName = [baseStyles, animationStyles, className]
    .filter(Boolean)
    .join(" ");

  // ===== LINE NUMBER RENDERING =====

  /**
   * Render line number if enabled
   */
  const renderLineNumber = (): React.ReactNode => {
    if (!showLineNumber || lineNumber === undefined) return null;

    return (
      <span className="text-gray-500 text-xs mr-3 select-none">
        {lineNumber.toString().padStart(3, "0")}
      </span>
    );
  };

  // ===== TIMESTAMP RENDERING =====

  /**
   * Render timestamp if enabled and available
   */
  const renderTimestamp = (): React.ReactNode => {
    if (!showTimestamp || !line.timestamp) return null;

    const timeString = line.timestamp.toLocaleTimeString();
    return (
      <span className="text-gray-600 text-xs mr-2 select-none">
        [{timeString}]
      </span>
    );
  };

  // ===== LINE CONTENT RENDERING =====

  /**
   * Render the appropriate line type component
   */
  const renderLineContent = (): React.ReactNode => {
    // Create common props for all line types
    const commonProps = {
      content: line.content,
      prompt: line.prompt,
      metadata: line.metadata,
    };

    // Route to appropriate component based on line type
    switch (line.type) {
      case "input":
        return <InputLine {...commonProps} />;

      case "output":
        return <OutputLine {...commonProps} />;

      case "error":
        return <ErrorLine {...commonProps} />;

      default:
        // Fallback to output line for unknown types
        console.warn(`Unknown line type: ${line.type}, falling back to output`);
        return <OutputLine {...commonProps} />;
    }
  };

  // ===== RENDER =====

  return (
    <div className={finalClassName} style={customStyle}>
      <div className="flex items-start">
        {renderLineNumber()}
        {renderTimestamp()}
        <div className="flex-1">{renderLineContent()}</div>
      </div>
    </div>
  );
};

/**
 * Default export for convenience
 */
export default TerminalLine;
