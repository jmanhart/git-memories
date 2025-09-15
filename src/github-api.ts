import fetch from "node-fetch";

export interface GitHubUser {
  login: string;
  name: string;
  createdAt: string;
}

export interface GitHubCommit {
  message: string;
  url: string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  pushedDate: string;
}

export interface GitHubPullRequest {
  title: string;
  url: string;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  createdAt: string;
  state: string;
}

export interface Contribution {
  year: number;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
}

export class GitHubAPI {
  private token: string;
  private baseUrl = "https://api.github.com/graphql";

  constructor(token: string) {
    this.token = token;
  }

  async getUser(username: string): Promise<GitHubUser> {
    const query = `
      query GetUser($username: String!) {
        user(login: $username) {
          login
          name
          createdAt
        }
      }
    `;

    const response = await this.makeRequest(query, { username });
    return response.user;
  }

  async getContributionsOnDate(
    username: string,
    month: number,
    day: number,
    startYear: number,
    endYear: number
  ): Promise<Contribution[]> {
    const contributions: Contribution[] = [];

    console.log(
      `🔍 Multi-API approach: Finding contributions on ${month}/${day}`
    );

    // Strategy 1: Get user's repositories with creation/update dates (lightweight)
    const repos = await this.getUserRepositoriesWithDates(username);
    console.log(`📁 Found ${repos.length} repositories`);

    // Strategy 2: Check which repos were active on this date across years
    const activeReposByYear = this.findActiveReposOnDate(
      repos,
      month,
      day,
      startYear,
      endYear
    );

    // Strategy 3: For each year with active repos, get commit details efficiently
    for (const [year, activeRepos] of Object.entries(activeReposByYear)) {
      if (activeRepos.length > 0) {
        console.log(
          `📅 ${year}: Checking ${activeRepos.length} active repositories`
        );

        try {
          const yearContributions = await this.getContributionsFromActiveRepos(
            username,
            parseInt(year),
            month,
            day,
            activeRepos
          );

          if (
            yearContributions.commits.length > 0 ||
            yearContributions.pullRequests.length > 0
          ) {
            contributions.push(yearContributions);
          }
        } catch (error) {
          console.warn(`Failed to get contributions for ${year}:`, error);
        }
      }
    }

    return contributions;
  }

  private async getUserRepositoriesWithDates(username: string): Promise<any[]> {
    // Get repositories with creation and update dates (lightweight API call)
    const url = `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const repos = (await response.json()) as any[];

    // Add computed date ranges for each repo
    return repos.map((repo) => ({
      ...repo,
      createdYear: new Date(repo.created_at).getFullYear(),
      updatedYear: new Date(repo.updated_at).getFullYear(),
      pushedYear: new Date(repo.pushed_at).getFullYear(),
    }));
  }

  private findActiveReposOnDate(
    repos: any[],
    month: number,
    day: number,
    startYear: number,
    endYear: number
  ): Record<number, any[]> {
    const activeReposByYear: Record<number, any[]> = {};

    // For each year, find repos that were active around this date
    for (let year = startYear; year <= endYear; year++) {
      const activeRepos = repos.filter((repo) => {
        // Check if repo was created before or during this year
        const wasCreatedBefore = repo.createdYear <= year;

        // Check if repo was updated during or after this year
        const wasUpdatedAfter = repo.updatedYear >= year;

        // Check if repo was pushed to during or after this year
        const wasPushedAfter = repo.pushedYear >= year;

        // Repo was potentially active if it existed and had recent activity
        return wasCreatedBefore && (wasUpdatedAfter || wasPushedAfter);
      });

      if (activeRepos.length > 0) {
        activeReposByYear[year] = activeRepos.slice(0, 10); // Limit to 10 most active repos per year
      }
    }

    return activeReposByYear;
  }

  private async getContributionsFromActiveRepos(
    username: string,
    year: number,
    month: number,
    day: number,
    activeRepos: any[]
  ): Promise<Contribution> {
    const commits: GitHubCommit[] = [];
    const pullRequests: GitHubPullRequest[] = [];

    const targetDate = new Date(year, month - 1, day);
    const nextDay = new Date(year, month - 1, day + 1);

    // Check each active repo for commits on this specific date
    for (const repo of activeRepos) {
      try {
        // Use the commits API with date filtering (more efficient than events)
        const repoCommits = await this.getCommitsForRepoOnDate(
          username,
          repo.name,
          targetDate,
          nextDay
        );
        commits.push(...repoCommits);

        // Only check PRs if we found commits (to reduce API calls)
        if (repoCommits.length > 0) {
          const repoPRs = await this.getPullRequestsForRepoOnDate(
            username,
            repo.name,
            targetDate,
            nextDay
          );
          pullRequests.push(...repoPRs);
        }

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (error) {
        console.warn(`Failed to check ${repo.name}:`, error);
      }
    }

    return {
      year,
      commits,
      pullRequests,
    };
  }

  private async getCommitsForRepoOnDate(
    username: string,
    repoName: string,
    startDate: Date,
    endDate: Date
  ): Promise<GitHubCommit[]> {
    const url = `https://api.github.com/repos/${username}/${repoName}/commits?since=${startDate.toISOString()}&until=${endDate.toISOString()}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const commits = (await response.json()) as any[];
    return commits.map((commit: any) => ({
      message: commit.commit.message,
      url: commit.html_url,
      repository: {
        name: repoName,
        owner: {
          login: username,
        },
      },
      pushedDate: commit.commit.author.date,
    }));
  }

  private async getPullRequestsForRepoOnDate(
    username: string,
    repoName: string,
    startDate: Date,
    endDate: Date
  ): Promise<GitHubPullRequest[]> {
    const url = `https://api.github.com/repos/${username}/${repoName}/pulls?state=all&since=${startDate.toISOString()}&per_page=100`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const prs = (await response.json()) as any[];
    return prs
      .filter((pr: any) => {
        const prDate = new Date(pr.created_at);
        return prDate >= startDate && prDate < endDate;
      })
      .map((pr: any) => ({
        title: pr.title,
        url: pr.html_url,
        repository: {
          name: repoName,
          owner: {
            login: username,
          },
        },
        createdAt: pr.created_at,
        state: pr.state.toUpperCase(),
      }));
  }

  private async getAllUserEvents(username: string): Promise<any[]> {
    // Get multiple pages of events to get more historical data
    const allEvents: any[] = [];
    let page = 1;
    const maxPages = 30; // Increased to get more historical data

    console.log(`📊 Fetching events for ${username}...`);

    while (page <= maxPages) {
      try {
        const url = `https://api.github.com/users/${username}/events/public?per_page=100&page=${page}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: "application/vnd.github.v3+json",
          },
        });

        if (!response.ok) {
          break; // Stop if we hit an error
        }

        const events = (await response.json()) as any[];
        if (events.length === 0) {
          break; // No more events
        }

        allEvents.push(...events);

        // Show progress
        if (page % 5 === 0) {
          console.log(
            `📄 Fetched ${page} pages (${allEvents.length} events so far)...`
          );
        }

        page++;

        // Add a small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.warn(`Failed to fetch page ${page}:`, error);
        break;
      }
    }

    console.log(`✅ Total events fetched: ${allEvents.length}`);

    // Show date range
    if (allEvents.length > 0) {
      const oldestEvent = allEvents[allEvents.length - 1];
      const newestEvent = allEvents[0];
      const oldestDate = new Date(oldestEvent.created_at);
      const newestDate = new Date(newestEvent.created_at);
      console.log(
        `📅 Date range: ${oldestDate.toDateString()} to ${newestDate.toDateString()}`
      );
    }

    return allEvents;
  }

  private groupEventsByYear(events: any[]): Record<number, any[]> {
    const eventsByYear: Record<number, any[]> = {};

    events.forEach((event) => {
      const year = new Date(event.created_at).getFullYear();
      if (!eventsByYear[year]) {
        eventsByYear[year] = [];
      }
      eventsByYear[year].push(event);
    });

    return eventsByYear;
  }

  private filterEventsByDate(
    events: any[],
    year: number,
    month: number,
    day: number
  ): any[] {
    const targetDate = new Date(year, month - 1, day);
    const nextDay = new Date(year, month - 1, day + 1);

    return events.filter((event) => {
      const eventDate = new Date(event.created_at);
      return eventDate >= targetDate && eventDate < nextDay;
    });
  }

  private processEventsToContributions(
    events: any[],
    year: number
  ): Contribution {
    const commits: GitHubCommit[] = [];
    const pullRequests: GitHubPullRequest[] = [];

    events.forEach((event) => {
      if (event.type === "PushEvent") {
        event.payload.commits?.forEach((commit: any) => {
          commits.push({
            message: commit.message,
            url: `https://github.com/${event.repo.name}/commit/${commit.sha}`,
            repository: {
              name: event.repo.name.split("/")[1],
              owner: {
                login: event.repo.name.split("/")[0],
              },
            },
            pushedDate: event.created_at,
          });
        });
      } else if (event.type === "PullRequestEvent") {
        pullRequests.push({
          title: event.payload.pull_request.title,
          url: event.payload.pull_request.html_url,
          repository: {
            name: event.repo.name.split("/")[1],
            owner: {
              login: event.repo.name.split("/")[0],
            },
          },
          createdAt: event.created_at,
          state: event.payload.pull_request.state.toUpperCase(),
        });
      }
    });

    return {
      year,
      commits,
      pullRequests,
    };
  }

  private async makeRequest(query: string, variables: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    const data = (await response.json()) as any;

    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    return data.data;
  }
}
