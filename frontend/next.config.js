const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
    disable: process.env.NODE_ENV === 'development' || process.env.STATIC_BUILD === 'true'
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Standalone output for Docker or static export for Capacitor
    output: process.env.STATIC_BUILD === 'true' ? 'export' : 'standalone',
    images: {
        unoptimized: true,
    },
    // Expose the API URL to the client
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.85:3001',
    },
};

module.exports = withPWA(nextConfig);