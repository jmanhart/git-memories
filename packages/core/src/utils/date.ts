/**
 * Date Utilities
 *
 * Helper functions for date manipulation and formatting
 */

/**
 * Get the current date components
 */
export function getCurrentDate() {
  const today = new Date();
  return {
    year: today.getFullYear(),
    month: today.getMonth() + 1, // 0-indexed to 1-indexed
    day: today.getDate(),
    date: today,
  };
}

/**
 * Format a date for display
 */
export function formatDateForDisplay(
  year: number,
  month: number,
  day: number
): string {
  const monthName = new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
  });
  return `${monthName} ${day}`;
}

/**
 * Create a date range for API queries
 */
export function createDateRange(year: number, month: number, day: number) {
  const startDate = new Date(year, month - 1, day);
  const endDate = new Date(year, month - 1, day + 1);

  return {
    startDate,
    endDate,
    startISO: startDate.toISOString(),
    endISO: endDate.toISOString(),
  };
}

/**
 * Check if a date is today
 */
export function isToday(year: number, month: number, day: number): boolean {
  const today = new Date();
  return (
    year === today.getFullYear() &&
    month === today.getMonth() + 1 &&
    day === today.getDate()
  );
}

/**
 * Parse a date string in YYYY-MM-DD format
 */
export function parseDateString(dateString: string): { year: number; month: number; day: number } {
  const dateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const match = dateString.match(dateRegex);
  
  if (!match) {
    throw new Error(`Invalid date format. Expected YYYY-MM-DD, got: ${dateString}`);
  }
  
  const [, yearStr, monthStr, dayStr] = match;
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);
  
  // Validate date components
  if (year < 2008 || year > new Date().getFullYear()) {
    throw new Error(`Year must be between 2008 and ${new Date().getFullYear()}, got: ${year}`);
  }
  
  if (month < 1 || month > 12) {
    throw new Error(`Month must be between 1 and 12, got: ${month}`);
  }
  
  if (day < 1 || day > 31) {
    throw new Error(`Day must be between 1 and 31, got: ${day}`);
  }
  
  // Validate that the date actually exists (e.g., not Feb 30)
  const testDate = new Date(year, month - 1, day);
  if (testDate.getFullYear() !== year || testDate.getMonth() !== month - 1 || testDate.getDate() !== day) {
    throw new Error(`Invalid date: ${dateString}`);
  }
  
  return { year, month, day };
}
