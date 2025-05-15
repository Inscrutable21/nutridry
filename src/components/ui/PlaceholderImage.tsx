import React from 'react';

interface PlaceholderImageProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function PlaceholderImage({ 
  className = "w-full h-full", 
  width = 300, 
  height = 300 
}: PlaceholderImageProps) {
  return (
    <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
      <svg 
        width={width} 
        height={height} 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 text-gray-300"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
        <path d="M21 15L16 10L5 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}