import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Blog | TheNutriDry',
  description: 'Latest articles, recipes and news about dried fruits and vegetables from TheNutriDry.',
};

// Sample blog post data - in a real application, this would come from a CMS or API
const blogPosts = [
  {
    id: 1,
    title: 'The Health Benefits of Dried Fruits',
    excerpt: 'Discover how incorporating dried fruits into your diet can boost your health with essential nutrients and antioxidants.',
    image: '/products/1.jpg',
    date: 'June 15, 2023',
    category: 'Health',
    slug: 'health-benefits-dried-fruits'
  },
  {
    id: 2,
    title: 'Creative Ways to Use Dried Vegetables in Cooking',
    excerpt: 'Explore innovative recipes and cooking techniques that make the most of dried vegetables for delicious, nutritious meals.',
    image: '/products/2.jpg',
    date: 'July 22, 2023',
    category: 'Recipes',
    slug: 'creative-ways-dried-vegetables'
  },
  {
    id: 3,
    title: 'Sustainable Farming Practices at TheNutriDry',
    excerpt: 'Learn about our commitment to sustainable agriculture and how we work with farmers to minimize environmental impact.',
    image: '/products/3.jpg',
    date: 'August 10, 2023',
    category: 'Sustainability',
    slug: 'sustainable-farming-practices'
  },
  {
    id: 4,
    title: 'The Dehydration Process: How We Preserve Nutrients',
    excerpt: 'A behind-the-scenes look at our careful dehydration process that preserves maximum nutrition and flavor.',
    image: '/products/4.jpg',
    date: 'September 5, 2023',
    category: 'Production',
    slug: 'dehydration-process-nutrients'
  },
  {
    id: 5,
    title: '5 Quick Snack Ideas Using Dried Fruits',
    excerpt: 'Simple, delicious snack ideas that are perfect for busy days when you need a nutritious energy boost.',
    image: '/products/5.jpg',
    date: 'October 18, 2023',
    category: 'Recipes',
    slug: 'quick-snack-ideas'
  },
  {
    id: 6,
    title: 'Seasonal Spotlight: Winter Fruits Preservation',
    excerpt: 'How dehydration helps preserve seasonal winter fruits, allowing you to enjoy their benefits year-round.',
    image: '/products/6.jpg',
    date: 'December 3, 2023',
    category: 'Seasonal',
    slug: 'seasonal-winter-fruits'
  }
];

export default function BlogPage() {
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-playfair mb-4 dark:text-white">Our Blog</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Explore our articles for healthy recipes, nutrition tips, and the latest news about our sustainable dried fruit and vegetable products.
          </p>
        </header>
        
        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative h-48 w-full">
                  <Image 
                    src={post.image} 
                    alt={post.title}
                    fill
                    style={{objectFit: 'cover'}}
                    className="transition-transform hover:scale-105 duration-500"
                  />
                </div>
              </Link>
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>{post.date}</span>
                  <span className="mx-2">•</span>
                  <span className="text-amber-600">{post.category}</span>
                </div>
                <h2 className="text-xl font-semibold mb-2 hover:text-amber-600 transition-colors text-gray-900 dark:text-white">
                  <Link href={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{post.excerpt}</p>
              </div>
            </article>
          ))}
        </div>
        
        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-semibold mb-4">Subscribe to Our Newsletter</h2>
            <p className="mb-6">Stay updated with our latest articles, recipes, and exclusive offers.</p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="flex-grow px-4 py-3 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                required
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-white text-amber-600 font-medium rounded-md hover:bg-gray-100 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
