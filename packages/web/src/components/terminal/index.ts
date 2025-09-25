/**
 * Terminal Components Index
 * 
 * This file exports all terminal-related components for easy importing.
 * It provides a clean API for using terminal components throughout the application.
 * 
 * Components:
 * - TerminalWindow: Outer container with theming and styling
 * - TerminalContent: Scrollable content area
 * - TerminalLines: Container for all terminal lines
 * - TerminalLine: Individual line dispatcher
 * - InputLine: User input line renderer
 * - OutputLine: Output line renderer
 * - ErrorLine: Error line renderer
 * - TerminalInput: Current input field
 * 
 * @example
 * ```jsx
 * // Import individual components
 * import { TerminalWindow, TerminalContent, TerminalInput } from './terminal';
 * 
 * // Import specific line types
 * import { InputLine, OutputLine, ErrorLine } from './terminal';
 * 
 * // Import types
 * import { TerminalTheme, TerminalLineData } from './terminal';
 * ```
 */

// ===== MAIN COMPONENTS =====

export { TerminalWindow } from "./TerminalWindow";
export type { 
  TerminalWindowProps, 
  TerminalTheme, 
  TerminalSize 
} from "./TerminalWindow";

export { TerminalContent } from "./TerminalContent";
export type { 
  TerminalContentProps, 
  TerminalContentLayout, 
  TerminalContentSize 
} from "./TerminalContent";

export { TerminalLines } from "./TerminalLines";
export type { TerminalLinesProps } from "./TerminalLines";

export { TerminalLine } from "./TerminalLine";
export type { 
  TerminalLineProps, 
  TerminalLineData 
} from "./TerminalLine";

// ===== LINE TYPE COMPONENTS =====

export { InputLine } from "./InputLine";
export type { InputLineProps } from "./InputLine";

export { OutputLine } from "./OutputLine";
export type { OutputLineProps } from "./OutputLine";

export { ErrorLine } from "./ErrorLine";
export type { ErrorLineProps } from "./ErrorLine";

// ===== INPUT COMPONENT =====

export { TerminalInput } from "./TerminalInput";
export type { TerminalInputProps } from "./TerminalInput";

// ===== DEFAULT EXPORTS =====

export { default as TerminalWindowDefault } from "./TerminalWindow";
export { default as TerminalContentDefault } from "./TerminalContent";
export { default as TerminalLinesDefault } from "./TerminalLines";
export { default as TerminalLineDefault } from "./TerminalLine";
export { default as InputLineDefault } from "./InputLine";
export { default as OutputLineDefault } from "./OutputLine";
export { default as ErrorLineDefault } from "./ErrorLine";
export { default as TerminalInputDefault } from "./TerminalInput";
