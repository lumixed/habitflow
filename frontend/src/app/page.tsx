'use client';

import { useEffect, useState } from 'react';

export default function HomePage() {
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  useEffect(() => {
    const checkApi = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`);
        if (res.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('error');
        }
      } catch {
        setApiStatus('error');
      }
    };

    checkApi();
  }, []);

  const statusColor =
    apiStatus === 'connected'
      ? 'bg-success-500'
      : apiStatus === 'error'
      ? 'bg-red-500'
      : 'bg-neutral-400 animate-pulse';

  const statusText =
    apiStatus === 'connected'
      ? 'Backend connected'
      : apiStatus === 'error'
      ? 'Backend unreachable'
      : 'Checking backend...';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
        
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold text-neutral-800 tracking-tight">
          Habit<span className="text-primary-500">Flow</span>
        </h1>
        <p className="mt-3 text-lg text-neutral-500 max-w-md mx-auto">
          Build habits that stick. Stay accountable with friends. Track your streaks.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button className="flex-1 px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors">
          Get Started
        </button>
        <button className="flex-1 px-6 py-3 border border-neutral-300 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-100 transition-colors">
          Log In
        </button>
      </div>

      <div className="mt-16 flex items-center gap-2 text-sm text-neutral-400">
        <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
        <span>{statusText}</span>
      </div>
    </div>
  );
}
