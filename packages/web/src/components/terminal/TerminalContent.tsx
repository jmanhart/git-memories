import React, { forwardRef } from "react";

/**
 * Terminal Content Layout Options
 * Defines different layout styles for the terminal content area
 */
export type TerminalContentLayout = "compact" | "spacious" | "comfortable";

/**
 * Terminal Content Size Options
 * Defines available height variants for the terminal content
 */
export type TerminalContentSize = "sm" | "md" | "lg" | "xl" | "auto";

/**
 * Terminal Content Props Interface
 * Configuration options for the TerminalContent component
 */
export interface TerminalContentProps {
  /** Child components to render inside the content area */
  children: React.ReactNode;

  /** Layout style for the content area */
  layout?: TerminalContentLayout;

  /** Height variant for the content area */
  size?: TerminalContentSize;

  /** Custom height value (overrides size) */
  customHeight?: string;

  /** Additional CSS classes to apply */
  className?: string;

  /** Whether to show padding around the content */
  showPadding?: boolean;

  /** Whether to enable scrolling */
  enableScrolling?: boolean;

  /** Custom padding value */
  customPadding?: string;

  /** Click handler for the content area */
  onClick?: () => void;

  /** Custom background color (overrides theme) */
  backgroundColor?: string;

  /** Whether to show the cursor as a text cursor */
  showTextCursor?: boolean;
}

/**
 * Terminal Content Component
 *
 * This component provides the scrollable content area for the terminal.
 * It handles the layout, scrolling behavior, and content presentation.
 *
 * Features:
 * - Multiple layout options (compact, spacious, comfortable)
 * - Multiple size variants (sm, md, lg, xl, auto)
 * - Customizable scrolling behavior
 * - Responsive height handling
 * - Click-to-focus functionality
 * - Custom padding and styling options
 *
 * @example
 * ```jsx
 * // Basic usage
 * <TerminalContent>
 *   <TerminalLines lines={lines} />
 *   <TerminalInput />
 * </TerminalContent>
 *
 * // With custom layout and size
 * <TerminalContent layout="spacious" size="xl">
 *   <TerminalLines lines={lines} />
 *   <TerminalInput />
 * </TerminalContent>
 *
 * // With custom height and padding
 * <TerminalContent
 *   customHeight="h-[500px]"
 *   customPadding="p-6"
 *   enableScrolling={false}
 * >
 *   <TerminalLines lines={lines} />
 *   <TerminalInput />
 * </TerminalContent>
 * ```
 */
export const TerminalContent = forwardRef<HTMLDivElement, TerminalContentProps>(
  (
    {
      children,
      layout = "comfortable",
      size = "lg",
      customHeight,
      className = "",
      showPadding = true,
      enableScrolling = true,
      customPadding,
      onClick,
      backgroundColor,
      showTextCursor = true,
    },
    ref
  ) => {
    // ===== LAYOUT STYLES =====

    /**
     * Get layout-specific styles
     * Returns appropriate Tailwind classes based on the selected layout
     */
    const getLayoutStyles = (): string => {
      switch (layout) {
        case "compact":
          return "space-y-0";
        case "spacious":
          return "space-y-2";
        case "comfortable":
          return "space-y-1";
        default:
          return "space-y-1";
      }
    };

    /**
     * Get size-specific height styles
     * Returns appropriate Tailwind classes based on the selected size
     */
    const getSizeStyles = (): string => {
      if (customHeight) return customHeight;

      switch (size) {
        case "sm":
          return "h-48"; // 192px
        case "md":
          return "h-64"; // 256px
        case "lg":
          return "h-96"; // 384px
        case "xl":
          return "h-[500px]"; // 500px
        case "auto":
          return "h-auto min-h-32"; // Auto height with minimum
        default:
          return "h-96"; // 384px
      }
    };

    // ===== COMPUTED STYLES =====

    /**
     * Base styles that are always applied
     * These provide the fundamental terminal content appearance
     */
    const baseStyles = "font-mono text-sm bg-gray-900";

    /**
     * Padding styles
     * Applied conditionally based on showPadding and customPadding props
     */
    const paddingStyles = customPadding || (showPadding ? "p-4" : "p-0");

    /**
     * Scrolling styles
     * Applied conditionally based on enableScrolling prop
     */
    const scrollingStyles = enableScrolling
      ? "overflow-y-auto"
      : "overflow-hidden";

    /**
     * Cursor styles
     * Applied conditionally based on showTextCursor prop
     */
    const cursorStyles = showTextCursor ? "cursor-text" : "cursor-default";

    /**
     * Height styles
     * Computed based on the size prop or customHeight
     */
    const heightStyles = getSizeStyles();

    /**
     * Layout styles
     * Computed based on the layout prop
     */
    const layoutStyles = getLayoutStyles();

    /**
     * Custom background color
     * Overrides default background if provided
     */
    const customBackgroundColor = backgroundColor || "";

    // ===== FINAL CLASSES =====

    /**
     * Final computed className
     * Combines all style sources into a single className string
     */
    const finalClassName = [
      baseStyles,
      paddingStyles,
      scrollingStyles,
      cursorStyles,
      heightStyles,
      layoutStyles,
      customBackgroundColor,
      className,
    ]
      .filter(Boolean) // Remove empty strings
      .join(" ");

    // ===== RENDER =====

    return (
      <div ref={ref} className={finalClassName} onClick={onClick}>
        {children}
      </div>
    );
  }
);

/**
 * Set display name for better debugging
 */
TerminalContent.displayName = "TerminalContent";

/**
 * Default export for convenience
 */
export default TerminalContent;
