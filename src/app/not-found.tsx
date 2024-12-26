import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-5 md:px-10 my-10">
      <h1 className="font-extrabold text-6xl text-purple-800 mb-4">404</h1>
      <h2 className="font-bold text-2xl text-gray-700 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 text-center max-w-md">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link 
        href="/" 
        className="px-6 py-3 bg-purple-800 text-white rounded-md hover:bg-purple-900 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
