'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import ImageUploader from './ImageUploader';
import Image from 'next/image';

// Update the Variant type to match your schema
type Variant = {
  size: string;  // This will store weight information like "1kg", "500g"
  price: number;
  stock: number;
};

type ProductFormProps = {
  initialData?: {
    id?: string;
    name?: string;
    description?: string;
    longDescription?: string;
    price?: number;
    salePrice?: string;
    category?: string;
    stock?: number;
    bestseller?: boolean;
    featured?: boolean;
    rating?: number;
    reviews?: number;
    image?: string;
    images?: string[];
    variants?: Variant[];
    benefits?: string[];
    features?: string[];
    usageSuggestions?: string[];
    nutritionalInfo?: Record<string, string>;
    specs?: Record<string, string>;
  };
  isEditing?: boolean;
};

export default function ProductForm({ initialData = {}, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [variants, setVariants] = useState<Variant[]>(initialData.variants || []);
  const [mainImage, setMainImage] = useState(initialData.image || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialData.images || []);
  
  // Add states for additional fields
  const [benefits, setBenefits] = useState<string[]>(initialData.benefits || ['']);
  const [features, setFeatures] = useState<string[]>(initialData.features || ['']);
  const [usageSuggestions, setUsageSuggestions] = useState<string[]>(initialData.usageSuggestions || ['']);
  
  // For nutritional info and specs (key-value pairs)
  const [nutritionalInfo, setNutritionalInfo] = useState<{key: string, value: string}[]>(
    initialData.nutritionalInfo ? 
      Object.entries(initialData.nutritionalInfo).map(([key, value]) => ({ key, value: value as string })) : 
      [{ key: 'Serving Size', value: '' }]
  );
  
  const [specs, setSpecs] = useState<{key: string, value: string}[]>(
    initialData.specs ? 
      Object.entries(initialData.specs).map(([key, value]) => ({ key, value: value as string })) : 
      [{ key: 'Weight', value: '' }]
  );
  
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    description: initialData.description || '',
    longDescription: initialData.longDescription || '',
    price: initialData.price || 0,
    salePrice: initialData.salePrice || '', // Change from null to empty string
    category: initialData.category || '',
    stock: initialData.stock || 0,
    bestseller: initialData.bestseller || false,
    featured: initialData.featured || false,
    rating: initialData.rating || 0,
    reviews: initialData.reviews || 0,
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : name === 'price' || name === 'stock' || name === 'rating' || name === 'reviews'
          ? Number(value) || 0
          : name === 'salePrice'
            ? value === '' ? '' : Number(value) || '' // Handle salePrice as empty string instead of null
            : value
    }));
  };
  
  // Helper functions for array fields
  const handleArrayChange = (
    index: number,
    value: string,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };
  
  const addArrayItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setArray([...array, '']);
  };
  
  const removeArrayItem = (
    index: number,
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.length > 1) {
      const newArray = [...array];
      newArray.splice(index, 1);
      setArray(newArray);
    }
  };
  
  // Helper functions for key-value pairs
  const handleKeyValueChange = (
    index: number,
    field: 'key' | 'value',
    value: string,
    array: {key: string, value: string}[],
    setArray: React.Dispatch<React.SetStateAction<{key: string, value: string}[]>>
  ) => {
    const newArray = [...array];
    newArray[index][field] = value;
    setArray(newArray);
  };
  
  const addKeyValueItem = (
    array: {key: string, value: string}[],
    setArray: React.Dispatch<React.SetStateAction<{key: string, value: string}[]>>
  ) => {
    setArray([...array, { key: '', value: '' }]);
  };
  
  const removeKeyValueItem = (
    index: number,
    array: {key: string, value: string}[],
    setArray: React.Dispatch<React.SetStateAction<{key: string, value: string}[]>>
  ) => {
    if (array.length > 1) {
      const newArray = [...array];
      newArray.splice(index, 1);
      setArray(newArray);
    }
  };
  
  const addVariant = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Create a new variant with default values
    const newVariant = { size: '', price: 0, stock: 0 };
    
    // Use functional update to ensure we're working with the latest state
    setVariants(currentVariants => [...currentVariants, newVariant]);
    console.log('Added new variant');
  };
  
  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = [...variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: field === 'price' || field === 'stock' ? Number(value) : value
    };
    setVariants(updatedVariants);
  };
  
  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Form submission started');
    setIsLoading(true);
    
    try {
      console.log('Preparing data...');
      
      // Prepare data for submission
      // In handleSubmit function
      const productData = {
        ...formData,
        // Convert empty string to null for API
        salePrice: formData.salePrice === '' ? null : Number(formData.salePrice) || null,
        image: mainImage || '', // Ensure image is never undefined
        // Format variants to match what the API expects
        variants: variants.map(variant => ({
          size: variant.size || '',
          price: Number(variant.price) || 0,
          stock: Number(variant.stock) || 0
        })),
        // Add additional fields
        benefits: benefits.filter(b => b.trim() !== ''),
        features: features.filter(f => f.trim() !== ''),
        usageSuggestions: usageSuggestions.filter(u => u.trim() !== ''),
        nutritionalInfo: nutritionalInfo
          .filter(item => item.key.trim() !== '' && item.value.trim() !== '')
          .reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {}),
        specs: specs
          .filter(item => item.key.trim() !== '' && item.value.trim() !== '')
          .reduce((obj, item) => ({ ...obj, [item.key]: item.value }), {}),
      };
      
      const url = isEditing 
        ? `/api/products/${initialData.id}` 
        : '/api/products';
        
      const method = isEditing ? 'PUT' : 'POST';
      
      // Add console logging to debug
      console.log('Sending product data:', JSON.stringify(productData));
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      
      // In the handleSubmit function, modify the error handling section:
      
      if (!response.ok) {
        // Get more detailed error information
        let errorMessage = `Failed to save product: ${response.status} ${response.statusText}`;
        try {
          // First check if there's any content to parse
          const text = await response.text();
          if (text && text.trim() !== '') {
            try {
              const errorData = JSON.parse(text);
              // Only log to console if there's actual content in the response
              if (errorData && Object.keys(errorData).length > 0) {
                console.error('Server response:', errorData);
                if (errorData.error) {
                  errorMessage = errorData.error;
                }
              } else {
                // Add this condition to handle empty objects
                console.error('Server returned empty response object');
              }
            } catch (jsonError) {
              // If it's not valid JSON, just log the text
              console.error('Server response (text):', text);
            }
          } else {
            // Add this condition to handle empty responses
            console.error('Server returned empty response');
          }
        } catch (parseError) {
          // If we can't even get the text, just continue with the default error message
          console.error('Error parsing response:', parseError);
        }
        
        // Display error to user instead of throwing
        alert(`Error: ${errorMessage}`);
        setIsLoading(false);
        return; // Stop execution here
      }
      
      const savedProduct = await response.json();
      console.log('Product saved successfully:', savedProduct);
      
      // Redirect to product list or edit page
      router.push(isEditing 
        ? `/admin/products/${savedProduct.id}` 
        : '/admin/products'
      );
      router.refresh();
    } catch (error) {
      console.error('Detailed error:', error);
      alert('Failed to save product. Please try again. Check console for details.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          
          <div>
            <label className="block text-sm font-medium mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              name="description"
              value={formData.description}
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
              value={formData.longDescription}
              onChange={handleChange}
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Regular Price (₹)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sale Price (₹)</label>
              <input
                type="number"
                name="salePrice"
                value={formData.salePrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            >
              <option value="">Select Category</option>
              <option value="Fruits">Fruits</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Spices & Herbs">Spices & Herbs</option>
              <option value="Herbs & Tea">Herbs & Tea</option>
              <option value="Herbs & Floral">Herbs & Floral</option>
              <option value="Superfoods">Superfoods</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
          
          <div className="flex space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                name="bestseller"
                checked={formData.bestseller}
                onChange={handleChange}
                className="h-4 w-4 text-green-600"
              />
              <label className="ml-2 text-sm">Bestseller</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
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
                value={formData.rating}
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
                value={formData.reviews}
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
            {/* Note: You'll need to modify your ImageUploader to support multiple images */}
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
      
      {/* Variants Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Product Variants</h2>
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
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Stock</label>
                    <input
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-2 py-1"
                      min="0"
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₹)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
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
                        />
                      </td>
                      <td className="px-4 py-2">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-2 py-1"
                          min="0"
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
          <p className="text-gray-500 text-sm">No variants added yet. Click &quot;Add Variant&quot; to create product variations.</p>
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