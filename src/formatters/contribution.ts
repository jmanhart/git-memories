/**
 * Contribution Formatting
 *
 * Handles formatting of individual contributions and repository groups
 */

import { Contribution, GitHubCommit, GitHubPullRequest } from "../types";
import { EMOJIS } from "../utils/constants";

/**
 * Create a clean link text for terminal display
 */
function createLinkText(url: string, label: string): string {
  // Create a clean, clickable link format
  return `🔗 ${label}: ${url}`;
}

/**
 * Create a shorter, more concise link format
 */
function createShortLink(url: string, label: string): string {
  return `🔗 ${label}`;
}

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
      // Get repository URL from first commit or PR
      const firstCommit = commits[0];
      const firstPR = prs[0];
      const repoUrl = firstCommit
        ? `https://github.com/${firstCommit.repository.owner.login}/${firstCommit.repository.name}`
        : firstPR
        ? `https://github.com/${firstPR.repository.owner.login}/${firstPR.repository.name}`
        : `https://github.com/${repoName}`;

      output += `  📁 ${repoName}\n`;
      output += `     ${createShortLink(repoUrl, "Repository")} - ${repoUrl}\n`;

      // Show commits
      commits.forEach((commit) => {
        const shortMessage = commit.message.split("\n")[0].substring(0, 60);
        const truncatedMessage =
          shortMessage.length === 60 ? shortMessage + "..." : shortMessage;
        output += `    ${EMOJIS.COMMIT} ${truncatedMessage}\n`;
        output += `        ${createShortLink(commit.url, "Commit")} - ${
          commit.url
        }\n`;
      });

      // Show pull requests
      prs.forEach((pr) => {
        const stateEmoji = getPRStateEmoji(pr.state);
        const shortTitle = pr.title.substring(0, 50);
        const truncatedTitle =
          pr.title.length > 50 ? shortTitle + "..." : shortTitle;
        output += `    ${stateEmoji} PR: ${truncatedTitle}\n`;
        output += `        ${createShortLink(pr.url, "PR")} - ${pr.url}\n`;
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
