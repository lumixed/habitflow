'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, logout } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-neutral-900">
              Habit<span className="text-primary-500">Flow</span>
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-neutral-600">
                {user.display_name}
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">
            Welcome, {user.display_name}!
          </h2>
          <p className="text-neutral-600 mb-8">
            Your habits dashboard will appear here on Day 3.
          </p>
          <div className="inline-block px-6 py-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-700">
              ✅ Authentication is working! You're logged in with <strong>{user.email}</strong>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
