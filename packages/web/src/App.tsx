import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌱 Git Memories
          </h1>
          <p className="text-lg text-gray-600">
            See your GitHub contributions on this day throughout the years
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Welcome to Git Memories!
            </h2>
            
            <p className="text-gray-600 mb-6">
              This is a simple foundation for the Git Memories web app. 
              We'll build up the functionality step by step.
            </p>

            {/* Simple Counter Demo */}
            <div className="text-center">
              <p className="text-gray-700 mb-4">
                Here's a simple counter to test that everything is working:
              </p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setCount(count - 1)}
                  className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  -
                </button>
                <span className="text-2xl font-bold text-gray-900 min-w-[3rem]">
                  {count}
                </span>
                <button
                  onClick={() => setCount(count + 1)}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                ✅ React + Vite + Tailwind CSS is working!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with React, Vite, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  )
}

export default App