'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        display_name: '',
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
        await signup(formData.email, formData.password, formData.display_name);
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
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
                Create your account
                </h1>
                <p className="mt-2 text-neutral-600">
                Start building habits that stick.
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Display Name */}
                <div>
                <label htmlFor="display_name" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Display name
                </label>
                <input
                    type="text"
                    id="display_name"
                    name="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder="Your name"
                />
                </div>

                {/* Email */}
                <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Email address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder="you@example.com"
                />
                </div>

                {/* Password */}
                <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1.5">
                    Password
                </label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-2.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow"
                    placeholder="At least 6 characters"
                />
                </div>

                {/* Error message */}
                {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                </div>
                )}

                {/* Submit button */}
                <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                {isSubmitting ? 'Creating account...' : 'Sign up'}
                </button>
            </form>

            {/* Footer */}
            <p className="mt-6 text-center text-sm text-neutral-600">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Log in
                </Link>
            </p>
            </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 items-center justify-center p-12 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-md text-white">
            <h2 className="text-4xl font-bold mb-4">
                Build consistency,<br />one day at a time
            </h2>
            <p className="text-lg text-primary-100">
                Track your habits, stay accountable with friends, and watch your streaks grow.
            </p>
            </div>
        </div>
        </div>
    );
}
