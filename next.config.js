/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', 
      'images.unsplash.com',
      'cdn.jsdelivr.net'
    ],
    unoptimized: true,
  },
  // Add environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
  // Add output configuration for better deployment
  output: 'standalone',
  // Increase build memory limit
  experimental: {
    memoryBasedWorkersCount: true,
  },
  // Disable type checking during build to reduce memory usage
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Disable ESLint during build to reduce memory usage
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
