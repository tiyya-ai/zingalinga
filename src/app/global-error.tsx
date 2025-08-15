'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🚨</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Error</h2>
            <p className="text-gray-600 mb-6">Something went wrong!</p>
            <button
              onClick={reset}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}