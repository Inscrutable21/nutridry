'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Collections() {
  const collections = [
    {
      id: 1,
      name: 'Dehydrated Vegetables',
      image: '/collections/vegetables.jpg',
      url: '/products?category=Vegetables',
    },
    {
      id: 2,
      name: 'Powders',
      image: '/collections/powders.jpg',
      url: '/products?category=Powders',
    },
    {
      id: 3,
      name: 'Flakes',
      image: '/collections/flakes.jpg',
      url: '/products?category=Flakes',
    },
    {
      id: 4,
      name: 'Dehydrated Fruits',
      image: '/collections/fruits.jpg',
      url: '/products?category=Fruits',
    },
  ]

  return (
    <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-200">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900 dark:text-white">
          Our Collections
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center max-w-3xl mx-auto mb-12">
          Discover our carefully curated collections designed to enhance your lifestyle with premium
          quality and timeless design.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection) => (
            <Link 
              key={collection.id} 
              href={collection.url}
              className="group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <div className="aspect-square relative">
                <Image
                  src={collection.image}
                  alt={collection.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-semibold mb-2">{collection.name}</h3>
                  <span className="inline-flex items-center text-sm font-medium">
                    Shop Now
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}