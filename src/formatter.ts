import { Contribution } from "./github-api";

export function formatContributions(
  contributions: Contribution[],
  month: number,
  day: number
): string {
  if (contributions.length === 0) {
    return getNoContributionsMessage(month, day);
  }

  const monthName = new Date(2024, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
  });

  let output = `\n🌱 Your contributions on ${monthName} ${day} throughout the years:\n\n`;

  // Sort contributions by year (newest first)
  contributions.sort((a, b) => b.year - a.year);

  contributions.forEach((contribution) => {
    output += `📅 ${contribution.year}\n`;
    output += "─".repeat(20) + "\n";

    // Group commits by repository
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
          output += `    💚 ${shortMessage}${
            shortMessage.length === 60 ? "..." : ""
          }\n`;
        });

        // Show pull requests
        prs.forEach((pr) => {
          const state =
            pr.state === "MERGED" ? "✅" : pr.state === "CLOSED" ? "❌" : "🔄";
          output += `    ${state} PR: ${pr.title.substring(0, 50)}${
            pr.title.length > 50 ? "..." : ""
          }\n`;
        });

        output += "\n";
      }
    });

    output += "\n";
  });

  return output;
}

function getNoContributionsMessage(month: number, day: number): string {
  const monthName = new Date(2024, month - 1, day).toLocaleDateString("en-US", {
    month: "long",
  });

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
