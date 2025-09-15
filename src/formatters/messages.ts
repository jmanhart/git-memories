/**
 * Fun Messages
 *
 * Collection of fun and encouraging messages for different scenarios
 */

import { formatDateForDisplay } from "../utils/date";

/**
 * Get a random fun message when no contributions are found
 */
export function getNoContributionsMessage(month: number, day: number): string {
  const monthName = formatDateForDisplay(2024, month, day).split(" ")[0];

  const messages = [
    `🌱 No code sprouted on ${monthName} ${day}... time to plant some new ideas!`,
    `📝 ${monthName} ${day} was a quiet day in your coding garden... maybe it's time to write some new stories!`,
    `💭 On ${monthName} ${day}, your keyboard was silent... but every great developer needs rest days!`,
    `🎯 ${monthName} ${day} - a blank canvas waiting for your next masterpiece!`,
    `✨ No contributions on ${monthName} ${day}... but every day is a chance to create something amazing!`,
  ];

  // Pick a random message for variety
  const randomIndex = Math.floor(Math.random() * messages.length);
  return `\n${messages[randomIndex]}\n\n💡 Try running this command on a different day to see your coding journey!`;
}

/**
 * Get a fun message for when contributions are found
 */
export function getContributionsFoundMessage(
  month: number,
  day: number
): string {
  const monthName = formatDateForDisplay(2024, month, day).split(" ")[0];
  return `\n🌱 Your contributions on ${monthName} ${day} throughout the years:\n\n`;
}

/**
 * Get a fun message for the outro
 */
export function getOutroMessage(): string {
  const messages = [
    "Thanks for the memories! 🎉",
    "Keep coding and making memories! 🚀",
    "Your coding journey continues! 💻",
    "Happy coding! 🌟",
    "See you tomorrow for more memories! 👋",
  ];

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}
