import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Sustainability | TheNutriDry',
  description: 'Our commitment to sustainable practices in farming, production, and packaging of dried fruits and vegetables.',
};

export default function SustainabilityPage() {
  return (
    <div className="pt-24 pb-16 bg-neutral-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        <header className="mb-12 text-center">
          <h1 className="text-3xl md:text-5xl font-playfair mb-4 dark:text-white">Our Sustainability Commitment</h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            At TheNutriDry, sustainability isn&apos;t just a buzzword—it&apos;s at the core of everything we do. From farm to package, we&apos;re committed to practices that protect our planet for future generations.
          </p>
        </header>
        
        {/* Hero Image */}
        <div className="relative h-96 w-full mb-16 rounded-lg overflow-hidden">
          <Image 
            src="/bg2.jpg" 
            alt="Sustainable farming practices"
            fill
            style={{objectFit: 'cover'}}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
            <div className="text-white max-w-lg p-8">
              <h2 className="text-3xl font-semibold mb-4">Preserving Nature&apos;s Goodness</h2>
              <p className="text-lg">Our mission is to provide nutritious dried fruits and vegetables while minimizing our environmental footprint.</p>
            </div>
          </div>
        </div>
        
        {/* Sustainable Practices Sections */}
        <div className="space-y-16">
          {/* Farming Section */}
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-playfair mb-4 text-gray-900 dark:text-white">Sustainable Farming</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  We partner exclusively with farmers who practice sustainable agriculture. This includes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Organic farming methods that avoid harmful pesticides and chemicals</li>
                  <li>Water conservation techniques to minimize usage</li>
                  <li>Crop rotation to maintain soil health and biodiversity</li>
                  <li>Fair compensation for farmers and agricultural workers</li>
                  <li>Local sourcing whenever possible to reduce transportation emissions</li>
                </ul>
                <p>
                  By supporting sustainable farming practices, we ensure that the land remains fertile and productive for generations to come while producing the highest quality fruits and vegetables.
                </p>
              </div>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image 
                src="/bg1.jpg" 
                alt="Sustainable farming practices"
                fill
                style={{objectFit: 'cover'}}
              />
            </div>
          </section>
          
          {/* Production Section */}
          <section className="grid md:grid-cols-2 gap-8 items-center md:grid-flow-dense">
            <div className="md:col-start-2">
              <h2 className="text-2xl font-playfair mb-4 text-gray-900 dark:text-white">Eco-Friendly Production</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  Our dehydration process is designed to minimize environmental impact while preserving maximum nutrition:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Energy-efficient dehydration technology that reduces power consumption</li>
                  <li>Solar power integration at our production facilities</li>
                  <li>Zero-waste approach where fruit and vegetable trimmings are composted</li>
                  <li>Water recycling systems to minimize freshwater usage</li>
                  <li>Regular energy audits to identify further efficiency improvements</li>
                </ul>
                <p>
                  We continuously invest in new technologies that allow us to reduce our carbon footprint while maintaining the exceptional quality of our products.
                </p>
              </div>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden md:col-start-1">
              <Image 
                src="/bg3.jpg" 
                alt="Eco-friendly production process"
                fill
                style={{objectFit: 'cover'}}
              />
            </div>
          </section>
          
          {/* Packaging Section */}
          <section className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-playfair mb-4 text-gray-900 dark:text-white">Sustainable Packaging</h2>
              <div className="space-y-4 text-gray-700 dark:text-gray-300">
                <p>
                  We&apos;re committed to reducing packaging waste through innovative solutions:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Biodegradable and compostable packaging materials</li>
                  <li>Recyclable shipping materials made from post-consumer recycled content</li>
                  <li>Minimalist packaging design that reduces material usage</li>
                  <li>Bulk options that further decrease packaging-to-product ratio</li>
                  <li>Clear recycling instructions on all packaging</li>
                </ul>
                <p>
                  Our goal is to transition to 100% sustainable packaging across our entire product line by 2025, without compromising on food safety or product freshness.
                </p>
              </div>
            </div>
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image 
                src="/products/4pro.jpg" 
                alt="Sustainable packaging"
                fill
                style={{objectFit: 'cover'}}
              />
            </div>
          </section>
        </div>
        
        {/* Certifications */}
        <section className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-playfair mb-6 text-center text-gray-900 dark:text-white">Our Certifications</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="text-center">
              <div className="relative h-24 w-24 mx-auto mb-4">
                <Image 
                  src="/pure-badge.jpg" 
                  alt="Organic Certified"
                  fill
                  style={{objectFit: 'contain'}}
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Organic Certified</h3>
            </div>
            <div className="text-center">
              <div className="relative h-24 w-24 mx-auto mb-4">
                <Image 
                  src="/no-preservatives-badge.jpg" 
                  alt="No Preservatives"
                  fill
                  style={{objectFit: 'contain'}}
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">No Preservatives</h3>
            </div>
            <div className="text-center">
              <div className="relative h-24 w-24 mx-auto mb-4">
                <Image 
                  src="/no-additives-badge.jpg" 
                  alt="No Additives"
                  fill
                  style={{objectFit: 'contain'}}
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">No Additives</h3>
            </div>
            <div className="text-center">
              <div className="relative h-24 w-24 mx-auto mb-4">
                <Image 
                  src="/Make_in_India.png" 
                  alt="Make in India"
                  fill
                  style={{objectFit: 'contain'}}
                />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">Make in India</h3>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-green-600 to-green-700 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Us in Our Sustainability Journey</h2>
          <p className="mb-6 max-w-2xl mx-auto">Every purchase you make supports our sustainable practices and helps us continue to innovate for a greener future.</p>
          <Link 
            href="/products" 
            className="inline-block px-6 py-3 bg-white text-green-700 font-medium rounded-md hover:bg-gray-100 transition-colors"
          >
            Shop Our Products
          </Link>
        </div>
      </div>
    </div>
  );
}
