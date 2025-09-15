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

1. **Get a GitHub Personal Access Token**:

   - Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
   - Generate a new token with `repo` scope (for private repos) or `public_repo` scope (for public repos only)

2. **Create a `.env` file** in your project directory:

   ```bash
   cp env.example .env
   ```

3. **Add your token** to the `.env` file:
   ```
   GITHUB_TOKEN=your_github_token_here
   ```

## Usage

```bash
git-memories
```

The tool will:

1. Ask for your GitHub username
2. Fetch your account creation date to determine how far back to look
3. Show all your contributions on today's date throughout the years
4. Display commits and pull requests grouped by repository

## Example Output

```
🌱 git-memories

? What's your GitHub username? octocat
⏳ Fetching your contributions... ✓ Contributions fetched!

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

# Build for production
npm run build

# Run the built version
npm start
```

## Requirements

- Node.js 18.0.0 or higher
- GitHub Personal Access Token

---

# The Journey: From "Hey Computer Do This" to Vibe Coding 🧠

_This section documents the real development journey - how human intuition guided AI through the problem-solving process._

## The Initial Vision

**Human**: "I want a CLI tool that shows my GitHub contributions on this day throughout the years. It should be fun and use @clack/prompts for beautiful CLI experience."

**AI**: _Immediately jumps to implementation_ - Creates a basic structure with TypeScript, sets up GitHub API integration, builds a formatter. Classic "computer thinking" - let's build it and see what happens.

## The First Reality Check

**Human**: "Why is there an npm run dev? I was expecting I would just run `git-memories` and the CLI would handle all the messaging."

**AI**: _Confused_ - "The dev script is for development, not end users..."

**Human**: "No, I want the CLI to handle everything internally. The user just runs `git-memories`."

**AI**: _Lightbulb moment_ - Oh! The CLI should be self-contained. The dev script is just for building the tool, not for users.

_Lesson: Human context matters. What seems obvious to a developer isn't obvious to an AI without proper framing._

## The Authentication Challenge

**Human**: "How do I get a GitHub token? What settings should I set?"

**AI**: _Provides detailed step-by-step instructions_ - Goes to GitHub settings, explains scopes, shows exactly what to click.

**Human**: _Follows instructions, gets token working_

_Lesson: Sometimes the human needs to be guided through the setup process, even if the AI thinks it's obvious._

## The First Major Problem: API Limitations

**AI**: _Implements GraphQL approach_ - Uses GitHub's contribution graph API, tries to fetch historical data.

**Result**: GraphQL errors, schema issues, nothing works.

**Human**: "I know I have contributions on this day going back years. Why can't it find them?"

**AI**: _Realizes the issue_ - "The GitHub Events API only returns recent events, not historical data."

**Human**: "Why can it not work like this: Set the date, check those dates for contributions, list out the repos and commits? Why?"

**AI**: _Defensive_ - "The API has limitations..."

_Lesson: When the human says "I know this should work," listen. They're usually right about the expected behavior._

## The Over-Engineering Trap

**AI**: _Tries multiple approaches_ - Events API, GraphQL API, repository-by-repository checking. Makes hundreds of API calls, gets rate limited, still doesn't work.

**Human**: "This is making too many API calls. It's getting stuck."

**AI**: _Adds rate limiting, reduces API calls_ - Still doesn't solve the fundamental problem.

**Human**: "Could you use a combination of a few different APIs to make it work instead of a one-size-fits-all? Like maybe you check the repo's dates but not do a full request. I don't know, think outside the box on this."

_Lesson: The human is pushing for creative problem-solving. They see the pattern the AI is missing._

## The Breakthrough: Multi-API Strategy

**AI**: _Finally gets it_ - "Oh! I can use the repository API to get creation/update dates, then only check commits for repos that were actually active in each year!"

**Human**: _Tests it_ - "How many API calls was that?"

**AI**: _Calculates_ - "49 API calls instead of 351. 86% reduction!"

**Human**: _Sees results_ - "SUCCESS! It found my contributions from 2018 and 2023!"

_Lesson: The human's intuition about "thinking outside the box" led to the right solution. Sometimes you need to combine multiple approaches instead of forcing one to work._

## The Vibe Coding Mindset

This journey illustrates the difference between **computer thinking** and **vibe coding**:

### Computer Thinking 🤖

- "Let me implement this API endpoint"
- "I'll add error handling and rate limiting"
- "The documentation says this should work"
- "I need to optimize the algorithm"

### Vibe Coding 🧠

- "I know this should work because I've seen it work"
- "What if we tried a different approach?"
- "Think outside the box"
- "Use multiple tools together instead of forcing one to do everything"

## Key Insights

1. **Human intuition is valuable** - When the human says "I know this should work," they're usually right about the expected behavior.

2. **Context matters** - The AI needed to understand the user's mental model, not just the technical requirements.

3. **Creative problem-solving** - Sometimes the solution isn't to fix the current approach, but to try a completely different strategy.

4. **Iterative refinement** - Each failure taught us something about the problem space.

5. **The human as coach** - The human had to guide the AI through the problem-solving process, asking the right questions and pushing for creative solutions.

## The Final Result

What started as a simple "build me a CLI tool" became a journey of:

- Understanding user expectations
- Debugging API limitations
- Creative problem-solving
- Multi-API strategy
- Efficient resource usage

The final solution uses **49 API calls** instead of **351**, goes back to **2016** (account creation), and actually finds real historical contributions. All because the human kept pushing for "thinking outside the box" and the AI finally listened.

_This is why vibe coding requires a vibe mind - sometimes you need human intuition to guide the technical implementation._

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
