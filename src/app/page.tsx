import HeroSection from '@/components/home/HeroSection'
import TopProducts from '@/components/home/TopProducts'
import NewProducts from '@/components/home/NewProducts'
import CertificationSlider from '@/components/CertificationSlider'
import Image from 'next/image'
import Link from 'next/link'
import { NewsletterForm } from '@/components/home/ClientComponents'

export default function Home() {
  return (
    <div className="pt-16">
      <HeroSection />
      
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-playfair text-center mb-4">Our Collections</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Discover our carefully curated collections designed to enhance your lifestyle with premium quality and timeless design.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard 
              title="Dehydrated Vegetables" 
              image="/products/1pro.jpg" 
              href="/products"
            />
            <CategoryCard 
              title="Powders" 
              image="/products/2pro.jpg" 
              href="/products"
            />
            <CategoryCard 
              title="Flakes" 
              image="/products/3pro.jpg" 
              href="/products"
            />
            <CategoryCard 
              title="Dehydated Fruits" 
              image="/products/4pro.jpg" 
              href="/products"
            />
          </div>
        </div>
      </section>
      
      <TopProducts />
      
      <section className="py-16 bg-neutral-100 dark:bg-gray-900 transition-colors duration-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center">
            {/* Text content - centered on mobile */}
            <div className="md:w-1/2 mb-8 md:mb-0 text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-playfair mb-4 text-gray-900 dark:text-white">Our Story</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Founded in 2024, TheNutriDry was born from a passion for healthy, convenient nutrition. We believe that nutritious food should be accessible, delicious, and free from artificial additives, while maintaining a long shelf life.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Our mission is to provide premium quality dehydrated products that retain their nutritional value and natural flavors.
              </p>
              <Link 
                href="/about" 
                className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
              >
                Learn More
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
            
            {/* Image - fixed height on mobile */}
            <div className="w-full md:w-1/2 md:pl-12">
              <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
                <Image 
                  src="/bg1.jpg"
                  alt="TheNutriDry premium dehydrated products"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <NewProducts />
      
      {/* Use the imported CertificationSlider component */}
      <CertificationSlider />
      
      <section className="py-16 bg-amber-600 text-white">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair mb-4">Join Our Community</h2>
          <p className="max-w-2xl mx-auto mb-8">
            Subscribe to our newsletter for exclusive offers, new product announcements, and lifestyle inspiration.
          </p>
          <NewsletterForm />
        </div>
      </section>
    </div>
  )
}

function CategoryCard({ title, image, href }: { title: string, image: string, href: string }) {
  return (
    <Link href={href} className="group block">
      <div className="relative h-80 rounded-lg overflow-hidden">
        <Image 
          src={image} 
          alt={title} 
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
          <div>
            <h3 className="text-xl font-medium text-white mb-1">{title}</h3>
            <span className="text-amber-300 flex items-center text-sm font-medium">
              Shop Now
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}




