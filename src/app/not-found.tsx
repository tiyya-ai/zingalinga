export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-gray-600 mb-4">The page you are looking for does not exist.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Return Home
      </a>
    </div>
  );
}