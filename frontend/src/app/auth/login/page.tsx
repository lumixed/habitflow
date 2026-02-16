'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Shield, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, verify2FA } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2FA states
    const [is2FARequired, setIs2FARequired] = useState(false);
    const [userIdFor2FA, setUserIdFor2FA] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const result = await login(formData.email, formData.password);
            if (result && result.two_factor_required) {
                setIs2FARequired(true);
                setUserIdFor2FA(result.userId || '');
                setIsSubmitting(false);
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
            setIsSubmitting(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await verify2FA(userIdFor2FA, twoFactorToken);
            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid 2FA code');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Back button */}
                    <button
                        onClick={() => is2FARequired ? setIs2FARequired(false) : router.push('/')}
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 transition-colors mb-8 group"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        {is2FARequired ? 'Back to login' : 'Back to home'}
                    </button>

                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-2xl font-black text-neutral-900 uppercase tracking-tight">
                            {is2FARequired ? 'Two-Factor Auth' : 'Welcome Back'}
                        </h1>
                        <p className="mt-2 text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">
                            {is2FARequired ? 'Enter the code from your app' : 'Continue building your habits.'}
                        </p>
                    </div>

                    {!is2FARequired ? (
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
                    ) : (
                        <form onSubmit={handle2FASubmit} className="space-y-5">
                            <div className="flex flex-col items-center gap-6 py-4 bg-neutral-50 border border-neutral-200 rounded-xl">
                                <Shield size={48} className="text-primary-600" />
                                <div className="text-center px-6">
                                    <p className="text-sm font-medium text-neutral-700 mb-2">
                                        Verification Required
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        Please enter the 6-digit code generated by your authenticator app.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="2fa-token" className="block text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1.5">
                                    6-Digit Code
                                </label>
                                <input
                                    type="text"
                                    id="2fa-token"
                                    maxLength={6}
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value)}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-md text-2xl font-bold text-center tracking-[0.5em] text-neutral-900 placeholder-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-all"
                                    placeholder="000000"
                                />
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting || twoFactorToken.length !== 6}
                                className="w-full py-3 bg-neutral-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-md hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isSubmitting ? 'VERIFYING...' : 'VERIFY & LOG IN'}
                            </button>
                        </form>
                    )}

                    {/* Footer */}
                    {!is2FARequired && (
                        <p className="mt-8 text-center text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                            Don't have an account?{' '}
                            <Link href="/auth/signup" className="text-neutral-900 underline hover:no-underline transition-all">
                                Sign up
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Right side - Visual */}
            <div className="hidden lg:flex flex-1 bg-neutral-900 items-center justify-center p-12 relative overflow-hidden">
                <div className="relative z-10 max-w-sm text-center">
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                        Secure your<br />progress
                    </h2>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em] leading-relaxed">
                        HabitFlow uses industry-standard 2FA to keep your data safe.
                    </p>
                </div>
            </div>
        </div>
    );
}
