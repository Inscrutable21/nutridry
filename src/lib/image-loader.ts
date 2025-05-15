export default function customImageLoader({ src, width, quality }: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Handle absolute URLs (external images)
  if (src.startsWith('http')) {
    return src;
  }
  
  // Handle relative URLs (local images)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
  
  // If src starts with a slash, it's a local image
  if (src.startsWith('/')) {
    // For placeholder images, use a static path instead of the image optimization API
    if (src.includes('placeholder')) {
      return `${baseUrl}${src}`;
    }
    
    // For other local images, use the Next.js Image Optimization API
    return `${baseUrl}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
  }
  
  // If we get here, just return the src as-is
  return src;
}