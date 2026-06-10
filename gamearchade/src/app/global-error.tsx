"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-400 mb-6">{error.message || "An unexpected error occurred."}</p>
            <button
              onClick={() => reset()}
              className="px-6 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
