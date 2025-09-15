/**
 * Formatters Module
 *
 * Main formatter interface for all output formatting
 */

import { Contribution } from "../types";
import { formatContribution } from "./contribution";
import {
  getNoContributionsMessage,
  getContributionsFoundMessage,
} from "./messages";

/**
 * Format contributions for display
 *
 * @param contributions - Array of contributions to format
 * @param month - Month number (1-12)
 * @param day - Day of month
 */
export function formatContributions(
  contributions: Contribution[],
  month: number,
  day: number
): string {
  if (contributions.length === 0) {
    return getNoContributionsMessage(month, day);
  }

  let output = getContributionsFoundMessage(month, day);

  // Sort contributions by year (newest first)
  contributions.sort((a, b) => b.year - a.year);

  // Format each contribution
  contributions.forEach((contribution) => {
    output += formatContribution(contribution);
  });

  return output;
}
