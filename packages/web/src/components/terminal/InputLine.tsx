import React from "react";

/**
 * Input Line Props Interface
 * Configuration options for the InputLine component
 */
export interface InputLineProps {
  /** The command content that was typed by the user */
  content: string;
  
  /** The prompt symbol to display (e.g., "$ ", "> ") */
  prompt?: string;
  
  /** Additional CSS classes to apply */
  className?: string;
  
  /** Custom styling for the line */
  customStyle?: React.CSSProperties;
  
  /** Whether to highlight the command */
  highlight?: boolean;
  
  /** Custom prompt color */
  promptColor?: string;
  
  /** Custom text color */
  textColor?: string;
  
  /** Optional metadata for the input */
  metadata?: Record<string, any>;
}

/**
 * Input Line Component
 * 
 * This component renders a line that represents user input (commands).
 * It displays the prompt symbol and the command that was typed.
 * 
 * Features:
 * - Displays prompt symbol and command text
 * - Customizable colors for prompt and text
 * - Optional highlighting for important commands
 * - Consistent styling with terminal theme
 * - Support for different prompt styles
 * 
 * @example
 * ```jsx
 * // Basic usage
 * <InputLine content="ls -la" prompt="$ " />
 * 
 * // With custom styling
 * <InputLine 
 *   content="git commit -m 'Initial commit'"
 *   prompt="$ "
 *   promptColor="text-green-400"
 *   textColor="text-white"
 *   highlight={true}
 * />
 * 
 * // With custom prompt
 * <InputLine 
 *   content="npm install"
 *   prompt="> "
 *   className="border-l-2 border-blue-500 pl-2"
 * />
 * ```
 */
export const InputLine: React.FC<InputLineProps> = ({
  content,
  prompt = "$ ",
  className = "",
  customStyle,
  highlight = false,
  promptColor = "text-green-400",
  textColor = "text-gray-300",
  metadata,
}) => {
  // ===== STYLES =====
  
  /**
   * Base styles for the input line
   */
  const baseStyles = "flex items-center";
  
  /**
   * Highlight styles
   * Applied conditionally based on highlight prop
   */
  const highlightStyles = highlight ? "bg-yellow-100 bg-opacity-10 rounded px-2 py-1" : "";
  
  /**
   * Final computed className
   */
  const finalClassName = [baseStyles, highlightStyles, className]
    .filter(Boolean)
    .join(" ");

  // ===== RENDER =====
  
  return (
    <div 
      className={finalClassName}
      style={customStyle}
    >
      {/* Prompt Symbol */}
      <span className={`${promptColor} mr-2 select-none`}>
        {prompt}
      </span>
      
      {/* Command Content */}
      <span className={`${textColor} font-mono`}>
        {content}
      </span>
      
      {/* Optional metadata display (for debugging) */}
      {metadata && process.env.NODE_ENV === 'development' && (
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
export default InputLine;
