import React, { forwardRef } from "react";

/**
 * Terminal Input Props Interface
 * Configuration options for the TerminalInput component
 */
export interface TerminalInputProps {
  /** Current input value */
  value: string;
  
  /** Callback fired when the input value changes */
  onChange: (value: string) => void;
  
  /** Callback fired when Enter key is pressed */
  onEnter?: () => void;
  
  /** Callback fired when Escape key is pressed */
  onEscape?: () => void;
  
  /** Callback fired when Tab key is pressed */
  onTab?: () => void;
  
  /** Callback fired when Up arrow key is pressed */
  onArrowUp?: () => void;
  
  /** Callback fired when Down arrow key is pressed */
  onArrowDown?: () => void;
  
  /** The prompt symbol to display (e.g., "$ ", "> ") */
  prompt?: string;
  
  /** Placeholder text for the input */
  placeholder?: string;
  
  /** Whether the input is disabled */
  disabled?: boolean;
  
  /** Whether the input is in processing state */
  isProcessing?: boolean;
  
  /** Additional CSS classes to apply */
  className?: string;
  
  /** Custom styling for the input */
  customStyle?: React.CSSProperties;
  
  /** Custom prompt color */
  promptColor?: string;
  
  /** Custom text color */
  textColor?: string;
  
  /** Whether to show a cursor indicator */
  showCursor?: boolean;
  
  /** Whether to enable auto-focus */
  autoFocus?: boolean;
  
  /** Maximum length of input */
  maxLength?: number;
}

/**
 * Terminal Input Component
 * 
 * This component renders the current input line where users type commands.
 * It handles keyboard input, command history, and visual feedback.
 * 
 * Features:
 * - Real-time input handling
 * - Keyboard shortcuts (Enter, Escape, Tab, Arrow keys)
 * - Command processing state
 * - Customizable prompt and styling
 * - Auto-focus functionality
 * - Input validation and limits
 * - Cursor indicator
 * 
 * @example
 * ```jsx
 * // Basic usage
 * <TerminalInput
 *   value={input}
 *   onChange={setInput}
 *   onEnter={handleEnter}
 * />
 * 
 * // With custom prompt and styling
 * <TerminalInput
 *   value={input}
 *   onChange={setInput}
 *   onEnter={handleEnter}
 *   prompt="> "
 *   promptColor="text-blue-400"
 *   textColor="text-white"
 *   placeholder="Enter command..."
 * />
 * 
 * // With processing state
 * <TerminalInput
 *   value={input}
 *   onChange={setInput}
 *   onEnter={handleEnter}
 *   isProcessing={true}
 *   disabled={true}
 *   showCursor={true}
 * />
 * ```
 */
export const TerminalInput = forwardRef<HTMLInputElement, TerminalInputProps>(
  (
    {
      value,
      onChange,
      onEnter,
      onEscape,
      onTab,
      onArrowUp,
      onArrowDown,
      prompt = "$ ",
      placeholder = "",
      disabled = false,
      isProcessing = false,
      className = "",
      customStyle,
      promptColor = "text-green-400",
      textColor = "text-gray-300",
      showCursor = true,
      autoFocus = true,
      maxLength,
    },
    ref
  ) => {
    // ===== STYLES =====
    
    /**
     * Base styles for the input container
     */
    const baseStyles = "flex items-center mt-2";
    
    /**
     * Processing state styles
     * Applied when the input is in processing state
     */
    const processingStyles = isProcessing ? "opacity-50" : "";
    
    /**
     * Disabled state styles
     * Applied when the input is disabled
     */
    const disabledStyles = disabled ? "cursor-not-allowed" : "";
    
    /**
     * Final computed className for container
     */
    const containerClassName = [baseStyles, processingStyles, disabledStyles, className]
      .filter(Boolean)
      .join(" ");

    // ===== EVENT HANDLERS =====
    
    /**
     * Handle keyboard events
     * Processes special keys and delegates to appropriate callbacks
     */
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
        case "Enter":
          if (onEnter && !disabled && !isProcessing) {
            e.preventDefault();
            onEnter();
          }
          break;
        
        case "Escape":
          if (onEscape) {
            e.preventDefault();
            onEscape();
          }
          break;
        
        case "Tab":
          if (onTab) {
            e.preventDefault();
            onTab();
          }
          break;
        
        case "ArrowUp":
          if (onArrowUp) {
            e.preventDefault();
            onArrowUp();
          }
          break;
        
        case "ArrowDown":
          if (onArrowDown) {
            e.preventDefault();
            onArrowDown();
          }
          break;
      }
    };

    /**
     * Handle input changes
     * Updates the input value through the onChange callback
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!disabled && !isProcessing) {
        onChange(e.target.value);
      }
    };

    // ===== RENDER =====
    
    return (
      <div className={containerClassName} style={customStyle}>
        {/* Prompt Symbol */}
        <span className={`${promptColor} mr-2 select-none`}>
          {prompt}
        </span>
        
        {/* Input Field */}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isProcessing}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck="false"
          className={`
            flex-1 bg-transparent border-none outline-none font-mono text-sm
            ${textColor} ${disabled || isProcessing ? 'cursor-not-allowed' : 'cursor-text'}
            placeholder-gray-500
          `}
        />
        
        {/* Processing Indicator */}
        {isProcessing && (
          <span className="text-yellow-400 ml-2 animate-pulse">
            ⏳
          </span>
        )}
        
        {/* Cursor Indicator */}
        {showCursor && !isProcessing && !disabled && (
          <span className="text-green-400 ml-1 animate-pulse">
            ▊
          </span>
        )}
      </div>
    );
  }
);

/**
 * Set display name for better debugging
 */
TerminalInput.displayName = "TerminalInput";

/**
 * Default export for convenience
 */
export default TerminalInput;
