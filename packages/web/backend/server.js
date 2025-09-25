require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import your git-memories core functionality
const { GitHubAPI } = require("@git-memories/core");

// Store for demo purposes (in production, use proper auth)
const demoToken = process.env.GITHUB_TOKEN || "public-access";

// API Routes
app.post("/api/terminal/command", async (req, res) => {
  const { command, args = [] } = req.body;

  try {
    let result = await executeGitMemoriesCommand(command, args);
    res.json({
      success: true,
      output: result.output,
      type: result.type || "output",
    });
  } catch (error) {
    res.json({
      success: false,
      output: `Error: ${error.message}`,
      type: "error",
    });
  }
});

// Simulate git-memories CLI commands
async function executeGitMemoriesCommand(command, args) {
  const githubAPI = new GitHubAPI(demoToken);

  switch (command) {
    case "help":
      return {
        output: `Git Memories v1.0.6 - GitHub Contribution History Tool

Available commands:
  help                    - Show this help message
  auth                    - Authenticate with GitHub
  user <username>         - Get user information
  memories <username>     - Get contributions for today across years
  memories <username> <date> - Get contributions for specific date
  version                 - Show version information
  clear                   - Clear terminal

Examples:
  user octocat            - Get GitHub user info
  memories octocat        - Get today's contributions
  memories octocat 2023-12-25 - Get Christmas contributions`,
      };

    case "version":
      return {
        output: `git-memories v1.0.6
Built with TypeScript and Node.js
GitHub API Integration: Active`,
      };

    case "user":
      if (!args[0]) {
        return {
          output: "Usage: user <username>\nExample: user octocat",
          type: "error",
        };
      }

      try {
        const user = await githubAPI.getUser(args[0]);
        return {
          output: `👤 User: ${user.name || user.login}
📧 GitHub: @${user.login}
📅 Joined: ${new Date(user.createdAt).toLocaleDateString()}
🔗 Profile: https://github.com/${user.login}`,
        };
      } catch (error) {
        return {
          output: `User "${args[0]}" not found or private`,
          type: "error",
        };
      }

    case "memories":
      if (!args[0]) {
        return {
          output:
            "Usage: memories <username> [date]\nExample: memories octocat or memories octocat 2023-12-25",
          type: "error",
        };
      }

      try {
        const username = args[0];
        let month, day, startYear, endYear;

        if (args[1]) {
          // Parse specific date (YYYY-MM-DD)
          const date = new Date(args[1]);
          month = date.getMonth() + 1;
          day = date.getDate();
          startYear = 2015;
          endYear = new Date().getFullYear();
        } else {
          // Use today's date
          const today = new Date();
          month = today.getMonth() + 1;
          day = today.getDate();
          startYear = 2015;
          endYear = today.getFullYear();
        }

        const contributions = await githubAPI.getContributionsOnDate(
          username,
          month,
          day,
          startYear,
          endYear
        );

        if (contributions.length === 0) {
          return {
            output: `📅 No contributions found for ${username} on ${month}/${day} across the years`,
          };
        }

        let output = `📅 GitHub Memories for ${username} on ${month}/${day}\n\n`;

        contributions.forEach((contribution) => {
          if (
            contribution.commits.length > 0 ||
            contribution.pullRequests.length > 0
          ) {
            // Get current date for the year line
            const currentDate = new Date();
            const currentDateStr = currentDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            });

            output += `🗓️  ${contribution.year} - ${currentDateStr}\n`;

            if (contribution.commits.length > 0) {
              output += `  📝 Commits (${contribution.commits.length}):\n`;

              // Group commits by repository
              const commitsByRepo = {};
              contribution.commits.forEach((commit) => {
                const repoKey = `${commit.repository.owner.login}/${commit.repository.name}`;
                if (!commitsByRepo[repoKey]) {
                  commitsByRepo[repoKey] = [];
                }
                commitsByRepo[repoKey].push(commit);
              });

              // Sort commits by date (newest first) and group by repository
              Object.keys(commitsByRepo).forEach((repoKey) => {
                const commits = commitsByRepo[repoKey];
                // Sort commits by pushedDate (newest first)
                commits.sort(
                  (a, b) => new Date(b.pushedDate) - new Date(a.pushedDate)
                );

                output += `    📁 ${repoKey}\n`;
                commits.forEach((commit) => {
                  const commitDate = new Date(commit.pushedDate);
                  const timeStr = commitDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  // Add stats if available
                  let statsStr = "";
                  if (commit.stats && commit.stats.total > 0) {
                    statsStr = ` (+${commit.stats.additions} -${commit.stats.deletions})`;
                    console.log(`Stats for commit: ${commit.message} - +${commit.stats.additions} -${commit.stats.deletions}`);
                  } else {
                    console.log(`No stats for commit: ${commit.message}`, commit.stats);
                  }

                  output += `      • ${commit.message} (${timeStr})${statsStr}\n`;
                  output += `        🔗 ${commit.url}\n`;
                });
              });
            }

            if (contribution.pullRequests.length > 0) {
              output += `  🔀 Pull Requests (${contribution.pullRequests.length}):\n`;

              // Group pull requests by repository
              const prsByRepo = {};
              contribution.pullRequests.forEach((pr) => {
                const repoKey = `${pr.repository.owner.login}/${pr.repository.name}`;
                if (!prsByRepo[repoKey]) {
                  prsByRepo[repoKey] = [];
                }
                prsByRepo[repoKey].push(pr);
              });

              // Sort PRs by date (newest first) and group by repository
              Object.keys(prsByRepo).forEach((repoKey) => {
                const prs = prsByRepo[repoKey];
                // Sort PRs by createdAt (newest first)
                prs.sort(
                  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                );

                output += `    📁 ${repoKey}\n`;
                prs.forEach((pr) => {
                  const prDate = new Date(pr.createdAt);
                  const timeStr = prDate.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                  output += `      • ${pr.title} [${pr.state}] (${timeStr})\n`;
                  output += `        🔗 ${pr.url}\n`;
                });
              });
            }
            output += "\n";
          }
        });

        return { output: output.trim() };
      } catch (error) {
        return {
          output: `Error fetching memories for "${args[0]}": ${error.message}`,
          type: "error",
        };
      }

    case "auth":
      return {
        output: `🔐 GitHub Authentication

For demo purposes, using public API access.
In production, this would handle OAuth flow.

Current status: ✅ Connected to GitHub API`,
      };

    default:
      return {
        output: `Command not found: ${command}

Available commands: help, auth, user, memories, version
Type 'help' for detailed usage information.`,
        type: "error",
      };
  }
}

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../dist/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Git Memories Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
});
