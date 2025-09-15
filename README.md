# git-memories 🌱

A fun CLI tool to see your GitHub contributions on this day throughout the years. Reminisce about your coding journey and see what you were working on in years past!

## Features

- 🕰️ **Time Travel**: See your contributions on this exact date across all years
- 🎨 **Beautiful CLI**: Powered by @clack/prompts for a polished experience
- 📊 **Rich Data**: View commits and pull requests grouped by repository
- 🎯 **Smart Filtering**: Automatically detects your account creation date
- 💫 **Fun Messages**: Enjoy delightful messages when you have no contributions

## Installation

```bash
npm install -g git-memories
```

## Setup

**No setup required!** 🎉

The CLI will guide you through authentication on first run:

1. **First time users**: The CLI will ask you to link your GitHub account
2. **OAuth Flow**: If configured, opens browser for seamless GitHub authorization
3. **Fallback**: If OAuth isn't configured, guides you through creating a Personal Access Token
4. **Automatic storage**: Your token is securely stored in `~/.git-memories/token.json`
5. **Future runs**: The CLI remembers your authentication and works instantly

### Authentication

The CLI uses GitHub OAuth for seamless authentication:

1. **OAuth Flow**: Opens browser for GitHub authorization
2. **GitHub CLI**: Uses existing GitHub CLI authentication if available
3. **Manual Token**: Fallback to guided token creation if needed

## Usage

```bash
git-memories
```

The tool will:

1. **First run**: Guide you through GitHub authentication
2. **Subsequent runs**: Use stored authentication automatically
3. Fetch your account creation date to determine how far back to look
4. Show all your contributions on today's date throughout the years
5. Display commits and pull requests grouped by repository

### Commands

- `git-memories` - Show your contributions on today's date
- `git-memories --test` - Run with mock data (no authentication needed)
- `git-memories --auth-setup` - Show mock data for a new user scenario
- `git-memories --no-entries` - Show mock data with no contributions
- `git-memories --logout` - Remove stored authentication
- `git-memories --help` - Show help message with all available options

### Mock Scenarios

The tool includes several mock scenarios for testing and demonstration:

- **`--test`**: Shows random mock contributions across multiple years (default test mode)
- **`--auth-setup`**: Simulates a new GitHub user with their first contributions (initial commit, README, first PR)
- **`--no-entries`**: Shows what the tool displays when there are no contributions on the current date

These scenarios are perfect for:

- Testing the tool without GitHub authentication
- Demonstrating the tool to others
- Seeing different UI states and messages

## Example Output

### Normal Mode (with GitHub Authentication)

```
🌱 git-memories

🔐 GitHub Authentication
? Link your GitHub account to get started? Yes

⏳ Setting up authentication... ✓ Opening GitHub in your browser...
✓ Authentication successful! ✅

⏳ Fetching your contributions... ✓ Contributions fetched!
```

### Test Mode (with Mock Data)

```
🌱 git-memories
🧪 Running in test mode with mock data...

⏳ Generating mock contributions... ✓ Mock contributions generated!

🌱 Your contributions on September 14 throughout the years:

📅 2025
────────────────────
  📁 test-repo-1
    💚 Add dark mode support
    ✅ PR: Optimize performance

  📁 test-repo-2
    💚 Fix bug in user authentication

📅 2024
────────────────────
  📁 test-repo-1
    💚 Improve accessibility
    ❌ PR: Fix bug in user authentication

  📁 test-repo-2
    💚 Add unit tests

Thanks for the memories! 🎉 (Test Mode)
```

### Sample Output (Normal Mode)

```
🌱 Your contributions on December 15 throughout the years:

📅 2023
────────────────────
📁 my-awesome-project
💚 Fix bug in user authentication
✅ PR: Add new feature for better UX

📅 2022
────────────────────
📁 another-project
💚 Update dependencies
🔄 PR: Refactor component structure

Thanks for the memories! 🎉

```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Test with mock data (no authentication needed)
npm run dev -- --test

# Build for production
npm run build

# Run the built version
npm start
```

### Testing

Use the `--test` flag to run the CLI with mock data:

```bash
npm run dev -- --test
```

This generates realistic mock contributions for testing without requiring GitHub authentication.`

## Requirements

- Node.js 18.0.0 or higher
- GitHub Personal Access Token

---

```

```
