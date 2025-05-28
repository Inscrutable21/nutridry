'use client'

import { useInView } from 'react-intersection-observer';
import ProductCard from './ProductCard';
import { Product } from '@/types';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function LazyProductCard({ product, index = 0 }: { product: Product, index?: number }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px 0px', // Start loading when product is 200px from viewport
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check for dark mode
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    
    // Add listener for theme changes
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);
  
  // Staggered appearance effect
  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, index * 150); // Stagger by 150ms per item
      
      return () => clearTimeout(timer);
    }
  }, [inView, index]);
  
  return (
    <div ref={ref} className="h-full">
      {inView ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <ProductCard product={product} />
        </motion.div>
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




