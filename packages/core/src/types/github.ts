/**
 * GitHub API Types
 *
 * Type definitions for GitHub API responses and data structures
 */

export interface GitHubUser {
  login: string;
  name: string;
  createdAt: string;
}

export interface GitHubRepository {
  name: string;
  owner: {
    login: string;
  };
  created_at: string;
  updated_at: string;
  pushed_at: string;
  createdYear: number;
  updatedYear: number;
  pushedYear: number;
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
  state: "OPEN" | "CLOSED" | "MERGED";
}

export interface Contribution {
  year: number;
  commits: GitHubCommit[];
  pullRequests: GitHubPullRequest[];
}

export interface GitHubAPIResponse<T> {
  data: T;
  errors?: Array<{
    message: string;
    type: string;
  }>;
}
