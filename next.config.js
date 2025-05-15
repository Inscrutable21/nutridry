/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'res.cloudinary.com', 
      'images.unsplash.com',
      'cdn.jsdelivr.net' // Add jsdelivr to domains
    ],
    // Set unoptimized to true for all environments to fix SVG issues
    unoptimized: true,
    // Remove custom loader as it's causing issues
    // loader: 'custom',
    // loaderFile: './src/lib/image-loader.ts',
  },
  // Add environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
}

module.exports = nextConfig
