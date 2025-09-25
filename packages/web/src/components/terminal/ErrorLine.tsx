import React from "react";

/**
 * Error Line Props Interface
 * Configuration options for the ErrorLine component
 */
export interface ErrorLineProps {
  /** The error content to display */
  content: string;
  
  /** Additional CSS classes to apply */
  className?: string;
  
  /** Custom styling for the line */
  customStyle?: React.CSSProperties;
  
  /** Whether to preserve whitespace and line breaks */
  preserveWhitespace?: boolean;
  
  /** Custom text color */
  textColor?: string;
  
  /** Custom background color for the error line */
  backgroundColor?: string;
  
  /** Whether to show an error icon */
  showIcon?: boolean;
  
  /** Custom error icon */
  icon?: string;
  
  /** Optional metadata for the error */
  metadata?: Record<string, any>;
  
  /** Whether to make the content selectable */
  selectable?: boolean;
  
  /** Error severity level */
  severity?: "low" | "medium" | "high" | "critical";
}

/**
 * Error Line Component
 * 
 * This component renders a line that represents terminal errors.
 * It displays error messages with appropriate styling and visual indicators.
 * 
 * Features:
 * - Displays error messages with distinctive styling
 * - Optional error icons and severity indicators
 * - Preserves whitespace and line breaks
 * - Customizable colors and styling
 * - Different severity levels with appropriate styling
 * - Text selection support
 * 
 * @example
 * ```jsx
 * // Basic usage
 * <ErrorLine content="Command not found: invalid-command" />
 * 
 * // With error icon
 * <ErrorLine 
 *   content="Failed to connect to server"
 *   showIcon={true}
 *   severity="high"
 * />
 * 
 * // With custom styling
 * <ErrorLine 
 *   content="Permission denied"
 *   textColor="text-red-400"
 *   backgroundColor="bg-red-900 bg-opacity-20"
 *   className="border-l-2 border-red-500 pl-2"
 *   severity="critical"
 * />
 * 
 * // With custom icon
 * <ErrorLine 
 *   content="Network timeout"
 *   icon="⚠️"
 *   severity="medium"
 * />
 * ```
 */
export const ErrorLine: React.FC<ErrorLineProps> = ({
  content,
  className = "",
  customStyle,
  preserveWhitespace = true,
  textColor,
  backgroundColor,
  showIcon = false,
  icon,
  metadata,
  selectable = true,
  severity = "medium",
}) => {
  // ===== SEVERITY-BASED STYLING =====
  
  /**
   * Get severity-based styles
   * Returns appropriate colors and styling based on error severity
   */
  const getSeverityStyles = (): { textColor: string; backgroundColor: string; icon: string } => {
    switch (severity) {
      case "low":
        return {
          textColor: "text-yellow-400",
          backgroundColor: "bg-yellow-900 bg-opacity-10",
          icon: "ℹ️"
        };
      case "medium":
        return {
          textColor: "text-orange-400",
          backgroundColor: "bg-orange-900 bg-opacity-10",
          icon: "⚠️"
        };
      case "high":
        return {
          textColor: "text-red-400",
          backgroundColor: "bg-red-900 bg-opacity-10",
          icon: "❌"
        };
      case "critical":
        return {
          textColor: "text-red-500",
          backgroundColor: "bg-red-900 bg-opacity-20",
          icon: "💥"
        };
      default:
        return {
          textColor: "text-orange-400",
          backgroundColor: "bg-orange-900 bg-opacity-10",
          icon: "⚠️"
        };
    }
  };

  // ===== STYLES =====
  
  /**
   * Severity-based styles
   */
  const severityStyles = getSeverityStyles();
  
  /**
   * Base styles for the error line
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
   * Final computed styles
   */
  const finalTextColor = textColor || severityStyles.textColor;
  const finalBackgroundColor = backgroundColor || severityStyles.backgroundColor;
  const finalIcon = icon || (showIcon ? severityStyles.icon : "");
  
  /**
   * Final computed className
   */
  const finalClassName = [
    baseStyles,
    finalTextColor,
    finalBackgroundColor,
    whitespaceStyles,
    alignmentStyles,
    selectionStyles,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // ===== RENDER =====
  
  return (
    <div 
      className={finalClassName}
      style={customStyle}
    >
      <div className="flex items-start">
        {/* Error Icon */}
        {finalIcon && (
          <span className="mr-2 text-sm flex-shrink-0">
            {finalIcon}
          </span>
        )}
        
        {/* Error Content */}
        <span className="flex-1">
          {content}
        </span>
      </div>
      
      {/* Optional metadata display (for debugging) */}
      {metadata && process.env.NODE_ENV === 'development' && (
        <div className="text-gray-600 text-xs mt-1 opacity-50">
          {/* Debug info in development */}
          <span>Severity: {severity}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Default export for convenience
 */
export default ErrorLine;
