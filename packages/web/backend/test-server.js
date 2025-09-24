const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working!",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.post("/api/terminal/command", async (req, res) => {
  const { command, args = [] } = req.body;

  console.log("Received command:", command, "args:", args);

  try {
    let result = await executeGitMemoriesCommand(command, args);
    res.json({
      success: true,
      output: result.output,
      type: result.type || "output",
    });
  } catch (error) {
    console.error("Error executing command:", error);
    res.json({
      success: false,
      output: `Error: ${error.message}`,
      type: "error",
    });
  }
});

// Simulate git-memories CLI commands (simplified version)
async function executeGitMemoriesCommand(command, args) {
  switch (command) {
    case "help":
      return {
        output: `Git Memories v1.0.6 - GitHub Contribution History Tool

Available commands:
  help                    - Show this help message
  auth                    - Authenticate with GitHub
  user <username>         - Get user information
  memories <username>     - Get contributions for today across years
  version                 - Show version information
  clear                   - Clear terminal

Examples:
  user octocat            - Get GitHub user info
  memories octocat        - Get today's contributions`,
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

      // Mock user data for testing
      return {
        output: `👤 User: ${args[0]}
📧 GitHub: @${args[0]}
📅 Joined: 2010-01-01
🔗 Profile: https://github.com/${args[0]}`,
      };

    case "memories":
      if (!args[0]) {
        return {
          output:
            "Usage: memories <username> [date]\nExample: memories octocat",
          type: "error",
        };
      }

      // Mock memories data for testing
      return {
        output: `📅 GitHub Memories for ${args[0]} on 1/17

🗓️  2023
  📝 Commits (2):
    • Fix bug in authentication
      📁 ${args[0]}/my-repo
    • Add new feature
      📁 ${args[0]}/awesome-project

🗓️  2022
  🔀 Pull Requests (1):
    • Update documentation [MERGED]
      📁 ${args[0]}/docs`,
      };

    case "auth":
      return {
        output: `🔐 GitHub Authentication

For demo purposes, using public API access.
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

app.listen(PORT, () => {
  console.log(`🚀 Git Memories Backend running on port ${PORT}`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
});
