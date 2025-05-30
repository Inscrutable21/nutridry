'use client'

import Image from 'next/image'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-playfair mb-4 dark:text-white">Our Story</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Founded in 2024 with a passion for healthy, convenient nutrition and sustainable food practices.
          </p>
        </header>
        
        <div className="relative h-96 md:h-[500px] mb-16 rounded-xl overflow-hidden">
          <Image 
            src="/bg1.jpg"
            alt="TheNutriDry premium products"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-8 md:p-12 text-white max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-playfair mb-2">Innovating Since 2024</h2>
            <p className="text-gray-200">
              Transforming fresh, nutrient-rich foods into convenient, long-lasting dehydrated products without compromising on quality or taste.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl md:text-3xl font-playfair mb-4 dark:text-white">Our Mission</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              At TheNutriDry, we believe that healthy eating shouldn&apos;t be complicated or time-consuming. Our mission is to provide premium quality dehydrated fruits and vegetables that retain their natural nutrients and flavors while offering unmatched convenience.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              We&apos;re committed to sustainable food practices, reducing food waste, and making nutritious options accessible to everyone. Each product is carefully crafted to ensure you get the best of nature in every bite, without any artificial additives or preservatives.
            </p>
          </div>
          
          <div>
            <h2 className="text-2xl md:text-3xl font-playfair mb-4 dark:text-white">Our Approach</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our dehydration process is both an art and a science. We source the freshest, highest quality produce and use advanced dehydration techniques that preserve essential nutrients, natural flavors, and vibrant colors.
            </p>
            <p className="text-gray-700 dark:text-gray-300">
              By removing water content while maintaining nutritional integrity, we create products with extended shelf life without the need for artificial preservatives. This approach not only delivers exceptional taste but also supports sustainable consumption by reducing food waste.
            </p>
          </div>
        </div>
        
        <section className="mb-16">
          <h2 className="text-2xl md:text-3xl font-playfair text-center mb-10 dark:text-white">Why Choose TheNutriDry</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-400/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white">Premium Quality</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                We use only the finest fruits and vegetables, carefully selected for optimal flavor, texture, and nutritional value.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-400/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white">100% Natural</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                No additives, preservatives, or artificial ingredients. Just pure, natural goodness in every package.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
              <div className="bg-amber-100 dark:bg-amber-400/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg className="w-6 h-6 text-amber-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-center mb-2 text-gray-900 dark:text-white">Nutrient-Rich</h3>
              <p className="text-gray-700 dark:text-gray-300 text-center">
                Our gentle dehydration process preserves vitamins, minerals, and antioxidants for maximum nutritional benefit.
              </p>
            </div>
          </div>
        </section>
        
        <section className="bg-gray-100 dark:bg-gray-800 rounded-xl p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-playfair mb-4 dark:text-white">Our Process</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              How we transform fresh produce into premium dehydrated products while preserving nutrients and flavor.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProcessStep 
              number="01"
              title="Selection"
              description="We carefully select fresh, ripe fruits and vegetables at their peak flavor and nutritional value."
            />
            <ProcessStep 
              number="02"
              title="Preparation"
              description="Each piece is washed, inspected, and precisely cut to ensure even dehydration."
            />
            <ProcessStep 
              number="03"
              title="Dehydration"
              description="Using controlled temperature and humidity, we gently remove water while preserving nutrients."
            />
            <ProcessStep 
              number="04"
              title="Quality Control"
              description="Every batch is tested for quality, flavor, and nutritional content before packaging."
            />
          </div>
        </section>
        
        <section className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-playfair mb-4 dark:text-white">Our Commitment to Sustainability</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                At TheNutriDry, sustainability isn&apos;t just a buzzword—it&apos;s a core principle that guides everything we do. By extending the shelf life of seasonal produce through dehydration, we help reduce food waste throughout the supply chain.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Our packaging is designed with the environment in mind, using recyclable and biodegradable materials wherever possible. We&apos;re constantly researching new ways to minimize our ecological footprint.
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                We partner with local farmers who share our commitment to sustainable agricultural practices, supporting communities while ensuring the highest quality ingredients for our products.
              </p>
            </div>
            <div className="rounded-xl overflow-hidden">
              <Image 
                src="/bg2.jpg"
                alt="Sustainable practices at TheNutriDry"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>
        
        <section className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-playfair mb-4 dark:text-white">Meet Our Team</h2>
            <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              The passionate individuals behind TheNutriDry&apos;s vision and products.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TeamMember 
              name="Abdul Samad" 
              role="Founder & CEO"
              image="/bg1.jpg"
            />
            <TeamMember 
              name="Faisal Khan" 
              role="Head of Product Development"
              image="/bg1.jpg"
            />
            <TeamMember 
              name="Faisal Khan" 
              role="Quality Assurance Director"
              image="/bg1.jpg"
            />
            <TeamMember 
              name="Faisal Khan" 
              role="Sustainability Lead"
              image="/bg1.jpg"
            />
          </div>
        </section>
        
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-playfair mb-6 dark:text-white">Join Our Journey</h2>
          <p className="text-gray-700 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Experience the difference of premium dehydrated fruits and vegetables. Discover why customers across India are choosing TheNutriDry for healthy, convenient nutrition.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link 
              href="/products" 
              className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors font-medium"
            >
              Shop Our Products
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 border-2 border-gray-900 dark:border-gray-200 hover:bg-gray-900 dark:hover:bg-gray-200 hover:text-white dark:hover:text-gray-900 text-gray-900 dark:text-gray-200 rounded-full transition-colors font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function ValueCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 text-amber-600 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function ProcessStep({ number, title, description }: { number: string, title: string, description: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-600 text-white rounded-full text-xl font-bold mb-4">
        {number}
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function TeamMember({ name, role, image }: { name: string, role: string, image: string }) {
  return (
    <div className="text-center">
      <div className="relative w-40 h-40 mx-auto rounded-full overflow-hidden mb-4">
        <Image 
          src={image}
          alt={name}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="text-lg font-medium">{name}</h3>
      <p className="text-gray-600">{role}</p>
    </div>
  )
}
