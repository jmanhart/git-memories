/**
 * Contribution Formatting
 *
 * Handles formatting of individual contributions and repository groups
 */

import { Contribution, GitHubCommit, GitHubPullRequest } from "../types";
import { EMOJIS } from "../utils/constants";

/**
 * Format a single contribution (year's worth of data)
 */
export function formatContribution(contribution: Contribution): string {
  let output = `📅 ${contribution.year}\n`;
  output += "─".repeat(20) + "\n";

  // Group commits and PRs by repository
  const commitsByRepo = groupBy(
    contribution.commits,
    (commit) => commit.repository.name
  );
  const prsByRepo = groupBy(
    contribution.pullRequests,
    (pr) => pr.repository.name
  );

  // Get all unique repositories
  const allRepos = new Set([
    ...Object.keys(commitsByRepo),
    ...Object.keys(prsByRepo),
  ]);

  allRepos.forEach((repoName) => {
    const commits = commitsByRepo[repoName] || [];
    const prs = prsByRepo[repoName] || [];

    if (commits.length > 0 || prs.length > 0) {
      output += `  📁 ${repoName}\n`;

      // Show commits
      commits.forEach((commit) => {
        const shortMessage = commit.message.split("\n")[0].substring(0, 60);
        output += `    ${EMOJIS.COMMIT} ${shortMessage}${
          shortMessage.length === 60 ? "..." : ""
        }\n`;
      });

      // Show pull requests
      prs.forEach((pr) => {
        const stateEmoji = getPRStateEmoji(pr.state);
        const shortTitle = pr.title.substring(0, 50);
        output += `    ${stateEmoji} PR: ${shortTitle}${
          pr.title.length > 50 ? "..." : ""
        }\n`;
      });

      output += "\n";
    }
  });

  return output;
}

/**
 * Get emoji for PR state
 */
function getPRStateEmoji(state: "OPEN" | "CLOSED" | "MERGED"): string {
  switch (state) {
    case "MERGED":
      return EMOJIS.PR_MERGED;
    case "CLOSED":
      return EMOJIS.PR_CLOSED;
    case "OPEN":
      return EMOJIS.PR_OPEN;
    default:
      return EMOJIS.PR_OPEN;
  }
}

/**
 * Group array items by a key function
 */
function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = keyFn(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
