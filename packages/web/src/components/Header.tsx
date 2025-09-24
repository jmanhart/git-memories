import React from "react";

export const Header: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-2">git-memories</h1>
      <p className="text-lg text-gray-600">
        See your past GitHub contributions on this day throughout the years
      </p>
    </div>
  );
};
