'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import Image from 'next/image';
import { productCategories } from '@/types/product';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit?: (data: Product) => Promise<void>;
  isEditing?: boolean;
}

// Define types
type Variant = {
  id?: string;
  size: string;
  price: number;
  originalPrice?: number | null;
  stock: number;
};

type Product = {
  id?: string;
  name: string;
  description: string;
  longDescription?: string;
  category: string;
  bestseller: boolean;
  featured: boolean;
  rating: number;
  reviews: number;
  image?: string;
  images?: string[];
  benefits?: string[];
  features?: string[];
  usageSuggestions?: string[];
  nutritionalInfo?: Record<string, string>;
  specs?: Record<string, string>;
  variants?: Variant[];
};

export default function ProductForm({ 
  initialData = {}, 
  onSubmit, 
  isEditing = false 
}: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImage, setMainImage] = useState<string>(initialData?.image || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialData?.images || []);
  const [formError, setFormError] = useState<string>(''); // Add the missing formError state
  
  // Initialize form data without price and salePrice
  const [formData, setFormData] = useState<Partial<Product>>({    
    name: initialData?.name || '',
    description: initialData?.description || '',
    longDescription: initialData?.longDescription || '',
    category: initialData?.category || '',
    bestseller: initialData?.bestseller || false,
    featured: initialData?.featured || false,
    rating: initialData?.rating || 0,
    reviews: initialData?.reviews || 0,
    image: initialData?.image || ''
  });

  // Initialize array states with optional chaining
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits || ['']);
  const [features, setFeatures] = useState<string[]>(initialData?.features || ['']);
  const [usageSuggestions, setUsageSuggestions] = useState<string[]>(initialData?.usageSuggestions || ['']);
  const [nutritionalInfo, setNutritionalInfo] = useState<Array<{key: string, value: string}>>(
    Object.entries(initialData?.nutritionalInfo || {}).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }]
  );
  const [specs, setSpecs] = useState<Array<{key: string, value: string}>>(
    Object.entries(initialData?.specs || {}).map(([key, value]) => ({ key, value })) || [{ key: '', value: '' }]
  );
  const [variants, setVariants] = useState<Variant[]>(initialData?.variants || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'rating' || name === 'reviews'
          ? Number(value) || 0
          : value
    }));
  };

  // Helper functions for array fields
  const handleArrayChange = (
    index: number,
    value: string,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  const addArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    setArray([...array, '']);
  };

  const removeArrayItem = (
    index: number,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    if (array.length > 1) {
      const newArray = [...array];
      newArray.splice(index, 1);
      setArray(newArray);
    }
  };

  // Helper functions for key-value pairs
  type KeyValuePair = { key: string; value: string };

  const handleKeyValueChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
    array: KeyValuePair[],
    setArray: React.Dispatch<React.SetStateAction<KeyValuePair[]>>
  ): void => {
    const newArray = [...array];
    newArray[index] = { ...newArray[index], [field]: value };
    setArray(newArray);
  };

  const addKeyValueItem = (
    array: KeyValuePair[],
    setArray: React.Dispatch<React.SetStateAction<KeyValuePair[]>>
  ): void => {
    setArray([...array, { key: '', value: '' }]);
  };

  const removeKeyValueItem = (
    index: number,
    array: KeyValuePair[],
    setArray: React.Dispatch<React.SetStateAction<KeyValuePair[]>>
  ): void => {
    if (array.length > 1) {
      const newArray = [...array];
      newArray.splice(index, 1);
      setArray(newArray);
    }
  };

  // Variant helper functions
  const addVariant = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a new variant with default values
    const newVariant: Variant = {
      size: '',
      price: 0,
      originalPrice: null,
      stock: 0
    };
    
    setVariants(currentVariants => [...currentVariants, newVariant]);
    console.log('Added new variant');
  };

  const updateVariant = (
    index: number,
    field: keyof Variant,
    value: string | number
  ): void => {
    setVariants(currentVariants => {
      const updatedVariants = [...currentVariants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        [field]: field === 'price' || field === 'stock' || field === 'originalPrice'
          ? Number(value) || 0
          : value
      };
      return updatedVariants;
    });
  };

  const removeVariant = (index: number): void => {
    setVariants(currentVariants => currentVariants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError(''); // Clear previous errors
    
    try {
      // Validate form
      if (!formData.name || !formData.description || !formData.category) {
        throw new Error('Please fill in all required fields');
      }
      
      if (variants.length === 0) {
        throw new Error('Please add at least one variant with pricing and stock information');
      }
      
      // Prepare data for submission
      const productData = {
        ...formData,
        image: mainImage && mainImage.trim() !== '' ? mainImage : '/placeholder.jpg',
        images: additionalImages.filter(img => img.trim() !== ''),
        variants: variants.map(variant => ({
          id: variant.id,
          size: variant.size,
          price: Number(variant.price) || 0,
          originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
          stock: Number(variant.stock) || 0
        })),
        benefits: benefits.filter(b => b.trim() !== ''),
        features: features.filter(f => f.trim() !== ''),
        usageSuggestions: usageSuggestions.filter(u => u.trim() !== ''),
        nutritionalInfo: nutritionalInfo
          .filter(item => item.key.trim() !== '' && item.value.trim() !== '')
          .reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {}),
        specs: specs
          .filter(item => item.key.trim() !== '' && item.value.trim() !== '')
          .reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {})
      } as Product;
      
      if (initialData.id) {
        productData.id = initialData.id;
      }
      
      if (onSubmit) {
        await onSubmit(productData);
      } else {
        const url = initialData.id 
          ? `/api/products/${initialData.id}` 
          : '/api/products';
        
        const method = initialData.id ? 'PUT' : 'POST';
        
        // Add timeout to fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        try {
          // Add a timestamp to prevent caching issues
          const timestamp = new Date().getTime();
          const urlWithTimestamp = `${url}?t=${timestamp}`;
          
          const response = await fetch(urlWithTimestamp, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData),
            signal: controller.signal,
            // Add cache control
            cache: 'no-store',
          });
          
          clearTimeout(timeoutId);
          
          // Handle different response statuses
          if (response.status === 405) {
            throw new Error('Method not allowed. This might be a server configuration issue. Please try again later.');
          }
          
          if (response.status === 413) {
            throw new Error('Request too large. Try uploading smaller images or reducing the amount of data.');
          }
          
          let errorData;
          try {
            // Try to parse the response as JSON
            errorData = await response.json();
          } catch (parseError) {
            // If JSON parsing fails, use status text
            console.error('Failed to parse JSON response:', parseError);
            if (!response.ok) {
              throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }
          }
          
          if (!response.ok) {
            // If we have JSON error data, use it
            if (errorData && errorData.error) {
              throw new Error(errorData.error);
            } else {
              throw new Error(`Failed to save product (Status: ${response.status})`);
            }
          }
          
          // Success - redirect to products page
          router.push('/admin/products');
        } catch (fetchError: unknown) {
          // Type guard to check if fetchError is an Error object with a name property
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Request timed out. Please try again.');
          }
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setFormError(error instanceof Error ? error.message : 'An unknown error occurred');
      
      // Show alert in production for critical errors
      if (process.env.NODE_ENV === 'production' && error instanceof Error && 
          (error.message.includes('405') || error.message.includes('Method not allowed'))) {
        alert('There was a problem saving the product. Please try again later or contact support.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Display form error if present */}
      {formError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>{formError}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Long Description</label>
            <textarea
              name="longDescription"
              value={formData.longDescription || ''}
              onChange={handleChange}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          {/* Remove price and salePrice fields from the UI */}
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category || ''}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="bestseller"
                checked={!!formData.bestseller}
                onChange={handleChange}
                className="h-4 w-4 text-green-600"
              />
              <label className="ml-2 text-sm">Bestseller</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={!!formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-green-600"
              />
              <label className="ml-2 text-sm">New Arrival</label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Rating (0-5)</label>
              <input
                type="number"
                name="rating"
                value={formData.rating || 0}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Reviews Count</label>
              <input
                type="number"
                name="reviews"
                value={formData.reviews || 0}
                onChange={handleChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
        </div>
        
        {/* Images */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Main Product Image</label>
            <ImageUploader 
              initialImage={mainImage} 
              onImageChange={setMainImage} 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Additional Images</label>
            {additionalImages.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative">
                    <Image 
                      src={img} 
                      alt={`Product image ${idx}`} 
                      width={64}
                      height={64}
                      className="object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setAdditionalImages(additionalImages.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Benefits Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Benefits</h2>
        {benefits.map((benefit, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              value={benefit}
              onChange={(e) => handleArrayChange(index, e.target.value, benefits, setBenefits)}
              placeholder="e.g., Rich in Vitamin C - supports immune system"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, benefits, setBenefits)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              disabled={benefits.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(benefits, setBenefits)}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Benefit
        </button>
      </div>
      
      {/* Features Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Features</h2>
        {features.map((feature, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleArrayChange(index, e.target.value, features, setFeatures)}
              placeholder="e.g., 100% natural ingredients"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, features, setFeatures)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              disabled={features.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(features, setFeatures)}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Feature
        </button>
      </div>
      
      {/* Nutritional Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Nutritional Information</h2>
        {nutritionalInfo.map((item, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              value={item.key}
              onChange={(e) => handleKeyValueChange(index, 'key', e.target.value, nutritionalInfo, setNutritionalInfo)}
              placeholder="e.g., Serving Size"
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleKeyValueChange(index, 'value', e.target.value, nutritionalInfo, setNutritionalInfo)}
              placeholder="e.g., 30g"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeKeyValueItem(index, nutritionalInfo, setNutritionalInfo)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              disabled={nutritionalInfo.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addKeyValueItem(nutritionalInfo, setNutritionalInfo)}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Nutritional Info
        </button>
      </div>
      
      {/* Specifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Specifications</h2>
        {specs.map((item, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              value={item.key}
              onChange={(e) => handleKeyValueChange(index, 'key', e.target.value, specs, setSpecs)}
              placeholder="e.g., Weight"
              className="w-1/3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mr-2"
            />
            <input
              type="text"
              value={item.value}
              onChange={(e) => handleKeyValueChange(index, 'value', e.target.value, specs, setSpecs)}
              placeholder="e.g., 250g"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeKeyValueItem(index, specs, setSpecs)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              disabled={specs.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addKeyValueItem(specs, setSpecs)}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Specification
        </button>
      </div>
      
      {/* Usage Suggestions */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Usage Suggestions</h2>
        {usageSuggestions.map((suggestion, index) => (
          <div key={index} className="flex items-center mb-3">
            <input
              type="text"
              value={suggestion}
              onChange={(e) => handleArrayChange(index, e.target.value, usageSuggestions, setUsageSuggestions)}
              placeholder="e.g., Enjoy as a nutritious snack"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, usageSuggestions, setUsageSuggestions)}
              className="ml-2 p-2 text-red-600 hover:text-red-800"
              disabled={usageSuggestions.length <= 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem(usageSuggestions, setUsageSuggestions)}
          className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          + Add Usage Suggestion
        </button>
      </div>
      
      {/* Variants Section - Make more prominent */}
      <div className="bg-white p-6 rounded-lg shadow-sm mt-8 border-2 border-amber-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Product Variants, Pricing & Stock</h2>
            <p className="text-sm text-gray-500">All pricing and inventory is managed through variants</p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="px-3 py-1 bg-green-600 text-white rounded-md text-sm"
          >
            Add Variant
          </button>
        </div>
        
        {variants.length > 0 ? (
          <div className="space-y-4">
            {/* Mobile view (stacked cards) */}
            <div className="md:hidden">
              {variants.map((variant, index) => (
                <div key={index} className="border rounded-md p-4 mb-3 bg-white">
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Weight/Size</label>
                    <input
                      type="text"
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1"
                      placeholder="e.g., 1kg, 500g"
                      required
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Original Price (₹)</label>
                    <input
                      type="number"
                      value={variant.originalPrice !== null ? variant.originalPrice : ''}
                      onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1"
                      min="0"
                      step="0.01"
                      placeholder="Optional"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Sale Price (₹)</label>
                    <input
                     type="number"
                     value={variant.price}
                     onChange={(e) => updateVariant(index, 'price', e.target.value)}
                     className="w-full border border-gray-300 rounded-md px-2 py-1"
                     min="0"
                     step="0.01"
                     required
                   />
                 </div>
                 <div className="mb-2">
                   <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Stock Quantity</label>
                   <input
                     type="number"
                     value={variant.stock}
                     onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                     className="w-full border border-gray-300 rounded-md px-2 py-1"
                     min="0"
                     required
                   />
                 </div>
                 <button
                   type="button"
                   onClick={() => removeVariant(index)}
                   className="w-full mt-2 text-center py-1 text-red-600 hover:text-red-800 border border-red-200 rounded-md"
                 >
                   Remove
                 </button>
               </div>
             ))}
           </div>
           
           {/* Desktop view (table) */}
           <div className="hidden md:block border rounded-md overflow-hidden">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight/Size</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Original Price (₹)</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sale Price (₹)</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Quantity</th>
                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {variants.map((variant, index) => (
                   <tr key={index}>
                     <td className="px-4 py-2">
                       <input
                         type="text"
                         value={variant.size}
                         onChange={(e) => updateVariant(index, 'size', e.target.value)}
                         className="w-full border border-gray-300 rounded-md px-2 py-1"
                         placeholder="e.g., 1kg, 500g"
                         required
                       />
                     </td>
                     <td className="px-4 py-2">
                       <input
                         type="number"
                         value={variant.originalPrice !== null ? variant.originalPrice : ''}
                         onChange={(e) => updateVariant(index, 'originalPrice', e.target.value)}
                         className="w-full border border-gray-300 rounded-md px-2 py-1"
                         min="0"
                         step="0.01"
                         placeholder="Optional"
                       />
                     </td>
                     <td className="px-4 py-2">
                       <input
                         type="number"
                         value={variant.price}
                         onChange={(e) => updateVariant(index, 'price', e.target.value)}
                         className="w-full border border-gray-300 rounded-md px-2 py-1"
                         min="0"
                         step="0.01"
                         required
                       />
                     </td>
                     <td className="px-4 py-2">
                       <input
                         type="number"
                         value={variant.stock}
                         onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                         className="w-full border border-gray-300 rounded-md px-2 py-1"
                         min="0"
                         required
                       />
                     </td>
                     <td className="px-4 py-2">
                       <button
                         type="button"
                         onClick={() => removeVariant(index)}
                         className="text-red-600 hover:text-red-800"
                       >
                         Remove
                       </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         </div>
       ) : (
         <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
           <p className="text-amber-800 text-sm font-medium">No variants added yet. Please add at least one variant with pricing and stock information.</p>
           <p className="text-gray-600 text-sm mt-2">Each product must have at least one variant that defines its size/weight, price, and stock quantity.</p>
         </div>
       )}
     </div>
     
     {/* Submit Button - Make responsive */}
     <div className="mt-8 flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-4">
       <button
         type="button"
         onClick={() => router.back()}
         className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
         disabled={isLoading}
       >
         Cancel
       </button>
       <button
         type="button"
         onClick={handleSubmit}
         className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 w-full sm:w-auto"
         disabled={isLoading}
       >
         {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
       </button>
     </div>
   </div>
 );
}
