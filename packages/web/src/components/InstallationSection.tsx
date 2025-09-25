import React, { useState } from "react";

export const InstallationSection: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText("npm install git-memories");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg  p-8">
        {/* Installation Code Snippet */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Quick Install
          </h3>
          <div className="relative">
            <div className="bg-gray-900 rounded-lg border border-gray-700 shadow-lg overflow-hidden">
              {/* Terminal Content */}
              <div className="p-4 font-mono text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400">$</span>
                    <span className="text-gray-300">npm install</span>
                    <span className="text-blue-400">git-memories</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="ml-4 p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-all duration-200 group"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <svg
                        className="w-4 h-4 text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {copied && (
              <div className="absolute -top-2 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-md animate-pulse">
                Copied!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
