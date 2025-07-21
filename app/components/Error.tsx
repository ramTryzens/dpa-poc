export function ErrorBoundary() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
      <h1 className="text-5xl font-bold text-red-600 mb-4">500</h1>
      <h2 className="text-2xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">
        An unexpected error occurred on the server. Please try again later.
      </p>
      <a
        href="/"
        className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Go Home
      </a>
    </div>
  );
}
