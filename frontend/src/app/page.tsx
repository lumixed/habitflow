'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-neutral-400">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Logo / Brand */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-neutral-800 tracking-tight">
          Habit<span className="text-primary-500">Flow</span>
        </h1>
        <p className="mt-3 text-lg text-neutral-500 max-w-md mx-auto">
          Build habits that stick. Stay accountable with friends. Track your streaks.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Link
          href="/auth/signup"
          className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors text-center"
        >
          Get Started
        </Link>
        <Link
          href="/auth/login"
          className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-100 transition-colors text-center"
        >
          Log In
        </Link>
      </div>
    </div>
  );
}
