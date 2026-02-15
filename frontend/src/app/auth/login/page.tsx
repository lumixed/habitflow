'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login(formData.email, formData.password);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Back to home */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-8 group"
                    >
                        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to home
                    </Link>

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                            Welcome Back
                        </h1>
                        <p className="mt-2 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                            Continue building your habits.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                                Email address
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                                placeholder="YOU@EXAMPLE.COM"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-md text-sm text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-transparent transition-all"
                                placeholder="YOUR PASSWORD"
                            />
                        </div>

                        {/* Error message */}
                        {error && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                {error}
                                <div className="mt-2 text-[8px] opacity-50 uppercase">
                                    Target: 192.168.1.85:3001
                                </div>
                            </div>
                        )}

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isSubmitting ? 'LOGGING IN...' : 'LOG IN'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                        Don't have an account?{' '}
                        <Link href="/auth/signup" className="text-neutral-900 underline hover:no-underline transition-all">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12 relative overflow-hidden">
                {/* Content */}
                <div className="relative z-10 max-w-sm text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                        Your habits are<br />waiting for you
                    </h2>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] leading-relaxed">
                        Pick up where you left off.
                    </p>
                </div>
            </div>
        </div>
    );
}
