'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

const certificationBadges = [
  {
    id: 1,
    name: "100% Pure",
    image: "/pure-badge.jpg", // Image 5 - 100% Pure green stamp
  },
  {
    id: 2,
    name: "No Additives",
    image: "/no-additives-badge.jpg", // Image 6 - No Additives green badge
  },
  {
    id: 3,
    name: "Halal",
    image: "/halal-badge.jpg", // Image 1 - Halal green certification
  },
  {
    id: 4,
    name: "No Preservatives",
    image: "/no-preservatives-badge.jpg", // Image 2 - No Preservatives stamp
  },
  {
    id: 5,
    name: "Gluten Free",
    image: "/gluten-free-badge.jpg", // Image 3 - Gluten Free with grain symbol
  },
  {
    id: 6,
    name: "100% Vegan",
    image: "/vegan-badge.jpg", // Image 4 - 100% Vegan green stamp
  },
  {
    id: 7,
    name: "Make in India",
    image: "/Make_in_India.png", // Image 4 - 100% Vegan green stamp
  },
  {
    id: 8,
    name: "fssai",
    image: "/fssai.webp", // Image 4 - 100% Vegan green stamp
  }
]

export default function CertificationSlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const sliderRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  // Function to handle automatic sliding
  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prevIndex => (prevIndex + 1) % certificationBadges.length)
    }, 3000)
  }
  
  // Function to go to a specific slide
  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }
  
  // Setup auto-sliding on component mount
  useEffect(() => {
    startAutoSlide()
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])
  
  // Pause auto-sliding when hovering over the slider
  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
  }
  
  // Resume auto-sliding when mouse leaves
  const handleMouseLeave = () => {
    startAutoSlide()
  }
  
  // Calculate how many badges to show based on screen size
  const getVisibleCount = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return 2     // Mobile
      if (window.innerWidth < 1024) return 4    // Tablet
      return 5                                  // Desktop
    }
    return 5 // Default for SSR
  }
  
  return (
    <section className="py-12 bg-gray-50 dark:bg-gray-800 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 dark:text-white">Our Quality Certifications</h2>
        
        <div 
          className="relative overflow-hidden"
          ref={sliderRef}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentIndex * (100 / getVisibleCount())}%)`,
            }}
          >
            {/* Repeat the badges to create an infinite effect */}
            {[...certificationBadges, ...certificationBadges].map((badge, index) => (
              <div 
                key={`${badge.id}-${index}`} 
                className="flex-shrink-0 w-1/2 sm:w-1/4 lg:w-1/5 px-4"
                style={{ transition: 'all 0.3s ease' }}
              >
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-28 h-28 md:w-32 md:h-32 mx-auto">
                    <Image
                      src={badge.image}
                      alt={badge.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="mt-2 text-center text-sm font-medium text-gray-700">{badge.name}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          <button 
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
            onClick={() => goToSlide((currentIndex - 1 + certificationBadges.length) % certificationBadges.length)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          
          <button 
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10"
            onClick={() => goToSlide((currentIndex + 1) % certificationBadges.length)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-amber-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
        
        {/* Indicator Dots */}
        <div className="flex justify-center mt-6 space-x-2">
          {certificationBadges.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-amber-600 w-6' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
