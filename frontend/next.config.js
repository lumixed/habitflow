/** @type {import('next').NextConfig} */
const nextConfig = {
    // Tells Next.js to produce a standalone build (single server.js file).
    // This is what the Dockerfile expects when it copies .next/standalone.
    output: 'standalone',
    // Expose the API URL to the client
    env: {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    },
    // Disable the "X-Powered-By: Next.js" header in production
    poweredBy: false,
  };
  
  module.exports = nextConfig;
  