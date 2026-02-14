const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Tells Next.js to produce a standalone build (single server.js file).
    // This is what the Dockerfile expects when it copies .next/standalone.
    output: 'standalone',
    // Expose the API URL to the client
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    },
};

module.exports = withPWA(nextConfig);