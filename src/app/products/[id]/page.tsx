// app/products/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { toast } from 'react-hot-toast'
import PlaceholderImage from '@/components/ui/PlaceholderImage'
import { motion, AnimatePresence } from 'framer-motion'

// Add the calculateDiscount function at the top of your component
const calculateDiscount = (originalPrice: number, currentPrice: number): number => {
  if (!originalPrice || !currentPrice || originalPrice <= 0) return 0;
  const discount = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  return discount;
};

// Add type definition for Product at the top of the file
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  secondaryImage?: string;
  images?: string[];
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  bestseller: boolean;
  featured?: boolean;
  description: string;
  longDescription?: string;
  benefits?: string[];
  nutritionalInfo?: Record<string, string>;
  features?: string[];
  specs?: Record<string, string>;
  usageSuggestions?: string[];
  variants?: Array<{
    id: string;
    size: string;
    price: number;
    stock?: number;
    originalPrice?: number;
  }>;
}

// Update the cart item type to match your CartContext
type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant: string | null; // Changed from variant?: string | null
}

// Product Images component with slider functionality
const ProductImageGallery = ({ product }: { product: Product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    product.image,
    ...(product.secondaryImage ? [product.secondaryImage] : []),
    ...(product.images || [])
  ].filter(Boolean);

  const nextImage = () => {
    setCurrentImageIndex((prev: number) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      {/* Main Image Slider */}
      <div className="relative aspect-square mb-4 overflow-hidden rounded-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentImageIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative aspect-square"
          >
            {images.length > 0 ? (
              <Image 
                src={images[currentImageIndex]}
                alt={`${product.name} - view ${currentImageIndex + 1}`}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                onError={(e) => {
                  console.error('Image failed to load:', images[currentImageIndex]);
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.classList.add('image-error');
                }}
              />
            ) : (
              <PlaceholderImage />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows - only show if there are multiple images */}
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 transition-all"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md z-10 transition-all"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                currentImageIndex === index ? 'border-amber-500' : 'border-transparent hover:border-gray-300'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`${product.name} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function ProductPage() {
  const { id } = useParams()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('description')
  const { addToCart } = useCart()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null)
  
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  if (isLoading) {
    return (
      <div className="pt-24 pb-16 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }
  
  if (error || !product) {
    return (
      <div className="pt-24 pb-16 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Product not found'}</p>
          <Link href="/products" className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Define styles
  const primaryColor = '#2b9348'
  const primaryDark = '#1e6b33'
  
  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(prev => prev + 1)
    }
  }
  
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1)
    }
  }
  
  // Direct contact via WhatsApp
  const handleContactNow = () => {
    const currentPrice = product.variants && product.variants.length > 0
      ? (selectedVariant !== null ? product.variants[selectedVariant].price : product.variants[0].price)
      : product.price;
    
    const variantInfo = product.variants && product.variants.length > 0
      ? ` (${selectedVariant !== null ? product.variants[selectedVariant].size : product.variants[0].size})`
      : '';
      
    const message = `Hello! I'm interested in purchasing: *${product.name}${variantInfo}* - Price: ₹${currentPrice.toFixed(2)}. Quantity: ${quantity}. Please provide more information.`;
    const whatsappUrl = `https://wa.me/919984001117?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
  
  // Add to cart
  const handleAddToCart = () => {
    const currentPrice = product.variants && product.variants.length > 0
      ? (selectedVariant !== null ? product.variants[selectedVariant].price : product.variants[0].price)
      : product.price;
    
    const variantInfo = product.variants && product.variants.length > 0
      ? (selectedVariant !== null ? product.variants[selectedVariant].size : product.variants[0].size)
      : null;
      
    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: currentPrice,
      quantity: quantity,
      image: product.image,
      variant: variantInfo
    };
    
    addToCart(cartItem);
    
    // Force UI update
    setQuantity(1);
    
    toast.success(`Added ${quantity} ${product.name} to cart`);
  }
  
  // Get current price and original price based on selected variant
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getCurrentPriceInfo = () => {
    if (!product) return { 
      currentPrice: 0, 
      originalPrice: null, 
      discount: null, 
      size: null,
      discountAmount: 0 
    };
    
    if (product.variants && product.variants.length > 0) {
      const variant = selectedVariant !== null 
        ? product.variants[selectedVariant] 
        : product.variants[0];
      
      const discount = variant.originalPrice 
        ? calculateDiscount(variant.originalPrice, variant.price) 
        : null;
        
      const discountAmount = variant.originalPrice 
        ? variant.originalPrice - variant.price
        : 0;
      
      return {
        currentPrice: variant.price,
        originalPrice: variant.originalPrice || null,
        discount,
        size: variant.size,
        discountAmount
      };
    }
    
    // Fallback to using the product.price (for backward compatibility)
    return {
      currentPrice: product.price,
      originalPrice: null,
      discount: null,
      size: null,
      discountAmount: 0
    };
  };
  
  return (
    <div className="pt-24 pb-16 dark:bg-gray-900">
      <div className="container mx-auto px-4 md:px-6">
        {/* Breadcrumb */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <Link href="/" className="hover:text-amber-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-amber-600 transition-colors">Products</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
          </div>
        </div>
        
        {/* Product Main Section */}
        <div className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Product Images */}
          <div className="md:w-1/2">
            <ProductImageGallery product={product} />
          </div>
          
          {/* Product Details */}
          <div className="md:w-1/2">
            {product.bestseller && (
              <div 
                className="inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Bestseller
              </div>
            )}
            
            <h1 className="text-3xl font-playfair mb-2 text-gray-900 dark:text-white">{product.name}</h1>
            
            <div className="flex items-center mb-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                  </svg>
                ))}
              </div>
              <span className="ml-2 text-gray-600 dark:text-gray-400">
                {product.rating} ({product.reviews} reviews)
              </span>
            </div>
            
            <div className="text-2xl font-medium mb-4">
              {product.variants && product.variants.length > 0 ? (
                <div>
                  {selectedVariant !== null ? (
                    product.variants[selectedVariant].originalPrice ? (
                      <>
                        <span className="text-amber-600 dark:text-amber-500">₹{product.variants[selectedVariant].price.toFixed(2)}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xl line-through ml-2">
                          ₹{product.variants[selectedVariant].originalPrice.toFixed(2)}
                        </span>
                        <span className="text-green-600 dark:text-green-500 text-sm ml-2">
                          {Math.round((1 - product.variants[selectedVariant].price / product.variants[selectedVariant].originalPrice) * 100)}% off
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-500">₹{product.variants[selectedVariant].price.toFixed(2)}</span>
                    )
                  ) : (
                    product.variants[0].originalPrice ? (
                      <>
                        <span className="text-amber-600 dark:text-amber-500">₹{product.variants[0].price.toFixed(2)}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-xl line-through ml-2">
                          ₹{product.variants[0].originalPrice.toFixed(2)}
                        </span>
                        <span className="text-green-600 dark:text-green-500 text-sm ml-2">
                          {Math.round((1 - product.variants[0].price / product.variants[0].originalPrice) * 100)}% off
                        </span>
                      </>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-500">₹{product.variants[0].price.toFixed(2)}</span>
                    )
                  )}
                </div>
              ) : (
                <span className="text-amber-600 dark:text-amber-500">₹{product.price.toFixed(2)}</span>
              )}
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>
            
            {/* Stock Status */}
            <div className="mb-6">
              <div className="flex items-center">
                <span className={`${
                  product.stock > 10 ? 'text-green-600 dark:text-green-500' : 
                  product.stock > 0 ? 'text-amber-600 dark:text-amber-500' : 
                  'text-red-600 dark:text-red-500'
                }`}>
                  {product.stock > 10 
                    ? '✓ In Stock' 
                    : product.stock > 0 
                      ? `Only ${product.stock} left` 
                      : 'Out of Stock'}
                </span>
              </div>
            </div>
            
            {/* Size Options */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Size Options</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      className={`relative px-6 py-4 border rounded-md focus:outline-none ${
                        selectedVariant === index 
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:border-amber-400'
                          : 'border-gray-300 dark:border-gray-600 hover:border-amber-300 dark:hover:border-amber-500'
                      }`}
                      onClick={() => setSelectedVariant(index)}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-medium mb-1 text-gray-900 dark:text-white">{variant.size}</span>
                        {variant.originalPrice ? (
                          <span className="text-amber-600 dark:text-amber-500 font-medium">
                            ₹{variant.price.toFixed(2)}
                            <span className="text-xs text-gray-500 dark:text-gray-400 line-through ml-1">
                              ₹{variant.originalPrice.toFixed(2)}
                            </span>
                          </span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-500 font-medium">₹{variant.price.toFixed(2)}</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quantity Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-gray-900 dark:text-white">Quantity</h3>
              <div className="flex items-center">
                <button 
                  onClick={decrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-l-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  -
                </button>
                <div className="w-12 h-10 flex items-center justify-center border-t border-b border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  {quantity}
                </div>
                <button 
                  onClick={incrementQuantity}
                  className="w-10 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                >
                  +
                </button>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button 
                className="px-6 py-3 text-white rounded-md flex items-center justify-center"
                style={{ 
                  backgroundColor: primaryColor,
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = primaryDark}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = primaryColor}
                onClick={handleContactNow}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
                Contact Now
              </button>
              <button 
                onClick={handleAddToCart}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Add to Cart
              </button>
            </div>
            
            {/* Product Specs */}
            {product.specs && (
              <div className="border-t border-gray-200 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                    <div key={key}>
                      <h3 className="text-sm font-medium text-gray-500">{key.toUpperCase()}</h3>
                      <p className="mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-wrap -mb-px">
              <button
                onClick={() => setActiveTab('description')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'description'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab('benefits')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'benefits'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Benefits
              </button>
              <button
                onClick={() => setActiveTab('nutritional')}
                className={`mr-8 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'nutritional'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Nutritional Info
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'usage'
                    ? 'border-amber-500 text-amber-600 dark:text-amber-500'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Usage Suggestions
              </button>
            </div>
          </div>
          
          <div className="prose max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-p:text-gray-700 dark:prose-p:text-gray-300">
            {activeTab === 'description' && (
              <div>
                <p>{product.longDescription || product.description}</p>
                {product.features && product.features.length > 0 && (
                  <ul className="mt-4 space-y-2 list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {activeTab === 'benefits' && (
              <div>
                {product.benefits && product.benefits.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {product.benefits.map((benefit, index) => (
                      <li key={index}>{benefit}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No benefits information available for this product.</p>
                )}
              </div>
            )}
            
            {activeTab === 'nutritional' && (
              <div>
                {product.nutritionalInfo && Object.keys(product.nutritionalInfo).length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nutrient</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {Object.entries(product.nutritionalInfo).map(([nutrient, amount], index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{nutrient}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No nutritional information available for this product.</p>
                )}
              </div>
            )}
            
            {activeTab === 'usage' && (
              <div>
                {product.usageSuggestions && product.usageSuggestions.length > 0 ? (
                  <ul className="space-y-2 list-disc pl-5 text-gray-700 dark:text-gray-300">
                    {product.usageSuggestions.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No usage suggestions available for this product.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
