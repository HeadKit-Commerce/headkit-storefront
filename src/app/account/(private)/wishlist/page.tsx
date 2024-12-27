"use client";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center py-8">
            Your wishlist is currently empty.
          </p>
        </div>
      </div>
    </div>
  );
} 