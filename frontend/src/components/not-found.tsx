import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="text-center">
            <h1 className="text-6xl font-bold text-neutral-900 mb-2">404</h1>
            <h2 className="text-2xl font-semibold text-neutral-700 mb-4">Page not found</h2>
            <p className="text-neutral-500 mb-8 max-w-md">
            The page you're looking for doesn't exist or has been moved.
            </p>
            <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors"
            >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
            </Link>
        </div>
        </div>
    );
}
