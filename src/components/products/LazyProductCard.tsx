'use client'

import { useInView } from 'react-intersection-observer';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { useEffect, useState } from 'react';

export default function LazyProductCard({ product }: { product: Product }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px 0px', // Start loading when product is 200px from viewport
  });
  
  // Check for dark mode
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  useEffect(() => {
    // Check initial color scheme
    if (typeof window !== 'undefined') {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      // Listen for changes in color scheme
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsDarkMode(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);
  
  return (
    <div ref={ref} className="h-full">
      {inView ? (
        <ProductCard product={product} />
      ) : (
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-lg h-80 animate-pulse flex flex-col transition-colors duration-200`}>
          <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-48 rounded-t-lg transition-colors duration-200`}></div>
          <div className="p-4 flex-1 flex flex-col">
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-4 w-3/4 mb-2 rounded transition-colors duration-200`}></div>
            <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-4 w-1/2 mb-4 rounded transition-colors duration-200`}></div>
            <div className="mt-auto">
              <div className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'} h-6 w-1/3 rounded transition-colors duration-200`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



