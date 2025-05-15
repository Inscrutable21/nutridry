/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com'],
    // Use a custom loader in production
    loader: 'custom',
    loaderFile: './src/lib/image-loader.ts',
  },
  // Add environment variables
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000',
  },
}

module.exports = nextConfig
