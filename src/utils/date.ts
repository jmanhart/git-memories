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
