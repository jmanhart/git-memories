import React from "react";
import { GitCommit, GitPullRequest, Folder } from "lucide-react";

/**
 * Results Component Props
 */
export interface ResultsProps {
  /** The raw results text from the API */
  results: string;
  /** Whether the component is currently processing */
  isProcessing?: boolean;
  /** Any error message to display */
  error?: string;
  /** Username that was searched */
  username?: string;
}

/**
 * Results Component
 *
 * Displays GitHub contribution results in a web-styled format.
 * This allows for full CSS styling, animations, and modern web design
 * instead of being constrained by terminal formatting.
 */
export const Results: React.FC<ResultsProps> = ({
  results,
  isProcessing = false,
  error,
  username,
}) => {
  // ===== PROCESSING STATE =====

  if (isProcessing) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
          {/* Minimal Header */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800">
              Searching {username} over the past 10 years
            </h2>
          </div>

          {/* Content - fun spinner */}
          <div className="flex items-center justify-center py-8">
            <div className="relative">
              {/* Outer spinning ring */}
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
                <div className="absolute top-0 left-0 w-4 h-4 bg-blue-500 rounded-full"></div>
              </div>
              {/* Inner pulsing dot */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ERROR STATE =====

  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== NO RESULTS STATE =====

  if (!results) {
    return null;
  }

  // ===== PARSE RESULTS =====

  /**
   * Parse the raw results text into structured data
   */
  const parseResults = (rawResults: string) => {
    const lines = rawResults.split("\n");
    const contributions: Array<{
      year: string;
      date: string;
      commits: Array<{
        repo: string;
        message: string;
        time: string;
        url: string;
        stats: {
          additions: number;
          deletions: number;
          total: number;
        };
      }>;
      pullRequests: Array<{
        repo: string;
        title: string;
        state: string;
        time: string;
        url: string;
      }>;
    }> = [];

    let currentContribution: any = null;
    let currentRepo = "";
    let inCommits = false;
    let inPullRequests = false;

    for (const line of lines) {
      const trimmed = line.trim();

      // Year header
      if (trimmed.startsWith("🗓️")) {
        const match = trimmed.match(/🗓️\s+(\d+)\s+-\s+(.+)/);
        if (match) {
          currentContribution = {
            year: match[1],
            date: match[2],
            commits: [],
            pullRequests: [],
          };
          contributions.push(currentContribution);
        }
      }
      // Commits section
      else if (trimmed.startsWith("📝 Commits")) {
        inCommits = true;
        inPullRequests = false;
      }
      // Pull requests section
      else if (trimmed.startsWith("🔀 Pull Requests")) {
        inCommits = false;
        inPullRequests = true;
      }
      // Repository header
      else if (trimmed.startsWith("📁")) {
        currentRepo = trimmed.replace("📁 ", "");
      }
      // Commit line
      else if (trimmed.startsWith("•") && inCommits && currentContribution) {
        const match = trimmed.match(/•\s+(.+?)\s+\((.+?)\)(?:\s+\((.+?)\))?/);
        if (match) {
          // Find the URL in the next line
          const urlLine = lines[lines.indexOf(line) + 1];
          const urlMatch = urlLine?.match(/🔗\s+(.+)/);

          // Parse stats if available
          let stats = { additions: 0, deletions: 0, total: 0 };
          if (match[3]) {
            const statsMatch = match[3].match(/\+(\d+)\s+-(\d+)/);
            if (statsMatch) {
              stats = {
                additions: parseInt(statsMatch[1]),
                deletions: parseInt(statsMatch[2]),
                total: parseInt(statsMatch[1]) + parseInt(statsMatch[2]),
              };
            }
          }

          currentContribution.commits.push({
            repo: currentRepo,
            message: match[1],
            time: match[2],
            url: urlMatch ? urlMatch[1] : "",
            stats,
          });
        }
      }
      // Pull request line
      else if (
        trimmed.startsWith("•") &&
        inPullRequests &&
        currentContribution
      ) {
        const match = trimmed.match(/•\s+(.+?)\s+\[(.+?)\]\s+\((.+?)\)/);
        if (match) {
          // Find the URL in the next line
          const urlLine = lines[lines.indexOf(line) + 1];
          const urlMatch = urlLine?.match(/🔗\s+(.+)/);

          currentContribution.pullRequests.push({
            repo: currentRepo,
            title: match[1],
            state: match[2],
            time: match[3],
            url: urlMatch ? urlMatch[1] : "",
          });
        }
      }
    }

    return contributions;
  };

  const contributions = parseResults(results);

  // ===== RENDER =====

  return (
    <div className="w-full max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg border border-gray-300 p-6">
        {/* Minimal Header */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800">
            Contributions for {username} on{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })}{" "}
            across the years
          </h2>
        </div>

        {/* Content */}
        <div>
          {contributions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No contributions found
              </h3>
              <p className="text-gray-500">
                No contributions were found for this date across the years.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {contributions.map((contribution, index) => (
                <div
                  key={index}
                  className="border border-gray-300 rounded-lg p-6 bg-gray-50"
                >
                  {/* Year Header */}
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {contribution.year}
                    </div>
                    <div className="text-gray-600">{contribution.date}</div>
                  </div>

                  {/* Commits */}
                  {contribution.commits.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GitCommit className="w-5 h-5 text-green-500 mr-2" />
                        Commits ({contribution.commits.length})
                      </h4>

                      {/* Group commits by repository */}
                      {Object.entries(
                        contribution.commits.reduce((acc, commit) => {
                          if (!acc[commit.repo]) acc[commit.repo] = [];
                          acc[commit.repo].push(commit);
                          return acc;
                        }, {} as Record<string, typeof contribution.commits>)
                      ).map(([repo, commits]) => (
                        <div key={repo} className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Folder className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm text-gray-700">
                              {repo}
                            </span>
                          </div>
                          <div className="ml-6 space-y-2">
                            {commits.map((commit, commitIndex) => (
                              <div
                                key={commitIndex}
                                className="p-3 bg-white rounded border border-gray-300"
                              >
                                <p className="text-gray-900 font-medium">
                                  {commit.message}
                                </p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <span className="text-xs text-gray-600">
                                    {commit.time}
                                  </span>
                                  {commit.stats.total > 0 && (
                                    <div className="flex items-center space-x-1 text-xs">
                                      <span className="text-green-600">
                                        +{commit.stats.additions}
                                      </span>
                                      <span className="text-gray-400">•</span>
                                      <span className="text-red-600">
                                        -{commit.stats.deletions}
                                      </span>
                                    </div>
                                  )}
                                  {commit.url && (
                                    <a
                                      href={commit.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:text-blue-800"
                                    >
                                      View on GitHub →
                                    </a>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pull Requests */}
                  {contribution.pullRequests.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <GitPullRequest className="w-5 h-5 text-purple-500 mr-2" />
                        Pull Requests ({contribution.pullRequests.length})
                      </h4>

                      {/* Group PRs by repository */}
                      {Object.entries(
                        contribution.pullRequests.reduce((acc, pr) => {
                          if (!acc[pr.repo]) acc[pr.repo] = [];
                          acc[pr.repo].push(pr);
                          return acc;
                        }, {} as Record<string, typeof contribution.pullRequests>)
                      ).map(([repo, prs]) => (
                        <div key={repo} className="mb-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <Folder className="w-4 h-4 text-gray-500" />
                            <span className="font-mono text-sm text-gray-700">
                              {repo}
                            </span>
                          </div>
                          <div className="ml-6 space-y-2">
                            {prs.map((pr, prIndex) => (
                              <div
                                key={prIndex}
                                className="flex items-start space-x-3 p-3 bg-white  rounded border border-gray-300 "
                              >
                                <div
                                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                                    pr.state === "MERGED"
                                      ? "bg-green-500"
                                      : pr.state === "CLOSED"
                                      ? "bg-red-500"
                                      : "bg-yellow-500"
                                  }`}
                                ></div>
                                <div className="flex-1">
                                  <p className="text-gray-900 font-medium">
                                    {pr.title}
                                  </p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        pr.state === "MERGED"
                                          ? "bg-green-100 text-green-800"
                                          : pr.state === "CLOSED"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {pr.state}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      {pr.time}
                                    </span>
                                    {pr.url && (
                                      <a
                                        href={pr.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                      >
                                        View on GitHub →
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
