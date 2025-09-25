import React from "react";

/**
 * Terminal Window Theme Options
 * Defines available styling themes for the terminal window
 */
export type TerminalTheme = "dark" | "light" | "retro" | "minimal";

/**
 * Terminal Window Size Options
 * Defines available size variants for the terminal window
 */
export type TerminalSize = "sm" | "md" | "lg" | "xl" | "full";

/**
 * Terminal Window Props Interface
 * Configuration options for the TerminalWindow component
 */
export interface TerminalWindowProps {
  /** Child components to render inside the terminal window */
  children: React.ReactNode;

  /** Visual theme for the terminal window */
  theme?: TerminalTheme;

  /** Size variant for the terminal window */
  size?: TerminalSize;

  /** Additional CSS classes to apply */
  className?: string;

  /** Whether to show a border around the terminal */
  showBorder?: boolean;

  /** Whether to show a shadow around the terminal */
  showShadow?: boolean;

  /** Custom background color (overrides theme) */
  backgroundColor?: string;

  /** Custom border color (overrides theme) */
  borderColor?: string;
}

/**
 * Terminal Window Component
 *
 * This component provides the outer container for the terminal interface.
 * It handles the visual styling, theming, and layout of the terminal window.
 *
 * Features:
 * - Multiple theme options (dark, light, retro, minimal)
 * - Multiple size variants (sm, md, lg, xl, full)
 * - Customizable borders and shadows
 * - Responsive design
 * - Consistent styling across the application
 *
 * @example
 * ```jsx
 * // Basic usage
 * <TerminalWindow>
 *   <TerminalContent />
 * </TerminalWindow>
 *
 * // With custom theme and size
 * <TerminalWindow theme="retro" size="lg">
 *   <TerminalContent />
 * </TerminalWindow>
 *
 * // With custom styling
 * <TerminalWindow
 *   backgroundColor="bg-blue-900"
 *   borderColor="border-blue-500"
 *   showShadow={false}
 * >
 *   <TerminalContent />
 * </TerminalWindow>
 * ```
 */
export const TerminalWindow: React.FC<TerminalWindowProps> = ({
  children,
  theme = "dark",
  size = "lg",
  className = "",
  showBorder = true,
  showShadow = true,
  backgroundColor,
  borderColor,
}) => {
  // ===== THEME STYLES =====

  /**
   * Get theme-specific styles
   * Returns appropriate Tailwind classes based on the selected theme
   */
  const getThemeStyles = (): string => {
    switch (theme) {
      case "dark":
        return "bg-gray-900 border-gray-700";
      case "light":
        return "bg-white border-gray-300";
      case "retro":
        return "bg-black border-green-500";
      case "minimal":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-900 border-gray-700";
    }
  };

  /**
   * Get size-specific styles
   * Returns appropriate Tailwind classes based on the selected size
   */
  const getSizeStyles = (): string => {
    switch (size) {
      case "sm":
        return "max-w-sm";
      case "md":
        return "max-w-2xl";
      case "lg":
        return "max-w-4xl";
      case "xl":
        return "max-w-6xl";
      case "full":
        return "w-full";
      default:
        return "max-w-4xl";
    }
  };

  // ===== COMPUTED STYLES =====

  /**
   * Base styles that are always applied
   * These provide the fundamental terminal appearance
   */
  const baseStyles = "mx-auto rounded-lg overflow-hidden";

  /**
   * Border styles
   * Applied conditionally based on showBorder prop
   */
  const borderStyles = showBorder ? "border" : "";

  /**
   * Shadow styles
   * Applied conditionally based on showShadow prop
   */
  const shadowStyles = showShadow ? "shadow-lg" : "";

  /**
   * Theme and size styles
   * Computed based on the theme and size props
   */
  const themeStyles = backgroundColor ? backgroundColor : getThemeStyles();
  const sizeStyles = getSizeStyles();

  /**
   * Custom border color
   * Overrides theme border color if provided
   */
  const customBorderColor = borderColor ? borderColor : "";

  // ===== FINAL CLASSES =====

  /**
   * Final computed className
   * Combines all style sources into a single className string
   */
  const finalClassName = [
    baseStyles,
    sizeStyles,
    borderStyles,
    shadowStyles,
    themeStyles,
    customBorderColor,
    className,
  ]
    .filter(Boolean) // Remove empty strings
    .join(" ");

  // ===== RENDER =====

  return <div className={finalClassName}>{children}</div>;
};

/**
 * Default export for convenience
 */
export default TerminalWindow;
